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
import { CategoryModule } from './category/category.module';
import { PurchaseModule } from './purchase/purchase.module';
import { TasksModule } from './crm/tasks/tasks.module';
import { EmailtextModule } from './crm/emailtext/emailtext.module';
import { CallModule } from './crm/call/call.module';
import { LeadsUserModule } from './crm/lead/leadusers/leadusers.module';
import { DiscussionModule } from './crm/discussion/discussion.module';
import { ActivityModule } from './crm/activity/activity.module';
import { LogTimeModule } from './log-time/log-time.module';
import { InvoiceModule } from './invoice/invoice.module';
import { HelpdeskCategoryModule } from './helpdesk/helpdesk-category/helpdesk-category.module';
@Module({
  imports: [NotificationModule, ContactModule, FaqModule, CustomerModule, VendorModule, LeadModule, DealModule, CrmReportModule, PipelinesModule, LeadStagesModule, DealStageModule, WorkspaceModule, SourcesModule, ItemsModule, CategoryModule, PurchaseModule, TasksModule, EmailtextModule, CallModule, LeadsUserModule, DiscussionModule, ActivityModule, LogTimeModule, InvoiceModule, HelpdeskCategoryModule],

})
export class ApplicationModule { }
