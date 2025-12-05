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
import { HelpDeskCategoryModule } from './helpdesk/helpdesk-category/helpdesk-category.module';
import { StockModule } from './stock/stock.module';
import { HelpDeskTicketModule } from './helpdesk/helpdesk-ticket/helpdesk-ticket.module';
import { SubscriptionSettingsModule } from './subscription plan/subscription-settings/subscription-settings.module';
import { ModulePriceModule } from './subscription plan/module-price/module-price.module';
import { ComboPlanModule } from './subscription plan/combo-plan/combo-plan.module';
import { BankaccountModule } from './accounting/bankaccount/bankaccount.module';
import { BasicPlanModule } from './subscription plan/basic-plan/basic-plan.module';
import { CouponModule } from './subscription plan/coupon/coupon.module';
import { CompanySettingsModule } from './settings/company-settings/company-settings.module';
import { CurrencySettingsModule } from './settings/currency-settings/currency-settings.module';
import { DashboardModule } from './crm/dashboard/dashboard.module';
import { RevenueModule } from './accounting/income/revenue/revenue.module';
import { CreditNotesModule } from './accounting/income/credit-notes/credit-notes.module';
import { ChartOfAccountModule } from 'src/modules/application/accounting/chartofaccounts/chartofaccounts.module';
import { TransferModule } from './accounting/transfer/transfer.module';
import { ReceiptSummaryModule } from 'src/modules/application/receiptsummary/receiptsummary.module';
import { ControlSettingsModule } from './settings/control-settings/control-settings.module';
import { PaymentModule } from './payment/payment.module';
import { BillModule } from './accounting/bill/bill.module';
import { ExpensepaymentModule } from './accounting/expensepayment/expensepayment.module';
import { DebitnotesModule } from './accounting/debitnotes/debitnotes.module';
@Module({
  imports: [
    NotificationModule,
    ContactModule,
    FaqModule,
    CustomerModule,
    VendorModule,
    LeadModule,
    DealModule,
    CrmReportModule,
    PipelinesModule,
    LeadStagesModule,
    DealStageModule,
    WorkspaceModule,
    SourcesModule,
    ItemsModule,
    CategoryModule,
    PurchaseModule,
    TasksModule,
    EmailtextModule,
    CallModule,
    LeadsUserModule,
    DiscussionModule,
    ActivityModule,
    LogTimeModule,
    InvoiceModule,
    HelpDeskCategoryModule,
    StockModule,
    HelpDeskTicketModule,
    SubscriptionSettingsModule,
    ModulePriceModule,
    ComboPlanModule,
    BankaccountModule,
    ChartOfAccountModule,
    BasicPlanModule,
    CouponModule,
    CompanySettingsModule,
    CurrencySettingsModule,
    DashboardModule,
    RevenueModule,
    CreditNotesModule,
    TransferModule,
    ReceiptSummaryModule,
    ControlSettingsModule,
    PaymentModule,
    BillModule,
    ExpensepaymentModule,
    DebitnotesModule,
  ],
})
export class ApplicationModule { }
