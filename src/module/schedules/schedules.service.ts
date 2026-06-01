import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule } from './models';
import { CreateScheduleDto } from './dtos';
import { Doctor } from '../doctors';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Schedule.name) private readonly model: Model<Schedule>,
  ) {}

  async create(payload: CreateScheduleDto): Promise<Schedule> {
    if (payload.start_time >= payload.end_time) {
      throw new BadRequestException('Время начала работы должно быть раньше времени окончания');
    }

    const existingSchedules = await this.model.find({ doctor_id: payload.doctor_id, work_day: payload.work_day }).exec();

    for (const schedule of existingSchedules) {
      const isOverlapping = 
        (payload.start_time >= schedule.start_time && payload.start_time < schedule.end_time) ||
        (payload.end_time > schedule.start_time && payload.end_time <= schedule.end_time) ||
        (payload.start_time <= schedule.start_time && payload.end_time >= schedule.end_time);

      if (isOverlapping) {
        throw new ConflictException(
          `There is already a schedule on this day (${payload.work_day}) that overlaps with the selected time (${schedule.start_time} - ${schedule.end_time})`,
        );
      }
    }

    const newSchedule = new this.model(payload);
    return await newSchedule.save();
  }

  async findByDoctor(doctor_id: Doctor) {
    return await this.model.find({ doctor_id }).sort({ work_day: 1, start_time: 1 }).exec();
  }
}
