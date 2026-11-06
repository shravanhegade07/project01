import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { AuctionModule } from './auction/auction.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { NotificationModule } from './notification/notification.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
    AuctionModule,
    OrderModule,
    NotificationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
