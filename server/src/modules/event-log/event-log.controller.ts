import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('event-log')
@UseGuards(AuthGuard)
export class EventLogController {
  // 仅后台管理接口调用，暂不暴露前端接口
}
