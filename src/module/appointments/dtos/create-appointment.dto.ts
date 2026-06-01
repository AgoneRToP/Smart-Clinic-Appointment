import { Doctor } from '@/module/doctors';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsMongoId({ message: 'Invalid doctor ID' })
  @IsNotEmpty({ message: 'Choosing a doctor is mandatory' })
  doctor_id: Doctor;

  @IsString({ message: 'Incorrect date format' })
  @IsNotEmpty({ message: 'Date and time of appointment are required' })
  appointment_date: string;

  @IsString()
  @IsNotEmpty({ message: 'Выберите пациента из базы' })
  patient_id: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
