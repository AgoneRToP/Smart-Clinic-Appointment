import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models';
import { Model } from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ChangeRoleDto } from './dtos';
import { UserRoles, UserStatuses } from '@/core/constants';
import bcrypt from 'bcrypt';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'user-profile');

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private readonly model: Model<User>) {}

  async onModuleInit() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await this.createAdminIfNotExist();
  }

  private async createAdminIfNotExist() {
    const adminExists = await this.model
      .findOne({ role: UserRoles.Admin })
      .exec();

    if (adminExists) {
      this.logger.log('The administrator already exists in the database.');
      return;
    }

    const adminEmail = 'admin@clinic.com';
    const rawPassword = 'SuperAdminPassword123!';

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const defaultAdmin = new this.model({
      full_name: 'Chief Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: UserRoles.Admin,
      is_active: UserStatuses.Active,
    });

    await defaultAdmin.save();

    this.logger.warn('==================================================');
    this.logger.warn('THE FIRST SYSTEM ADMINISTRATOR HAS BEEN CREATED!');
    this.logger.warn(`Email: ${adminEmail}`);
    this.logger.warn(`Password: ${rawPassword}`);
    this.logger.warn('==================================================');
  }

  async getAll() {
    const data = await this.model.find().select('-password');

    return {
      success: true,
      data,
    };
  }

  async getOne(id: string) {
    const data = await this.model.findById(id).select('-password');

    if (!data) throw new NotFoundException('User not found');

    return {
      success: true,
      data,
    };
  }

  async changeUserRole(changeRoleDto: ChangeRoleDto): Promise<User> {
    const { userId, role } = changeRoleDto;

    const updatedUser = await this.model
      .findByIdAndUpdate(userId, { role }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User with this ID not found');
    }

    return updatedUser;
  }

  async updateProfile(id: string, image: Express.Multer.File) {
    const user = await this.model.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    fs.writeFile(
      path.join(
        UPLOAD_DIR,
        `${id.toString()}.${image.mimetype?.split('/').at(-1) as string}`,
      ),
      image.buffer,
    );

    return {
      success: true,
    };
  }
}
