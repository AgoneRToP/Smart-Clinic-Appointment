import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AppointmentsModule,
  AuthModule,
  DepartmentsModule,
  DoctorsModule,
  UsersModule,
} from './module';
import { ConfigModule } from '@nestjs/config';
import configuration from './core/config/configuration';
import { AuthGuard, RolesGuard } from './common/guards';
import { APP_GUARD } from '@nestjs/core';
import { SchedulesMudule } from './module/schedules';
import { TelegramModule } from './bot';
import { AppController } from './app.controller';
import { NextFunction } from 'express';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.testing' : '.env',
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGO_URL as string),
    AuthModule,
    UsersModule,
    DoctorsModule,
    SchedulesMudule,
    DepartmentsModule,
    AppointmentsModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        // Каждый раз, когда вы обновляете страницу, этот код покажет, 
        // какой роут сейчас обрабатывает Express под капотом NestJS
        console.log(`📡 [ВХОДЯЩИЙ ЗАПРОС] Маршрут: ${req.method} ${req.url}`);
        next();
      })
      .forRoutes('*');
  }
}
