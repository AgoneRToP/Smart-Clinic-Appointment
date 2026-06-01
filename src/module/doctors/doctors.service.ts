import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor } from './models';
import { User } from '@/module/users';
import { CreateDoctorDto } from './dtos';
import { UserRoles, UserStatuses } from '@/core/constants';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel('Doctor') private readonly doctorModel: Model<Doctor>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async createDoctorWithAccount(payload: CreateDoctorDto): Promise<Doctor> {
    const emailExists = await this.userModel
      .findOne({ email: payload.email.toLowerCase() })
      .exec();
    if (emailExists) {
      throw new ConflictException(
        'Пользователь или врач с таким email уже зарегистрирован',
      );
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const newUser = await this.userModel.create({
      full_name: payload.full_name,
      email: payload.email.toLowerCase(),
      password: hashedPassword,
      role: UserRoles.Doctor,
      is_active: UserStatuses.Active,
    });

    const newDoctor = new this.doctorModel({
      specialization: payload.specialization,
      experience: payload.experience,
      room_number: payload.room_number,
      user_id: newUser._id,
      department_id: payload.department_id,
    });

    return await newDoctor.save();
  }

  async findOneByUserId(
    userId: string,
  ): Promise<Doctor & { _id: Types.ObjectId }> {
    const doctor = await this.doctorModel
      .findOne({ user_id: userId as any })
      .exec();

    if (!doctor) {
      throw new NotFoundException('Медицинская карточка врача не найдена');
    }

    return doctor as Doctor & { _id: Types.ObjectId };
  }

  async findAll() {
    const data = await this.doctorModel
      .find()
      .populate('user_id', 'full_name email')
      .exec();

    return {
      success: true,
      data,
    };
  }
}
