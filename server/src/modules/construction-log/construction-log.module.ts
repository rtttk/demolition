import { Module } from '@nestjs/common';
import { ConstructionLogController } from './construction-log.controller';
import { ConstructionLogService } from './construction-log.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ConstructionLogController],
  providers: [ConstructionLogService],
  exports: [ConstructionLogService],
})
export class ConstructionLogModule {}
