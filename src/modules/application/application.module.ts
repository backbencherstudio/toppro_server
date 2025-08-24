import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { CrmReportModule } from './crm/crm-report/crm-report.module';
import { CrmSetupModule } from './crm/crm-setup/crm-setup.module';
import { DealModule } from './crm/deal/deal.module';
import { LeadModule } from './crm/lead/lead.module';
import { CustomerModule } from './customer/customer.module';
import { FaqModule } from './faq/faq.module';
import { NotificationModule } from './notification/notification.module';
import { VendorModule } from './vendor/vendor.module';

@Module({
  imports: [NotificationModule, ContactModule, FaqModule, CustomerModule, VendorModule, LeadModule, DealModule, CrmSetupModule, CrmReportModule ],
})
export class ApplicationModule {}
