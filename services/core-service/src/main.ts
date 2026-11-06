import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const port = process.env.CORE_SERVICE_PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Core Service listening on port ${port}`);
}

bootstrap();
