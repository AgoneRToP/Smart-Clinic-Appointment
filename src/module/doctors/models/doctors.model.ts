import { DoctorExperience, DoctorSpecializations } from '@/core/constants';
import { User } from '@/module/users';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'doctors' })
export class Doctor {
  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(DoctorSpecializations),
    required: true,
  })
  specialization: DoctorSpecializations;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(DoctorExperience),
    required: true,
  })
  experience: DoctorExperience;

  @Prop({ type: SchemaTypes.String, required: true })
  room_number: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user_id: User;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
