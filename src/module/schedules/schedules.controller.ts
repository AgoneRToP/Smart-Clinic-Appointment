import { Body, Controller, Get, Post, Render, Req, Res, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { ManageScheduleDto } from './dtos/manage-schedule.dto'; // Путь к вашему DTO
import { Protected, Roles } from '@/common/decorators';
import { AuthGuard, RolesGuard } from '@/common/guards';
import { UserRoles } from '@/core/constants';
import type { Response } from 'express';

@Controller('schedules')
@UseGuards(AuthGuard, RolesGuard)
@Protected(true)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('manage')
  @Roles([UserRoles.Doctor])
  @Render('schedules/manage-schedule')
  renderScheduleForm() {
    return { title: 'Настройка расписания' };
  }

  @Post('manage')
  @Roles([UserRoles.Doctor])
  async handleManageSchedule(
    @Body() payload: ManageScheduleDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    await this.schedulesService.saveDoctorSchedule(payload, req.user._id);

    return res.redirect('/profile');
  }
}
