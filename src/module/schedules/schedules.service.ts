import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Schedule } from './models/schedule.model';
import { ManageScheduleDto } from './dtos/manage-schedule.dto';
import { Doctor } from '../doctors';
import { WeekDays } from '@/core/constants';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel('Schedule') private readonly scheduleModel: Model<Schedule>,
    @InjectModel('Doctor') private readonly doctorModel: Model<Doctor>,
  ) {}

  async saveDoctorSchedule(payload: ManageScheduleDto, userId: string) {
    const doctor = await this.doctorModel.findOne({ user_id: userId as any }).exec();
    if (!doctor) throw new NotFoundException('Врач не найден');

    await this.scheduleModel.deleteMany({ doctor_id: doctor._id as any }).exec();

    const schedulePromises = payload.work_days.map((day) => {
      return this.scheduleModel.create({
        doctor_id: new Types.ObjectId(doctor.id) as unknown as Doctor,
        work_day: day as unknown as WeekDays, 
        start_time: payload.start_time,
        end_time: payload.end_time,
      });
    });

    await Promise.all(schedulePromises);
    return { success: true };
  }

  async findByDoctor(doctorId: string) {
  return await this.scheduleModel
    .find({ doctor_id: doctorId as any })
    .exec();
}
}
