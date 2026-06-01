import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/module/users';

@Injectable()
export class TelegramNotifyService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async sendNotificationToUser(userId: string, message: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();

    if (!user || !user.telegram_id) {
      return false;
    }

    try {
      await this.bot.telegram.sendMessage(user.telegram_id, message, { parse_mode: 'HTML' });
      return true;
    } catch (error) {
      console.error('Ошибка отправки уведомления в Telegram:', error);
      return false;
    }
  }
}
