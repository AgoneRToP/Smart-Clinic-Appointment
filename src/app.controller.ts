import { Controller, Get, Render } from '@nestjs/common';
import { Protected } from '@/common/decorators';
import { DoctorsService } from './module/doctors/doctors.service';

@Controller()
export class AppController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @Protected(false)
  @Render('index')
  getHome() {
    return { title: 'Главная' };
  }

  @Get('doctors')
  @Protected(false)
  @Render('doctors')
  async getDoctorsPage() {
    const doctorsData = await this.doctorsService.findAll();
    return {
      title: 'Наши специалисты',
      doctors: doctorsData.data,
    };
  }
}
