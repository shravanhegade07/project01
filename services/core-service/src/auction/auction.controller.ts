import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionSchema, AuctionFilterSchema, CreateAuctionInput, AuctionFilterInput } from '@bidgrid/contracts';

@Controller('v1/auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  async create(@Body() body: any) {
    // For demo/dev, sellerId is passed in body or extracted from JWT guard in production
    const { sellerId, imageUrls, ...rest } = body;
    const validated = CreateAuctionSchema.parse(rest);
    return this.auctionService.createAuction(sellerId, validated, imageUrls ?? []);
  }

  @Get()
  async list(@Query() query: any) {
    const filters = AuctionFilterSchema.parse({
      ...query,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });
    return this.auctionService.listAuctions(filters);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.auctionService.getAuctionById(id);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Body() body: { sellerId: string }) {
    return this.auctionService.cancelAuction(id, body.sellerId);
  }
}
