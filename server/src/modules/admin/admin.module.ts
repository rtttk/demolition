import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../user/user.module';
import { CompanyModule } from '../company/company.module';
import { TeamModule } from '../team/team.module';
import { DemandModule } from '../demand/demand.module';
import { QuoteModule } from '../quote/quote.module';
import { OrderModule } from '../order/order.module';
import { ConstructionLogModule } from '../construction-log/construction-log.module';
import { CaseModule } from '../case/case.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { ReviewModule } from '../review/review.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CompanyModule,
    TeamModule,
    DemandModule,
    QuoteModule,
    OrderModule,
    ConstructionLogModule,
    CaseModule,
    ComplianceModule,
    ReviewModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
