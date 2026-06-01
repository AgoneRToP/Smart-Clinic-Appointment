import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramUpdate } from './bot.update';
import { TelegramNotifyService } from './bot-notify.service';
import { User, UserSchema } from '@/module/users';
import { Appointment, AppointmentSchema } from '@/module/appointments';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN')!,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  providers: [TelegramUpdate, TelegramNotifyService],
  exports: [TelegramNotifyService],
})
export class TelegramModule {}
