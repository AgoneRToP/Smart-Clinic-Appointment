import { Update, Start, Command, Ctx, Hears } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/module/users';
import { Appointment } from '@/module/appointments';
import { AppointmentStatuses } from '@/core/constants';

@Update()
export class TelegramUpdate {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Appointment') private readonly appointmentModel: Model<Appointment>,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    try {
      await ctx.reply(
        `👋 <b>Добро пожаловать в Smart Clinic!</b>\n\n` +
        `Чтобы связать этот аккаунт со своим профилем в клинике, отправьте вашу электронную почту в формате:\n` +
        `<code>email:axewarred@gmail.com</code>`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      console.error('Ошибка в команде /start:', err);
    }
  }

  @Command('help')
  async onHelp(@Ctx() ctx: Context): Promise<void> {
    try {
      await ctx.reply(
        `📋 <b>Доступные команды:</b>\n\n` +
        `/start — Перезапустить бота и авторизоваться\n` +
        `/myappointments — Список ваших предстоящих приемов\n` +
        `/help — Показать это меню`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      console.error('Ошибка в команде /help:', err);
    }
  }

  @Hears(/^email:.+/i)
  async onEmailBind(@Ctx() ctx: Context): Promise<void> {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      await ctx.reply('❌ Не удалось определить ваш Telegram ID.');
      return;
    }

    const messageText = (ctx.message as any)?.text || '';
    const parts = messageText.split(':');
    
    if (parts.length < 2) {
      await ctx.reply('❌ Неверный формат. Отправьте в формате: email:axewarred@gmail.com');
      return;
    }
    
    const email = parts[1].trim().toLowerCase();

    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        await ctx.reply('❌ Пользователь с таким email не найден в системе Smart Clinic.');
        return;
      }

      user.telegram_id = telegramId;
      await user.save();

      await ctx.reply(`✅ Отлично, <b>${user.full_name}</b>! Ваш аккаунт успешно привязан к Telegram-боту.`, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Ошибка привязке Telegram:', error);
      await ctx.reply('🚨 Произошла внутренняя ошибка базы данных при привязке аккаунта.');
    }
  }

  @Command('myappointments')
  async myAppointments(@Ctx() ctx: Context): Promise<void> {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      await ctx.reply('❌ Не удалось определить ваш Telegram ID.');
      return;
    }

    try {
      const user = await this.userModel.findOne({ telegram_id: telegramId }).exec();

      if (!user) {
        await ctx.reply('❌ Сначала привяжите свой аккаунт. Отправьте сообщение в формате <code>email:ваш@email.com</code>', { parse_mode: 'HTML' });
        return;
      }

      const appointments = await this.appointmentModel
        .find({ 
          patient_id: user._id as any, 
          status: { $in: [AppointmentStatuses.Pending, AppointmentStatuses.Scheduled] } 
        })
        .populate({ 
          path: 'doctor_id', 
          populate: { path: 'user_id', select: 'full_name' } 
        })
        .sort({ appointment_date: 1 })
        .exec();

      if (!appointments || appointments.length === 0) {
        await ctx.reply('📭 У вас нет активных или ожидающих приемов.');
        return;
      }

      let responseMessage = `📅 <b>Ваш список приемов</b> (Всего: ${appointments.length}):\n\n`;

      for (let i = 0; i < appointments.length; i++) {
        const apt = appointments[i];
        
        const date = new Date(apt.appointment_date).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const doctorObj = apt.doctor_id as any;
        const doctorName = doctorObj?.user_id?.full_name || 'Врач не указан';
        const roomNumber = doctorObj?.room_number || 'Не указан';
        
        const statusTranslate = apt.status === AppointmentStatuses.Pending 
          ? '⏳ Ожидает подтверждения' 
          : '✅ Подтвержден';

        responseMessage += `<b>${i + 1}. 🩺 Врач:</b> ${String(doctorName)}\n`;
        responseMessage += `🕒 <b>Время:</b> ${date}\n`;
        responseMessage += `🚪 <b>Кабинет:</b> ${String(roomNumber)}\n`;
        responseMessage += `📌 <b>Статус:</b> ${statusTranslate}\n\n`;
      }

      await ctx.reply(responseMessage, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Ошибка команды /myappointments:', error);
      await ctx.reply('🚨 Произошла ошибка при получении списка приемов.');
    }
  }
}
