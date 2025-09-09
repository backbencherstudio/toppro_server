import { Module } from '@nestjs/common';
import { LeadProductsService } from './lead-products.service';
import { LeadProductsController } from './lead-products.controller';
import { ActivityModule } from '../../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [LeadProductsController],
  providers: [LeadProductsService],
})
export class LeadProductsModule { }
