import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ManageScheduleDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Выберите хотя бы один рабочий день' })
  work_days: string[];
  
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;
}
