import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDbClient } from '@bidgrid/db';

const DB_TOKEN = 'DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get('DATABASE_URL', 'postgresql://bidgrid:bidgrid_dev_pass@localhost:5432/bidgrid');
        return createDbClient(url);
      },
    },
  ],
  exports: [DB_TOKEN],
})
export class DatabaseModule {}
