import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { UserRoles } from '@/core/constants';

export class ChangeRoleDto {
  @IsMongoId({ message: 'Invalid user ID' })
  @IsNotEmpty({ message: 'User ID required' })
  userId: string;

  @IsEnum(UserRoles, { message: 'Non-existent role specified' })
  @IsNotEmpty({ message: 'Role required' })
  role: UserRoles;
}