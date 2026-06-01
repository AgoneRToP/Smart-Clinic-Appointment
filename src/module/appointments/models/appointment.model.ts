import { AppointmentStatuses } from '@/core/constants';
import { Doctor } from '@/module/doctors';
import { User } from '@/module/users';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'appointments' })
export class Appointment {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  patient_id: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Doctor', required: true })
  doctor_id: Doctor;

  @Prop({ type: SchemaTypes.Date, required: true })
  appointment_date: Date;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(AppointmentStatuses),
    default: AppointmentStatuses.Pending,
  })
  status: AppointmentStatuses;

  @Prop({ type: String, required: false, default: 'Заявка от пациента' })
  comment: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
