import { Protected, Roles } from '@/common/decorators';
import { UserRoles } from '@/core/constants';
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Render,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, RolesGuard } from '@/common/guards';
import { ChangeRoleDto } from './dtos';

@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Protected(true)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Protected(true)
  @Roles([UserRoles.Doctor, UserRoles.Admin])
  @Get()
  async getAll() {
    return await this.service.getAll();
  }

  @Post('change-role')
  @Roles([UserRoles.Admin])
  async changeRole(@Body() changeRoleDto: ChangeRoleDto) {
    const updatedUser = await this.service.changeUserRole(changeRoleDto);

    return {
      success: true,
      message: `User role ${updatedUser.full_name} successfully changed to ${updatedUser.role}`,
    };
  }

  @Protected(true)
  @Roles([UserRoles.Doctor, UserRoles.Admin])
  @Patch('/:id/profile-image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @Param('id', ParseObjectIdPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1000 * 1024 }),
          new FileTypeValidator({ fileType: ' /(jpg|jpeg|png|webp)$/' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.service.updateProfile(id, file);
  }
}

// @Controller()
// export class ProfileController {
//   constructor(private readonly usersService: UsersService) {}

//   @Get('profile')
//   @UseGuards(AuthGuard)
//   @Protected(true)
//   @Render('user/profile')
//   async getProfile(@Req() req: any) {
//     const response = await this.usersService.getOne(req.user.id);
    
//     const rawUser = response?.data || response;

//     const cleanUser = rawUser ? JSON.parse(JSON.stringify(rawUser)) : null;

//     return {
//       title: 'Личный кабинет',
//       user: cleanUser,
//     };
//   }
// }