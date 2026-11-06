import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDbClient, auctions, auctionImages, categories } from '@bidgrid/db';
import { eq, and, gte, lte, desc, asc, ilike } from 'drizzle-orm';
import { CreateAuctionInput, AuctionFilterInput } from '@bidgrid/contracts';

@Injectable()
export class AuctionService {
  private db: ReturnType<typeof createDbClient>['db'];

  constructor(private configService: ConfigService) {
    const { db } = createDbClient(
      configService.get('DATABASE_URL', 'postgresql://bidgrid:bidgrid_dev_pass@localhost:5432/bidgrid'),
    );
    this.db = db;
  }

  async createAuction(sellerId: string, input: CreateAuctionInput, imageUrls: string[] = []) {
    const startingPrice = BigInt(input.startingPricePaise);
    const reservePrice = input.reservePricePaise ? BigInt(input.reservePricePaise) : null;
    const buyItNowPrice = input.buyItNowPricePaise ? BigInt(input.buyItNowPricePaise) : null;

    const startAt = input.scheduledStartAt ? new Date(input.scheduledStartAt) : new Date();
    const endAt = new Date(startAt.getTime() + input.durationDays * 24 * 60 * 60 * 1000);

    const [auction] = await this.db
      .insert(auctions)
      .values({
        sellerId,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        status: input.scheduledStartAt ? 'scheduled' : 'live',
        startingPricePaise: startingPrice,
        reservePricePaise: reservePrice,
        buyItNowPricePaise: buyItNowPrice,
        currentPricePaise: startingPrice,
        startAt,
        endAt,
        durationDays: input.durationDays,
      })
      .returning();

    if (imageUrls.length > 0) {
      await this.db.insert(auctionImages).values(
        imageUrls.map((url, idx) => ({
          auctionId: auction.id,
          url,
          sortOrder: idx,
        })),
      );
    }

    return auction;
  }

  async getAuctionById(id: string) {
    const [auction] = await this.db.select().from(auctions).where(eq(auctions.id, id)).limit(1);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const images = await this.db
      .select()
      .from(auctionImages)
      .where(eq(auctionImages.auctionId, id))
      .orderBy(asc(auctionImages.sortOrder));

    return { ...auction, images };
  }

  async listAuctions(filters: AuctionFilterInput) {
    const conditions = [];
    if (filters.categoryId) {
      conditions.push(eq(auctions.categoryId, filters.categoryId));
    }
    if (filters.status) {
      conditions.push(eq(auctions.status, filters.status));
    }

    const query = this.db.select().from(auctions);
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const limit = filters.limit ?? 20;
    const offset = ((filters.page ?? 1) - 1) * limit;

    const items = await query.limit(limit).offset(offset).orderBy(desc(auctions.createdAt));
    return { items, page: filters.page ?? 1, limit };
  }

  async cancelAuction(auctionId: string, sellerId: string) {
    const [auction] = await this.db.select().from(auctions).where(eq(auctions.id, auctionId)).limit(1);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    if (auction.sellerId !== sellerId) {
      throw new ForbiddenException('Not auction owner');
    }
    if (auction.bidCount > 0) {
      throw new BadRequestException('Cannot cancel auction with existing bids');
    }

    const [updated] = await this.db
      .update(auctions)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(auctions.id, auctionId))
      .returning();

    return updated;
  }
}
