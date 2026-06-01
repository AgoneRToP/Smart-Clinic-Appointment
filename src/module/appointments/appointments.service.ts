import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment } from './models';
import { CreateAppointmentDto } from './dtos';
import { AppointmentStatuses } from '@/core/constants';
import { Model, Types } from 'mongoose';
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
      doctor_id: payload.doctor_id,
      appointment_date: payload.appointment_date,
      status: AppointmentStatuses.Pending,
    });

    return await newAppointment.save();
  }

  async findByPatient(patientId: string) {
    return await this.appointmentModel
      .find({ patient_id: new Types.ObjectId(patientId) as any })
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' },
      })
      .sort({ appointment_date: -1 })
      .exec();
  }

  async findByDoctor(doctorId: Object) {
    return await this.appointmentModel
      .find({ doctor_id: doctorId })
      .populate('patient_id', 'full_name email')
      .sort({ appointment_date: 1 })
      .exec();
  }

  async updateStatus(id: string, status: string, appointmentDate?: string) {
    const appointment = await this.appointmentModel.findById(id).exec();
    if (!appointment) {
      throw new NotFoundException('Запись не найдена');
    }

    appointment.status = status as any;

    if (appointmentDate) {
      appointment.appointment_date = appointmentDate as any;
    }

    return await appointment.save();
  }
}
