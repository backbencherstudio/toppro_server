import { Module } from '@nestjs/common';
import { LeadsController } from './lead.controller';
import { LeadsService } from './lead.service';
import { LeadsUserModule } from './leadusers/leadusers.module';




@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
  imports: [LeadsUserModule],
})
export class LeadModule {}
