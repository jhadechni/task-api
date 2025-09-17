import { webcrypto } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import serverless from 'serverless-http';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

// Polyfills de Crypto para entornos que lo requieran
if (!global.crypto) {
  (global as any).crypto = webcrypto;
}
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

// Variable para almacenar en caché el manejador de serverless-http
let cachedHandler: any;

// Función asíncrona para inicializar la aplicación y crear el manejador
async function bootstrap() {
  // 1. Crear la aplicación NestJS. Al no pasar un adaptador, usa Express por defecto.
  const app = await NestFactory.create(AppModule, { logger: false });

  // 2. Aplicar configuraciones globales (pipes, CORS, etc.)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 3. Inicializar la aplicación.
  await app.init();

  // 4. Obtener la instancia de Express subyacente.
  const expressApp = app.getHttpAdapter().getInstance();

  // 5. Crear y devolver el manejador de serverless-http.
  return serverless(expressApp);
}

// Handler principal de AWS Lambda
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // Si el manejador no está en caché, lo creamos y lo guardamos.
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }

  // Usamos el manejador en caché para procesar el evento.
  return cachedHandler(event, context);
};