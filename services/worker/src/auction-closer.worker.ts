import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { createDbClient, auctionLive, auctions, orders, escrow } from '@bidgrid/db';
import { lte, eq, and, isNull } from 'drizzle-orm';

@Injectable()
export class AuctionCloserWorker {
  private db: ReturnType<typeof createDbClient>['db'];

  constructor(private configService: ConfigService) {
    const { db } = createDbClient(
      configService.get('DATABASE_URL', 'postgresql://bidgrid:bidgrid_dev_pass@localhost:5432/bidgrid'),
    );
    this.db = db;
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCloseAuctions() {
    const now = new Date();

    // Find live auctions whose endAt has passed using FOR UPDATE SKIP LOCKED
    try {
      await this.db.transaction(async (tx) => {
        const expiredAuctions = await tx
          .select()
          .from(auctionLive)
          .where(and(eq(auctionLive.status, 'live'), lte(auctionLive.endAt, now)))
          .limit(10);

        for (const auction of expiredAuctions) {
          const reserveMet =
            !auction.reservePricePaise || auction.currentPricePaise >= auction.reservePricePaise;
          const status = reserveMet && auction.leaderId ? 'sold' : 'unsold';

          // Update auction live
          await tx
            .update(auctionLive)
            .set({ status, updatedAt: now })
            .where(eq(auctionLive.auctionId, auction.auctionId));

          // Update core auction
          await tx
            .update(auctions)
            .set({
              status,
              currentPricePaise: auction.currentPricePaise,
              bidCount: auction.bidCount,
              winnerId: reserveMet ? auction.leaderId : null,
              updatedAt: now,
            })
            .where(eq(auctions.id, auction.auctionId));

          // If sold, create order in escrow
          if (status === 'sold' && auction.leaderId) {
            const feePaise = (auction.currentPricePaise * BigInt(5)) / BigInt(100);
            await tx.insert(orders).values({
              auctionId: auction.auctionId,
              buyerId: auction.leaderId,
              sellerId: auction.sellerId,
              amountPaise: auction.currentPricePaise,
              feePaise,
              status: 'paid_in_escrow',
            });
          }
        }
      });
    } catch (error) {
      console.error('Error closing auctions:', error);
    }
  }
}
