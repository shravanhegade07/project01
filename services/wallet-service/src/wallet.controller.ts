import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TopUpSchema, CreateHoldSchema, TopUpInput, CreateHoldInput } from '@bidgrid/contracts';

@Controller('v1/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':userId')
  async getWallet(@Param('userId') userId: string) {
    return this.walletService.getOrCreateWallet(userId);
  }

  @Post(':userId/topup')
  async topUp(@Param('userId') userId: string, @Body() body: TopUpInput) {
    const validated = TopUpSchema.parse(body);
    return this.walletService.topUp(userId, validated);
  }

  @Post('holds')
  async createHold(@Body() body: CreateHoldInput) {
    const validated = CreateHoldSchema.parse(body);
    return this.walletService.createHold(validated);
  }
}
