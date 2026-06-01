import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRoles } from '@/core/constants/constants';
import { Protected } from '../decorators/protected.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isProtected = this.reflector.getAllAndOverride<boolean>(Protected, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isProtected) {
      return true;
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request & { user: any }>();
    const response = ctx.getResponse<Response>();

    const accessToken = request.signedCookies?.['accessToken'];
    const refreshToken = request.signedCookies?.['refreshToken'];

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No tokens provided');
    }

    const decoded = await this.verifyAndRefreshToken(
      accessToken,
      refreshToken,
      response,
    );

    request.user = decoded;
    return true;
  }

  private async verifyAndRefreshToken(
    accessToken: string | undefined,
    refreshToken: string | undefined,
    response: Response,
  ): Promise<{ id: string; role: UserRoles }> {
    if (accessToken) {
      try {
        return await this.verifyAccessToken(accessToken);
      } catch (error: unknown) {
        if (error instanceof TokenExpiredError && refreshToken) {
          return await this.refreshAccessToken(refreshToken, response);
        }

        if (error instanceof JsonWebTokenError) {
          throw new UnauthorizedException('Access token is invalid');
        }

        throw error;
      }
    }

    if (refreshToken) {
      return await this.refreshAccessToken(refreshToken, response);
    }

    throw new UnauthorizedException('Token not provided');
  }

  private async verifyAccessToken(
    token: string,
  ): Promise<{ id: string; role: UserRoles }> {
    try {
      const secretKey = this.configService.get<string>('jwt.access_key');
      return await this.jwtService.verifyAsync(token, { secret: secretKey });
    } catch (error) {
      console.error('🚨 Ошибка валидации токена в AuthGuard:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async refreshAccessToken(
    refreshToken: string,
    response: Response,
  ): Promise<{ id: string; role: UserRoles }> {
    try {
      const secretKey = this.configService.get<string>('jwt.refresh_key');
      const { exp, iat, ...clean } = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: secretKey,
        },
      );

      const newAccessToken = await this.generateAccessToken(clean);

      const isProd = this.configService.get('NODE_ENV') === 'production';
      response.cookie('accessToken', newAccessToken, {
        signed: true,
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        expires: new Date(
          Date.now() +
            (this.configService.get<number>('jwt.access_time') || 3600) * 1000,
        ),
      });

      return clean;
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Refresh token has expired. Please log in again.',
        );
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Refresh token is invalid');
      }
      console.error(error);
      throw new InternalServerErrorException('Token refresh failed');
    }
  }

  private async generateAccessToken(payload: {
    id: string;
    role: UserRoles;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.access_key'),
      expiresIn: `${this.configService.get<number>('jwt.access_time') || 3600}s`,
    });
  }
}
