import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor } from './models';
import { User } from '@/module/users';
import { CreateDoctorDto } from './dtos';
import { UserRoles } from '@/core/constants';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async assignDoctor(payload: CreateDoctorDto): Promise<Doctor> {
    const user = await this.userModel.findById(payload.user_id).exec();
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const doctorExists = await this.doctorModel.findOne({ user_id: payload.user_id }).exec();
    if (doctorExists) {
      throw new ConflictException('Этот пользователь уже является доктором');
    }

    user.role = UserRoles.Doctor;
    await user.save();

    const newDoctor = new this.doctorModel({
      specialization: payload.specialization,
      experience: payload.experience,
      room_number: payload.room_number,
      user_id: payload.user_id,
    });

    return await newDoctor.save();
  }

  async findAll() {
    const data = await this.doctorModel
      .find()
      .populate('user_id', 'full_name email')
      .exec();
      
    return {
      success: true,
      data
    };
  }
}
