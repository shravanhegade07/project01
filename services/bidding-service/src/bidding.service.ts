import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDbClient, auctionLive, bids, bidAttempts } from '@bidgrid/db';
import { eq, and, sql } from 'drizzle-orm';
import { PlaceBidInput } from '@bidgrid/contracts';
import { calculateMinIncrement, ANTI_SNIPE_WINDOW_MS, ANTI_SNIPE_EXTENSION_MS, MAX_SNIPE_EXTENSIONS } from '@bidgrid/shared';

@Injectable()
export class BiddingService {
  private db: ReturnType<typeof createDbClient>['db'];

  constructor(private configService: ConfigService) {
    const { db } = createDbClient(
      configService.get('DATABASE_URL', 'postgresql://bidgrid:bidgrid_dev_pass@localhost:5432/bidgrid'),
    );
    this.db = db;
  }

  async getAuctionLive(auctionId: string) {
    const [auction] = await this.db.select().from(auctionLive).where(eq(auctionLive.auctionId, auctionId)).limit(1);
    if (!auction) throw new NotFoundException('Auction live state not found');
    return auction;
  }

  async placeBid(bidderId: string, input: PlaceBidInput) {
    const amount = BigInt(input.amountPaise);

    // Idempotency check in bids table
    const [existing] = await this.db
      .select()
      .from(bids)
      .where(and(eq(bids.bidderId, bidderId), eq(bids.idempotencyKey, input.idempotencyKey)))
      .limit(1);

    if (existing) {
      return { success: true, bid: existing, duplicate: true };
    }

    // Transaction with SELECT FOR UPDATE on auction_live row
    return await this.db.transaction(async (tx) => {
      const [auction] = await tx
        .select()
        .from(auctionLive)
        .where(eq(auctionLive.auctionId, input.auctionId))
        .for('update')
        .limit(1);

      if (!auction) {
        throw new NotFoundException('Auction not found');
      }

      if (auction.status !== 'live' || new Date() > auction.endAt) {
        throw new BadRequestException('Auction is not live or has ended');
      }

      if (auction.sellerId === bidderId) {
        throw new BadRequestException('Sellers cannot bid on their own items');
      }

      const minIncrement = calculateMinIncrement(auction.currentPricePaise);
      const minRequired = auction.bidCount === 0 ? auction.currentPricePaise : auction.currentPricePaise + minIncrement;

      if (amount < minRequired) {
        await tx.insert(bidAttempts).values({
          auctionId: input.auctionId,
          bidderId,
          amountPaise: amount,
          idempotencyKey: input.idempotencyKey,
          status: 'rejected',
          rejectReason: 'BID_TOO_LOW',
        });
        throw new BadRequestException(`Bid must be at least ${minRequired}`);
      }

      const newSeq = auction.bidCount + 1;

      // Anti-sniping check
      let newEndAt = auction.endAt;
      let newSnipeCount = auction.snipeCount;
      const timeLeft = auction.endAt.getTime() - Date.now();
      if (timeLeft <= auction.snipeWindowMs && auction.snipeCount < auction.maxSnipeExtensions) {
        newEndAt = new Date(auction.endAt.getTime() + auction.snipeExtensionMs);
        newSnipeCount += 1;
      }

      const [newBid] = await tx
        .insert(bids)
        .values({
          auctionId: input.auctionId,
          bidderId,
          amountPaise: amount,
          seq: newSeq,
          holdId: crypto.randomUUID(), // Placeholder for wallet hold ID
          idempotencyKey: input.idempotencyKey,
          isWinning: true,
        })
        .returning();

      // Update previous winning bid to not winning
      if (auction.leaderId) {
        await tx
          .update(bids)
          .set({ isWinning: false })
          .where(and(eq(bids.auctionId, input.auctionId), eq(bids.bidderId, auction.leaderId)));
      }

      await tx
        .update(auctionLive)
        .set({
          currentPricePaise: amount,
          bidCount: newSeq,
          leaderId: bidderId,
          endAt: newEndAt,
          snipeCount: newSnipeCount,
          version: auction.version + 1,
          updatedAt: new Date(),
        })
        .where(eq(auctionLive.auctionId, input.auctionId));

      await tx.insert(bidAttempts).values({
        auctionId: input.auctionId,
        bidderId,
        amountPaise: amount,
        idempotencyKey: input.idempotencyKey,
        status: 'accepted',
      });

      return { success: true, bid: newBid };
    });
  }
}
