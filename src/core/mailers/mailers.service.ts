import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendActivationEmail(email: string, fullName: string, token: string): Promise<boolean> {
    const activationUrl = `http://localhost:4000/auth/activate?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '🏥 Активация аккаунта в Smart Clinic',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 5px;">
            <h2 style="color: #0d6efd; text-align: center;">Добро пожаловать в Smart Clinic!</h2>
            <p>Здравствуйте, <b>${fullName}</b>!</p>
            <p>Спасибо за регистрацию в нашей системе онлайн-записи к врачам. Для активации вашего личного кабинета, пожалуйста, нажмите на кнопку ниже:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationUrl}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Активировать аккаунт</a>
            </div>
            <p style="font-size: 12px; color: #6c757d;">Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>${activationUrl}</p>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="font-size: 12px; color: #6c757d; text-align: center;">Это автоматическое письмо, отвечать на него не нужно.</p>
          </div>
        `,
      });

      this.logger.log(`Письмо с активацией успешно отправлено на ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Не удалось отправить письмо на ${email}`, error);
      return false;
    }
  }
}
