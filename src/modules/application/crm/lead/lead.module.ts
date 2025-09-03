import { Module } from '@nestjs/common';
import { LeadsController } from './lead.controller';
import { LeadsService } from './lead.service';
import { LeadsUserModule } from './leadusers/leadusers.module';
import { LeadsourcesModule } from './leadsources/leadsources.module';




@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
  imports: [LeadsUserModule, LeadsourcesModule],
})
export class LeadModule {}
