import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class DateValidationPipe implements PipeTransform {
  transform(value: any) {
    const inputDate = new Date(value);

    if (isNaN(inputDate.getTime())) {
      throw new BadRequestException('Incorrect date format');
    }

    if (inputDate < new Date()) {
      throw new BadRequestException('You cannot make an appointment for a past date or time.');
    }

    return inputDate;
  }
}
