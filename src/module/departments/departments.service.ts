import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from './models'; // Укажите правильный путь к схеме
import { CreateDepartmentDto } from './dtos/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name) private readonly departmentModel: Model<Department>,
  ) {}

  async create(payload: CreateDepartmentDto): Promise<Department> {
    const existing = await this.departmentModel.findOne({ name: payload.name }).exec();
    if (existing) {
      throw new ConflictException('A department with this name already exists');
    }

    const newDepartment = new this.departmentModel(payload);
    return await newDepartment.save();
  }

  async findAll() {
    const data = await this.departmentModel.find().sort({ name: 1 }).exec();
    return {
      success: true,
      data,
    };
  }

  async findById(id: string) {
    const department = await this.departmentModel.findById(id).exec();
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }
}
