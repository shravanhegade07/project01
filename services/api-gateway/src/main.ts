import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3010',
    credentials: true,
  });

  const port = process.env.API_GATEWAY_PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`API Gateway listening on port ${port}`);
}

bootstrap();
