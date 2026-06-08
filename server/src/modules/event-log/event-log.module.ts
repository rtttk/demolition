import { Global, Module } from '@nestjs/common';
import { EventLogController } from './event-log.controller';
import { EventLogService } from './event-log.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [EventLogController],
  providers: [EventLogService],
  exports: [EventLogService],
})
export class EventLogModule {}
