import { Module } from '@nestjs/common';
import { LeadsController } from './lead.controller';
import { LeadsService } from './lead.service';
import { LeadsUserModule } from './leadusers/leadusers.module';
import { LeadsourcesModule } from './leadsources/leadsources.module';
import { LeadProductsModule } from './lead-products/lead-products.module';
import { ActivityModule } from '../activity/activity.module';




@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
  imports: [LeadsUserModule, LeadsourcesModule, LeadProductsModule, ActivityModule],
})
export class LeadModule {}
