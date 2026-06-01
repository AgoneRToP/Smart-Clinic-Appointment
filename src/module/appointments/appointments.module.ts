import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './models';
import { DoctorsModule } from '../doctors';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TelegramModule } from '@/bot';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    DoctorsModule,
    TelegramModule,
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
