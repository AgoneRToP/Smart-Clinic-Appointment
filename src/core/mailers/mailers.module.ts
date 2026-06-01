import { Module } from '@nestjs/common';
import { MailService } from './mailers.service';

@Module({
  providers: [MailService],
  exports: [MailService], 
})
export class MailModule {}
