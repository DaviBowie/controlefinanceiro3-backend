import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Todas as rotas ficam sob /api (ex.: /api/despesas, /api/ia/chat).
  app.setGlobalPrefix('api');

  // Validacao automatica de todos os DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades nao declaradas no DTO
      forbidNonWhitelisted: true, // rejeita pedidos com propriedades a mais
      transform: true, // converte payloads para instancias tipadas
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:5173'),
    credentials: true,
  });

  const port = config.get<number>('PORT', 8000);
  await app.listen(port);
  Logger.log(`Backend a correr em http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
