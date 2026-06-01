import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dtos';
import { Protected, Roles } from '@/common/decorators';
import { AuthGuard, RolesGuard } from '@/common/guards';
import { AppointmentStatuses, UserRoles } from '@/core/constants';
import { DateValidationPipe, ParseAppointmentIdPipe } from '@/common/pipes';
import { DoctorsService } from '../doctors/doctors.service';
import { Doctor } from '../doctors';
import { UsersService } from '../users/users.service';

@Controller('appointments')
@UseGuards(AuthGuard, RolesGuard)
@Protected(true)
export class AppointmentsController {
  constructor(
    private readonly service: AppointmentsService,
    private readonly doctorsService: DoctorsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('book')
  @Roles([UserRoles.Doctor])
  @Render('appointments/book')
  async renderBookForm() {
    const usersResponse = await this.usersService.getAll();
    const rawUsers = usersResponse?.data || usersResponse;

    return {
      title: 'Оформление приема',
      patients: rawUsers ? JSON.parse(JSON.stringify(rawUsers)) : [],
    };
  }

  @Post('book')
  @Roles([UserRoles.Doctor])
  async bookAppointment(
    @Body() payload: CreateAppointmentDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    new DateValidationPipe().transform(payload.appointment_date);

    const doctor = await this.doctorsService.findOneByUserId(req.user._id);

    payload.doctor_id = doctor._id.toString() as unknown as Doctor;

    await this.service.create(payload, payload.patient_id);

    return res.redirect('/profile');
  }

  // 1. Отображение формы заявки для Пациента
  @Get('patient-book')
  @Roles([UserRoles.Patient])
  @Render('appointments/patient-book')
  async renderPatientBookForm() {
    const doctorsResponse = await this.doctorsService.findAll();
    const rawDoctors = doctorsResponse?.data || doctorsResponse;

    return {
      title: 'Оставить заявку',
      doctors: rawDoctors ? JSON.parse(JSON.stringify(rawDoctors)) : [],
    };
  }

  @Post('patient-request')
  @Roles([UserRoles.Patient])
  async createPatientRequest(
    @Body() payload: any,
    @Req() req: any,
    @Res() res: any,
  ) {
    await this.service.create(
      {
        doctor_id: payload.doctor_id,
        appointment_date: new Date().toISOString(),
        comment: payload.comment || 'Заявка от пациента',
        patient_id: req.user._id,
      },
      req.user._id,
    );

    return res.redirect('/profile');
  }

  @Get('my-history')
  @Roles([UserRoles.Patient])
  @Render('appointments/my-history')
  async getMyHistory(@Req() req: any) {
    const appointmentsData = await this.service.findByPatient(req.user._id);

    const cleanAppointments = appointmentsData
      ? JSON.parse(JSON.stringify(appointmentsData))
      : [];

    cleanAppointments.forEach((apt: any) => {
      if (apt.appointment_date) {
        apt.appointment_date = new Date(apt.appointment_date).toLocaleString(
          'ru-RU',
          {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          },
        );
      }
    });

    return {
      title: 'Мои записи',
      appointments: cleanAppointments,
    };
  }

  @Get('doctor-list')
  @Roles([UserRoles.Doctor])
  @Render('appointments/doctor-appointments')
  async renderDoctorList(@Req() req: any) {
    const doctor = await this.doctorsService.findOneByUserId(req.user._id);

    const appointmentsData = await this.service.findByDoctor(doctor._id);
    const cleanAppointments = appointmentsData
      ? JSON.parse(JSON.stringify(appointmentsData))
      : [];

    cleanAppointments.forEach((apt: any) => {
      // 1. Форматируем дату
      if (apt.appointment_date) {
        apt.appointment_date = new Date(apt.appointment_date).toLocaleString('ru-RU');
      }
      
      if (apt.status) {
        apt.status = String(apt.status).toLowerCase();
      }
    });

    return {
      title: 'Журнал приемов',
      appointments: cleanAppointments,
    };
  }


  @Post(':id/status')
  @Roles([UserRoles.Doctor, UserRoles.Admin])
  async changeStatus(
    @Param('id', ParseAppointmentIdPipe) id: string,
    @Body('status') status: AppointmentStatuses,
    @Body('appointment_date') appointment_date: string, // ЗАБИРАЕМ ДАТУ ОТ ВРАЧА
    @Res() res: any,
  ) {
    await this.service.updateStatus(id, status, appointment_date);
    return res.redirect('/appointments/doctor-list');
  }
}
