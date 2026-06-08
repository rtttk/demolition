import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { EventLogModule } from '../event-log/event-log.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, EventLogModule],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
