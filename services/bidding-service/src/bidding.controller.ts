import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BiddingService } from './bidding.service';
import { PlaceBidSchema, PlaceBidInput } from '@bidgrid/contracts';

@Controller('v1/bids')
export class BiddingController {
  constructor(private readonly biddingService: BiddingService) {}

  @Get('auction/:auctionId')
  async getAuctionLive(@Param('auctionId') auctionId: string) {
    return this.biddingService.getAuctionLive(auctionId);
  }

  @Post()
  async placeBid(@Body() body: any) {
    const { bidderId, ...rest } = body;
    const validated = PlaceBidSchema.parse(rest);
    return this.biddingService.placeBid(bidderId, validated);
  }
}
