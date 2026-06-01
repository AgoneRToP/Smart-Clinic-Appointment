import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Render,
  Res,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dtos';
import { Protected, Roles } from '@/common/decorators';
import { AuthGuard, RolesGuard } from '@/common/guards';
import { UserRoles } from '@/core/constants';
import { UsersService } from '../users/users.service';
import type { Response } from 'express';
import { DepartmentsService } from '../departments/departments.service';

@Controller('admin/doctors')
@UseGuards(AuthGuard, RolesGuard)
@Protected(true)
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly usersService: UsersService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Post('assign')
  @Roles([UserRoles.Admin])
  async assignDoctor(
    @Body() createDoctorDto: CreateDoctorDto,
    @Res() res: Response,
  ) {
    const doctor = await this.doctorsService.createDoctorWithAccount(createDoctorDto);
    return res.redirect('/admin/doctors/management');
  }

  @Get()
  @Roles([UserRoles.Admin])
  async getAllDoctors() {
    return await this.doctorsService.findAll();
  }

  @Get('management')
  @Roles([UserRoles.Admin])
  @Render('admin/doctors-management')
  async renderManagement() {
    const usersResponse = await this.usersService.getAll();
    const doctorsResponse = await this.doctorsService.findAll();
    const departmentsResponse = await this.departmentsService.findAll();

    const rawUsers = usersResponse?.data || usersResponse;
    const rawDoctors = doctorsResponse?.data || doctorsResponse;
    const rawDepartments = departmentsResponse?.data || departmentsResponse;

    const cleanUsers = rawUsers ? JSON.parse(JSON.stringify(rawUsers)) : [];
    const cleanDoctors = rawDoctors
      ? JSON.parse(JSON.stringify(rawDoctors))
      : [];
    const cleanDepartments = rawDepartments
      ? JSON.parse(JSON.stringify(rawDepartments))
      : [];

    console.log('--- ОТЛАДКА ОТДЕЛЕНИЙ В АДМИНКЕ ---');
    console.log('Сколько отделений пришло из базы:', cleanDepartments.length);
    console.log('Сами отделения:', cleanDepartments);

    return {
      title: 'Управление врачами',
      users: cleanUsers,
      doctors: cleanDoctors,
      departments: cleanDepartments,
    };
  }
}
