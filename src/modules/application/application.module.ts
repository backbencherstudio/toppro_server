import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { CustomerModule } from './customer/customer.module';
import { VendorModule } from './vendor/vendor.module';

@Module({
  imports: [NotificationModule, ContactModule, FaqModule, CustomerModule, VendorModule],
})
export class ApplicationModule {}
