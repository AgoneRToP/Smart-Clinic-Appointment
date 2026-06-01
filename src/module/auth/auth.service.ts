import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users';
import { Model } from 'mongoose';
import { LoginDto, RegisterDto } from './dtos';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRoles, UserStatuses } from '@/core/constants/constants';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { MailService } from '@/core/mailers/mailers.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async login(payload: LoginDto, res: Response) {
    const existing = await this.userModel.findOne({ email: payload.email });

    if (!existing) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isSame = await this.comparePass(payload.password, existing.password);

    if (!isSame) {
      throw new UnauthorizedException('Неверный пароль');
    }

    const tokenPayload = { id: existing.id, role: existing.role };
    const accessToken = await this.generateAccessToken(tokenPayload);
    const refreshToken = await this.generateRefreshToken(tokenPayload);

    const isProd = this.configService.get('NODE_ENV') === 'production';
    const accessTimeInSeconds = this.configService.get<number>('jwt.access_time') || 3600;

    res.cookie('accessToken', accessToken, {
      signed: true,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      expires: new Date(Date.now() + accessTimeInSeconds * 1000),
    });

    res.cookie('refreshToken', refreshToken, { 
      signed: true,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax'
    });

    const acceptHeader = res.req?.headers['accept'];
    if (acceptHeader && acceptHeader.includes('text/html')) {
      return res.redirect('/profile');
    }

    return res.json({
      success: true,
      data: existing,
    });
  }

  async register(payload: RegisterDto, res: Response) {
    const existing = await this.userModel.findOne({ email: payload.email });

    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует!');
    }

    const hashedPass = await this.hashPass(payload.password);

    const activationToken = await this.jwtService.signAsync(
      { email: payload.email },
      {
        secret: this.configService.get('jwt.access_key'),
        expiresIn: '15m',
      },
    );

    const user = await this.userModel.create({
      full_name: payload.full_name,
      email: payload.email,
      password: hashedPass,
      is_active: UserStatuses.Inactive,
    });

    this.mailService.sendActivationEmail(user.email, user.full_name, activationToken);

    const acceptHeader = res.req?.headers['accept'];
    if (acceptHeader && acceptHeader.includes('text/html')) {
      return res.redirect('/profile'); 
    }

    return res.json({
      success: true,
      data: existing,
    });
  }

  async activate(token: string, res: Response) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.access_key'),
      });

      const user = await this.userModel.findOne({ email: payload.email }).exec();

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      if (user.is_active === UserStatuses.Active) {
        return res.redirect('/profile');
      }

      user.is_active = UserStatuses.Active;
      await user.save();

      const tokenPayload = { id: user.id, role: user.role };
      const accessToken = await this.generateAccessToken(tokenPayload);
      const refreshToken = await this.generateRefreshToken(tokenPayload);

      const isProd = this.configService.get('NODE_ENV') === 'production';
      const accessTimeInSeconds = this.configService.get<number>('jwt.access_time') || 3600;

      res.cookie('accessToken', accessToken, {
        signed: true,
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        expires: new Date(Date.now() + accessTimeInSeconds * 1000),
      });

      res.cookie('refreshToken', refreshToken, { 
        signed: true, 
        httpOnly: true, 
        secure: isProd, 
        sameSite: 'lax' 
      });

      return res.redirect('/profile');
    } catch (error) {
      throw new BadRequestException('Ссылка недействительна или её срок действия (15 мин) истек.');
    }
  }

  private async hashPass(password: string) {
    return await bcrypt.hash(password, 10);
  }

  private async comparePass(originalPass: string, hashedPass: string) {
    return await bcrypt.compare(originalPass, hashedPass);
  }

  private async generateAccessToken(payload: { id: string; role: UserRoles }) {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.access_key'),
      expiresIn: `${this.configService.get('jwt.access_time')}s`,
    });
  }

  private async generateRefreshToken(payload: { id: string; role: UserRoles }) {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.refresh_key'),
      expiresIn: `${this.configService.get('jwt.refresh_time')}s`,
    });
  }
}
