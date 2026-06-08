import { Module } from '@nestjs/common';
import { DemandController } from './demand.controller';
import { DemandService } from './demand.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DemandController],
  providers: [DemandService],
  exports: [DemandService],
})
export class DemandModule {}
