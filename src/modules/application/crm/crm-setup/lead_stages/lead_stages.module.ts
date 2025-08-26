import { Module } from '@nestjs/common';
import { LeadStageService } from './lead_stages.service';
import { LeadStageController } from './lead_stages.controller';


@Module({
  controllers: [LeadStageController],
  providers: [LeadStageService],
})
export class LeadStagesModule {}
