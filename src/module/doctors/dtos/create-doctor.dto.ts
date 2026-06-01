import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { DoctorSpecializations, DoctorExperience } from '@/core/constants';
import { User } from '@/module/users';

export class CreateDoctorDto {
  @IsMongoId({ message: 'Invalid user ID' })
  @IsNotEmpty({ message: 'User ID required' })
  user_id: User;

  @IsEnum(DoctorSpecializations, { message: 'Specified non-existent specialization' })
  @IsNotEmpty({ message: 'Specialization is required' })
  specialization: DoctorSpecializations;

  @IsEnum(DoctorExperience, { message: 'Non-existent experience level specified' })
  @IsNotEmpty({ message: 'Experience required' })
  experience: DoctorExperience;

  @IsString({ message: 'The account number must be a string' })
  @IsNotEmpty({ message: 'Account number is required' })
  room_number: string;

  @IsMongoId({ message: 'Invalid branch ID' })
  @IsNotEmpty({ message: 'Branch is required' })
  department_id: string;
}
