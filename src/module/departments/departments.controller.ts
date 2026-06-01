import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dtos';
import { Protected, Roles } from '@/common/decorators';
import { AuthGuard, RolesGuard } from '@/common/guards';
import { UserRoles } from '@/core/constants';
import type { Response } from 'express';

@Controller('departments')
@UseGuards(AuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @Protected(true)
  @Roles([UserRoles.Admin])
  async create(@Body() payload: CreateDepartmentDto, @Res() res: Response) {
    await this.service.create(payload);
    
    return res.redirect('/admin/doctors/management');
  }

  @Get()
  @Protected(false)
  async getAll() {
    return await this.service.findAll();
  }
}
