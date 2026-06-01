import { Controller, Get, Req, Render, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Protected } from '@/common/decorators';
import { AuthGuard } from '@/common/guards';

@Controller()
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  @Protected(true)
  @Render('user/profile')
  async getProfile(@Req() req: any) {

    return {
      title: 'Личный кабинет',
      user: req.user, 
    };
  }
}
