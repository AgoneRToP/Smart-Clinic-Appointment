import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'departments' })
export class Department {
  @Prop({
    type: SchemaTypes.String,
    required: true,
    minlength: 1,
    maxlength: 255,
    unique: true,
  })
  name: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
