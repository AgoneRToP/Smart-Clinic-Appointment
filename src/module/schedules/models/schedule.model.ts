import { WeekDays } from '@/core/constants';
import { Doctor } from '@/module/doctors';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'schedules' })
export class Schedule {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Doctor', required: true })
  doctor_id: Doctor;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(WeekDays),
    required: true,
  })
  work_day: WeekDays;

  @Prop({ type: SchemaTypes.String, required: true })
  start_time: string;

  @Prop({ type: SchemaTypes.String, required: true })
  end_time: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
