import { Controller, Get, Query, Render } from '@nestjs/common';
import { Protected } from '@/common/decorators';
import { DoctorsService } from './module/doctors/doctors.service';
import { SchedulesService } from './module/schedules/schedules.service';

@Controller()
export class AppController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly schedulesService: SchedulesService,
  ) {}

  @Get()
  @Protected(false)
  @Render('index')
  async getHome(@Query('search') search?: string) {
    const doctorsResponse = await this.doctorsService.findAll();
    const rawDoctors = doctorsResponse?.data || doctorsResponse;
    let doctors = rawDoctors ? JSON.parse(JSON.stringify(rawDoctors)) : [];

    if (search) {
      const query = search.toLowerCase();
      doctors = doctors.filter((doc: any) => 
        doc.specialization.toLowerCase().includes(query) || 
        doc.user_id?.full_name?.toLowerCase().includes(query)
      );
    }

    for (const doc of doctors) {
      const schedules = await this.schedulesService.findByDoctor(doc._id);
      doc.working_hours = schedules ? JSON.parse(JSON.stringify(schedules)) : [];
    }

    return { 
      title: 'Поиск специалистов', 
      doctors,
      searchQuery: search || ''
    };
  }
}
