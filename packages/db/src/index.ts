import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as coreSchema from './schemas/core.js';
import * as biddingSchema from './schemas/bidding.js';
import * as walletSchema from './schemas/wallet.js';

export function createDbClient(connectionString?: string) {
  const url =
    connectionString ??
    process.env['DATABASE_URL'] ??
    'postgresql://bidgrid:bidgrid_dev_pass@localhost:5432/bidgrid';

  const client = postgres(url);
  const db = drizzle(client, {
    schema: { ...coreSchema, ...biddingSchema, ...walletSchema },
  });

  return { db, client };
}

export * from './schemas/core.js';
export * from './schemas/bidding.js';
export * from './schemas/wallet.js';
export type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
