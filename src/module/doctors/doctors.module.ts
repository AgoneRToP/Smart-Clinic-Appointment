import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Doctor, DoctorSchema } from './models';
import { UserSchema, UsersModule } from '../users';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { DepartmentsModule } from '../departments/departments.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: 'User', schema: UserSchema },
    ]),
    UsersModule,
    DepartmentsModule, 
  ],
  providers: [DoctorsService],
  controllers: [DoctorsController],
  exports: [DoctorsService],
})
export class DoctorsModule {}
