import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './models';
import { CreateAppointmentDto } from './dtos';
import { AppointmentStatuses } from '@/core/constants';
import { Doctor } from '../doctors';
import { User } from '../users';
import { TelegramNotifyService } from '@/bot'; 

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    private readonly telegramNotifyService: TelegramNotifyService,
  ) {}

  async create(
    payload: CreateAppointmentDto,
    patientId: string,
  ): Promise<Appointment> {
    const { doctor_id, appointment_date } = payload;

    const timeConflict = await this.appointmentModel
      .findOne({
        doctor_id,
        appointment_date: new Date(appointment_date),
        status: { $ne: AppointmentStatuses.Canceled },
      })
      .exec();

    if (timeConflict) {
      throw new BadRequestException(
        'This time of the doctor is already occupied by another patient',
      );
    }

    const newAppointment = new this.appointmentModel({
      patient_id: patientId,
      doctor_id,
      appointment_date: new Date(appointment_date),
      status: AppointmentStatuses.Pending,
    });

    return await newAppointment.save();
  }

  async findByPatient(patientId: User) {
    return await this.appointmentModel
      .find({ patient_id: patientId })
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' },
      })
      .sort({ appointment_date: -1 })
      .exec();
  }

  async findByDoctor(doctorId: Doctor) {
    return await this.appointmentModel
      .find({ doctor_id: doctorId })
      .populate('patient_id', 'full_name email')
      .sort({ appointment_date: 1 })
      .exec();
  }

  async updateStatus(
    id: string,
    status: AppointmentStatuses,
  ): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!appointment) {
      throw new NotFoundException('No appointment found');
    }

    if (status === AppointmentStatuses.Scheduled) {
      const dateStr = new Date(appointment.appointment_date).toLocaleString(
        'ru-RU',
      );
      await this.telegramNotifyService.sendNotificationToUser(
        appointment.patient_id.toString(),
        `🎉 <b>Ваш прием подтвержден!</b>\n\n📅 Дата: ${dateStr}\n🩺 Доктор ожидает вас.`,
      );
    }

    return appointment;
  }
}
