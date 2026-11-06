import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { BiddingController } from './bidding.controller';
import { BiddingService } from './bidding.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController, BiddingController],
  providers: [BiddingService],
})
export class AppModule {}
