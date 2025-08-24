import { Module } from '@nestjs/common';
import { CrmReportService } from './crm-report.service';
import { CrmReportController } from './crm-report.controller';

@Module({
  controllers: [CrmReportController],
  providers: [CrmReportService],
})
export class CrmReportModule {}
