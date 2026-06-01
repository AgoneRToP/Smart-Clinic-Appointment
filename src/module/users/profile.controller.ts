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
    console.log('REQ.USER:', req.user);

    const response = await this.usersService.getOne(req.user.id);

    console.log('RESPONSE:', response);

    const rawUser = response?.data || response;

    console.log('RAW USER:', rawUser);

    return {
      title: 'Личный кабинет',
      user: rawUser,
    };
  }
}
