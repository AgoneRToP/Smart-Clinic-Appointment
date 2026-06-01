import { Body, Controller, Post, Get, UseGuards, Render } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dtos';
import { Protected, Roles } from '@/common/decorators';
import { AuthGuard, RolesGuard } from '@/common/guards';
import { UserRoles } from '@/core/constants';
import { UsersService } from '../users/users.service';

@Controller('admin/doctors')
@UseGuards(AuthGuard, RolesGuard)
@Protected(true)
export class DoctorsController {
  constructor(
    private readonly service: DoctorsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('assign')
  @Roles([UserRoles.Admin])
  async assignDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    const doctor = await this.service.assignDoctor(createDoctorDto);
    return {
      success: true,
      message: 'User successfully assigned by doctor',
      data: doctor,
    };
  }

  @Get()
  @Roles([UserRoles.Admin])
  async getAllDoctors() {
    return await this.service.findAll();
  }

  @Get('management')
  @Roles([UserRoles.Admin])
  @Render('admin/doctors-management')
  async renderManagementPanel() {
    const users = await this.usersService.getAll();
    const doctors = await this.service.findAll();
    return { users: users.data, doctors: doctors.data };
  }
}
