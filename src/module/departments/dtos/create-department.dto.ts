import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString({ message: 'The branch name must be a string' })
  @MinLength(2, { message: 'The name of the department must be at least 2 characters' })
  @MaxLength(100, { message: 'The name of the department should not exceed 100 characters' })
  @IsNotEmpty({ message: 'The name of the department is required.' })
  name: string;
}
