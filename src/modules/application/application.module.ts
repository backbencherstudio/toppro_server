import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { CrmReportModule } from './crm/crm-report/crm-report.module';
import { DealModule } from './crm/deal/deal.module';
import { LeadModule } from './crm/lead/lead.module';
import { CustomerModule } from './customer/customer.module';
import { FaqModule } from './faq/faq.module';
import { NotificationModule } from './notification/notification.module';
import { VendorModule } from './vendor/vendor.module';
import { PipelinesModule } from './crm/crm-setup/pipelines/pipelines.module';
import { LeadStagesModule } from './crm/crm-setup/lead_stages/lead_stages.module';
import { DealStageModule } from './crm/crm-setup/deal_stages/deal_stages.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { SourcesModule } from './crm/crm-setup/sources/sources.module';
import { ItemsModule } from './items/items.module';
import { InvoiceModule } from './invoice/invoice.module';
import { CategoryModule } from './category/category.module';
@Module({
  imports: [NotificationModule, ContactModule, FaqModule, CustomerModule, VendorModule, LeadModule, DealModule, CrmReportModule, PipelinesModule, LeadStagesModule, DealStageModule, WorkspaceModule, SourcesModule, ItemsModule, InvoiceModule, CategoryModule],
})
export class ApplicationModule { }
