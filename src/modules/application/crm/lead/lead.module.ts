import { Module } from '@nestjs/common';
import { LeadsController } from './lead.controller';
import { LeadsService } from './lead.service';


@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadModule {}
