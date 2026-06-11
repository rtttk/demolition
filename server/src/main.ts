import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { logger } from './common/utils/logger.util';
import * as path from 'path';
import * as fs from 'fs';

// 确保 logs 目录存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 捕获 console.log/write 输出到文件
const logFile = path.join(logDir, 'app.log');
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args: any[]) => {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
  originalLog.apply(console, args);
  fs.appendFileSync(logFile, `${new Date().toISOString()} [INFO] ${msg}\n`);
};
console.error = (...args: any[]) => {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
  originalError.apply(console, args);
  fs.appendFileSync(logFile, `${new Date().toISOString()} [ERROR] ${msg}\n`);
};
console.warn = (...args: any[]) => {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
  originalWarn.apply(console, args);
  fs.appendFileSync(logFile, `${new Date().toISOString()} [WARN] ${msg}\n`);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // 全局响应拦截器 - 统一返回 { code, message, data } 格式
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('拆除服务小程序 API')
    .setDescription('拆除服务信息撮合平台后端API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.info(`Application running on: http://localhost:${port}`);
  logger.info(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
