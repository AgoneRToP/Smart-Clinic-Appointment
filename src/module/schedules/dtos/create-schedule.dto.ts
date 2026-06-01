import { IsEnum, IsMongoId, IsNotEmpty, Matches } from 'class-validator';
import { WeekDays } from '@/core/constants';
import { Doctor } from '@/module/doctors';

export class CreateScheduleDto {
  @IsMongoId({ message: 'Invalid doctor ID' })
  @IsNotEmpty({ message: 'Doctor ID is required' })
  doctor_id: Doctor;

  @IsEnum(WeekDays, { message: 'Specified non-existent day of the week' })
  @IsNotEmpty({ message: 'Working day required' })
  work_day: WeekDays;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'The start time must be in HH:mm format (for example, 08:00)',
  })
  @IsNotEmpty({ message: 'Start time is requiredВремя начала обязательно' })
  start_time: string;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'The end time must be in the format HH:mm (for example, 17:00)',
  })
  @IsNotEmpty({ message: 'End time required' })
  end_time: string;
}
