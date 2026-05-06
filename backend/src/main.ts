import { createServer } from 'http';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const port = parseInt(process.env.PORT || '3001', 10);

// Start HTTP server immediately — health check responds before NestJS boots
const server = createServer((req, res) => {
  if (req.url === '/api/v1/health' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  res.writeHead(503, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Starting up...' }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});

// Bootstrap NestJS and attach to the same server once ready
async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('GitHub Projects Hub API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  console.log('NestJS ready');
}

bootstrap().catch((err) => console.error('NestJS bootstrap failed:', err));
