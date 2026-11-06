import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { createDbClient, users, refreshTokens, emailTokens } from '@bidgrid/db';
import { eq } from 'drizzle-orm';
import { RegisterInput, LoginInput } from '@bidgrid/contracts';

@Injectable()
export class AuthService {
  private db: ReturnType<typeof createDbClient>['db'];

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const { db } = createDbClient(
      this.configService.get('DATABASE_URL', 'postgresql://bidgrid:bidgrid_dev_pass@localhost:5432/bidgrid'),
    );
    this.db = db;
  }

  async register(input: RegisterInput) {
    const existing = await this.db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length > 0) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const [user] = await this.db
      .insert(users)
      .values({
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
      })
      .returning();

    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 10500); // 24 hours
    await this.db.insert(emailTokens).values({
      userId: user.id,
      token: verificationToken,
      type: 'email_verification',
      expiresAt,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
      accessToken,
      refreshToken,
      verificationToken, // Returned for dev testing
    };
  }

  async login(input: LoginInput) {
    const [user] = await this.db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (!user || user.suspended) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(tokenStr: string) {
    const [stored] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenStr))
      .limit(1);

    if (!stored || stored.revokedAt || new Date() > stored.expiresAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const [user] = await this.db.select().from(users).where(eq(users.id, stored.userId)).limit(1);
    if (!user || user.suspended) {
      throw new UnauthorizedException('User not found or suspended');
    }

    // Revoke old token (rotation)
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, stored.id));

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id, stored.family);

    return { accessToken, refreshToken };
  }

  async verifyEmail(tokenStr: string) {
    const [tokenRecord] = await this.db
      .select()
      .from(emailTokens)
      .where(eq(emailTokens.token, tokenStr))
      .limit(1);

    if (!tokenRecord || tokenRecord.usedAt || new Date() > tokenRecord.expiresAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.db
      .update(emailTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailTokens.id, tokenRecord.id));

    await this.db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, tokenRecord.userId));

    return { success: true, message: 'Email verified successfully' };
  }

  private generateAccessToken(user: { id: string; email: string; role: string }): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private async generateRefreshToken(userId: string, existingFamily?: string): Promise<string> {
    const family = existingFamily ?? crypto.randomUUID();
    const token = crypto.randomUUID() + '-' + crypto.randomUUID();
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.db.insert(refreshTokens).values({
      userId,
      tokenHash,
      family,
      expiresAt,
    });

    return token;
  }
}
