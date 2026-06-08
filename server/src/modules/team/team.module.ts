import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { EventLogModule } from '../event-log/event-log.module';
import { CompanyModule } from '../company/company.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, EventLogModule, CompanyModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
