import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDbClient, wallets, holds, ledgerEntries } from '@bidgrid/db';
import { eq, and } from 'drizzle-orm';
import { TopUpInput, CreateHoldInput } from '@bidgrid/contracts';
import { HOLD_EXPIRY_MS } from '@bidgrid/shared';

@Injectable()
export class WalletService {
  private db: ReturnType<typeof createDbClient>['db'];

  constructor(private configService: ConfigService) {
    const { db } = createDbClient(
      configService.get('DATABASE_URL', 'postgresql://bidgrid:bidgrid_dev_pass@localhost:5432/bidgrid'),
    );
    this.db = db;
  }

  async getOrCreateWallet(userId: string) {
    const [existing] = await this.db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    if (existing) return existing;

    const [created] = await this.db
      .insert(wallets)
      .values({
        userId,
        availablePaise: BigInt(0),
        heldPaise: BigInt(0),
      })
      .returning();
    return created;
  }

  async topUp(userId: string, input: TopUpInput) {
    const wallet = await this.getOrCreateWallet(userId);
    const amount = BigInt(input.amountPaise);
    const newBalance = wallet.availablePaise + amount;

    const [updated] = await this.db
      .update(wallets)
      .set({
        availablePaise: newBalance,
        version: wallet.version + 1,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, wallet.id))
      .returning();

    await this.db.insert(ledgerEntries).values({
      walletId: wallet.id,
      type: 'top_up',
      amountPaise: amount,
      balanceAfterPaise: newBalance,
      referenceId: wallet.id,
      referenceType: 'wallet',
      description: 'Wallet top-up',
    });

    return updated;
  }

  async createHold(input: CreateHoldInput) {
    const [wallet] = await this.db.select().from(wallets).where(eq(wallets.id, input.walletId)).limit(1);
    if (!wallet) throw new NotFoundException('Wallet not found');

    const amount = BigInt(input.amountPaise);
    if (wallet.availablePaise < amount) {
      throw new BadRequestException('Insufficient available balance for bid hold');
    }

    const expiresAt = new Date(Date.now() + HOLD_EXPIRY_MS);

    // Deduct from available, add to held
    const newAvailable = wallet.availablePaise - amount;
    const newHeld = wallet.heldPaise + amount;

    await this.db
      .update(wallets)
      .set({
        availablePaise: newAvailable,
        heldPaise: newHeld,
        version: wallet.version + 1,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, wallet.id));

    const [hold] = await this.db
      .insert(holds)
      .values({
        walletId: wallet.id,
        auctionId: input.auctionId,
        bidderId: input.bidderId,
        amountPaise: amount,
        status: 'pending',
        idempotencyKey: input.idempotencyKey,
        expiresAt,
      })
      .returning();

    await this.db.insert(ledgerEntries).values({
      walletId: wallet.id,
      type: 'hold',
      amountPaise: -amount,
      balanceAfterPaise: newAvailable,
      referenceId: hold.id,
      referenceType: 'hold',
      description: `Hold for auction ${input.auctionId}`,
    });

    return hold;
  }
}
