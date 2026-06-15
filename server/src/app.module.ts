import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { TeamModule } from './modules/team/team.module';
import { DemandModule } from './modules/demand/demand.module';
import { QuoteModule } from './modules/quote/quote.module';
import { OrderModule } from './modules/order/order.module';
import { ConstructionLogModule } from './modules/construction-log/construction-log.module';
import { MessageModule } from './modules/message/message.module';
import { ReviewModule } from './modules/review/review.module';
import { CaseModule } from './modules/case/case.module';
import { FileModule } from './modules/file/file.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { EventLogModule } from './modules/event-log/event-log.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    CompanyModule,
    TeamModule,
    DemandModule,
    QuoteModule,
    OrderModule,
    ConstructionLogModule,
    MessageModule,
    ReviewModule,
    CaseModule,
    FileModule,
    ComplianceModule,
    EventLogModule,
    AdminModule,
  ],
})
export class AppModule {}
