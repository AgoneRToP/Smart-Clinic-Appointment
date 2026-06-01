import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  LoggingInterceptor,
  ResponseTransformInterceptor,
} from './common/interceptors';
import { DatabaseExceptionFilter, HttpExceptionFilter } from './common/filters';
import hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    cookieParser(
      process.env.COOKIE_SECRET || 'my_cookie_secure_signing_secret_key',
    ),
  );

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new DatabaseExceptionFilter(),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  hbs.registerHelper('ifCond', function (this: any, v1, operator, v2, options) {
    switch (operator) {
      case '===':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '!==':
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });

  hbs.registerHelper('json', function (context) {
    return JSON.stringify(context, null, 2);
  });

  hbs.registerHelper('translateSpecialization', function (value: string) {
    const translations: Record<string, string> = {
      cardiologist: '❤️ Кардиолог',
      pediatrician: '👶 Педиатр',
      neurologist: '🧠 Невролог',
      dermatologist: '🩺 Дерматолог',
      therapist: '📋 Терапевт',
      surgeon: '🔪 Хирург',
      ophthalmologist: '👁️ Офтальмолог',
      dentist: '🦷 Стоматолог',
    };
    return translations[value] || value;
  });

  hbs.registerHelper('inc', function (value) {
    return parseInt(value) + 1;
  });

  hbs.registerHelper('or', function (/* агрументы */) {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.some(Boolean);
  });

  app.set('view options', { layout: 'layouts/main' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
bootstrap();
