import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Render,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos';
import type { Response } from 'express';
import { Protected } from '@/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Protected(false)
  @Get('/login')
  @Render('auth/login')
  renderLogin() {
    return { title: 'Авторизация' };
  }

  @Protected(false)
  @Get('/register')
  @Render('auth/register')
  renderRegister() {
    return { title: 'Регистрация' };
  }

  @Protected(false)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() payload: LoginDto, @Res() res: Response) {
    await this.service.login(payload, res);
  }

  @Protected(false)
  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() payload: RegisterDto, @Res() res: Response) {
    await this.service.register(payload, res);
  }

  @Protected(false)
  @Get('/activate')
  async activate(@Query('token') token: string, @Res() res: Response) {
    await this.service.activate(token, res);
  }
}
