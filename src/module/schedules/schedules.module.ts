import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Schedule, ScheduleSchema } from "./models";
import { SchedulesService } from "./schedules.service";
import { SchedulesController } from "./schedules.controller";
import { Doctor, DoctorSchema } from "../doctors";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
      { name: Doctor.name, schema: DoctorSchema },
    ])
  ],
  providers: [SchedulesService],
  controllers: [SchedulesController],
  exports: [SchedulesService],
})
export class SchedulesMudule {}
