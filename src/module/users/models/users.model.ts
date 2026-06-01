import { UserRoles, UserStatuses } from '@/core/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: SchemaTypes.String, required: true, minlength: 1, maxlength: 255 })
  full_name: string;

  @Prop({ type: SchemaTypes.String, required: true, unique: true })
  email: string;

  @Prop({ type: SchemaTypes.String, required: true, minlength: 8, maxlength: 255 })
  password: string;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(UserRoles),
    default: UserRoles.Patient,
  })
  role: UserRoles;

  @Prop({ type: SchemaTypes.Number, unique: true, sparse: true })
  telegram_id: number;

  @Prop({ type: SchemaTypes.String, allowNull: true })
  profile?: string;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(UserStatuses),
    defaultValue: UserStatuses.Inactive,
  })
  is_active: UserStatuses;
}

export const UserSchema = SchemaFactory.createForClass(User);
