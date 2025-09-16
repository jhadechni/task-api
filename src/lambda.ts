import { webcrypto } from 'node:crypto';

import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from 'aws-lambda';

if (!global.crypto) {
  (global as any).crypto = webcrypto;
}

if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import awsLambdaFastify from '@fastify/aws-lambda';

let cachedServer: any;

async function createNestApp() {
  const adapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app.getHttpAdapter().getInstance();
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if (!cachedServer) {
    const fastifyApp = await createNestApp();
    cachedServer = awsLambdaFastify(fastifyApp as any);
  }

  return cachedServer(event, context);
};
