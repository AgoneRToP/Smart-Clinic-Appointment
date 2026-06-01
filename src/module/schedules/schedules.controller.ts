import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dtos';
import { Protected, Roles } from '@/common/decorators';
import { AuthGuard, RolesGuard } from '@/common/guards';
import { UserRoles } from '@/core/constants';
import { Doctor } from '../doctors';

@Controller('schedules')
@UseGuards(AuthGuard, RolesGuard)
@Protected(true)
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Post()
  @Roles([UserRoles.Admin, UserRoles.Doctor])
  async createSchedule(@Body() payload: CreateScheduleDto) {
    const schedule = await this.service.create(payload);
    return {
      success: true,
      message: 'Schedule added successfully',
      data: schedule,
    };
  }

  @Get('doctor/:id')
  @Roles([UserRoles.Admin, UserRoles.Doctor, UserRoles.Patient])
  async getDoctorSchedule(@Param('id') doctorId: Doctor) {
    const data = await this.service.findByDoctor(doctorId);
    return {
      success: true,
      data,
    };
  }
}
