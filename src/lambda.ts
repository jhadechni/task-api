import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from 'aws-lambda';
import express from 'express';

let cachedServer: ReturnType<typeof createServer> | undefined;

async function createExpressServer(): Promise<express.Application> {
  const expressApp = express();

  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.use(eventContext());

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
    cachedServer = createServer(expressApp);
  }

  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
