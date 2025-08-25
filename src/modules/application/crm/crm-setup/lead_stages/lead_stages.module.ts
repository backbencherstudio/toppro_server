import { Module } from '@nestjs/common';
import { LeadStagesService } from './lead_stages.service';
import { LeadStagesController } from './lead_stages.controller';

@Module({
  controllers: [LeadStagesController],
  providers: [LeadStagesService],
})
export class LeadStagesModule {}
