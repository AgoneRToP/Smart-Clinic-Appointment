import { Body, Controller, Get, Param, Patch, Post, Render, Req, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dtos';
import { Protected, Roles } from '@/common/decorators';
import { AuthGuard, RolesGuard } from '@/common/guards';
import { AppointmentStatuses, UserRoles } from '@/core/constants';
import { DateValidationPipe, ParseAppointmentIdPipe } from '@/common/pipes';
import { DoctorsService } from '../doctors/doctors.service';
import { Doctor } from '../doctors';

@Controller('appointments')
@UseGuards(AuthGuard, RolesGuard)
@Protected(true)
export class AppointmentsController {
  constructor(
    private readonly service: AppointmentsService,
    private readonly doctorsService: DoctorsService, 
  ) {}

  @Get('book')
  @Roles([UserRoles.Patient])
  @Render('appointments/book')
  async renderBookForm() {
    const doctors = await this.doctorsService.findAll();
    return { doctors: doctors.data };
  }

  @Post('book')
  @Roles([UserRoles.Patient])
  async bookAppointment(
    @Body() payload: CreateAppointmentDto, 
    @Req() req: any
  ) {
    new DateValidationPipe().transform(payload.appointment_date);
    
    const appointment = await this.service.create(payload, req.user.id);
    return {
      success: true,
      message: 'The application for an appointment has been successfully sent and is awaiting confirmation from the doctor.',
      data: appointment,
    };
  }

  @Get('my-history')
  @Roles([UserRoles.Patient])
  async getMyHistory(@Req() req: any) {
    return await this.service.findByPatient(req.user.id);
  }

  @Get('doctor-list/:id')
  @Roles([UserRoles.Doctor, UserRoles.Admin])
  async getDoctorAppointments(@Param('id') doctorId: Doctor) { 
    return await this.service.findByDoctor(doctorId);
  }

  @Post(':id/status') 
  @Roles([UserRoles.Doctor, UserRoles.Admin])
  async changeStatus(
    @Param('id', ParseAppointmentIdPipe) id: string,
    @Body('status') status: AppointmentStatuses,
  ) {
    const updated = await this.service.updateStatus(id, status);
    return {
      success: true,
      message: `Reception status successfully changed to "${status}"`,
      data: updated,
    };
  }
}
