import { webcrypto } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from 'aws-lambda';
import express from 'express';

// Fix crypto issue for NestJS GraphQL
if (!global.crypto) {
  global.crypto = webcrypto as any;
}

let cachedServer: any;

async function createExpressServer(): Promise<express.Application> {
  const expressApp = express();

  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

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

  return expressApp;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if (!cachedServer) {
    const expressApp = await createExpressServer();
    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer(event, context);
};
