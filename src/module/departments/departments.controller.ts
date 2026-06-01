import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dtos';
import { Protected, Roles } from '@/common/decorators';
import { AuthGuard, RolesGuard } from '@/common/guards';
import { UserRoles } from '@/core/constants';

@Controller('departments')
@UseGuards(AuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @Protected(true)
  @Roles([UserRoles.Admin])
  async create(@Body() payload: CreateDepartmentDto) {
    const department = await this.service.create(payload);
    return {
      success: true,
      message: `Department "${department.name}" was successfully created`,
      data: department,
    };
  }

  @Get()
  @Protected(false)
  async getAll() {
    return await this.service.findAll();
  }
}
