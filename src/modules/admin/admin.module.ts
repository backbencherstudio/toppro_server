import { Module } from '@nestjs/common';
import { FaqModule } from './faq/faq.module';
import { ContactModule } from './contact/contact.module';
import { WebsiteInfoModule } from './admin_settings/website-info/website-info.module';
import { PaymentTransactionModule } from './payment-transaction/payment-transaction.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { BlogModule } from './blog/blog.module';
import { PermissionModule } from './permission/permission.module';
import { RolesModule } from './roles/roles.module';


@Module({
  imports: [
    FaqModule,
    ContactModule,
    WebsiteInfoModule,
    PaymentTransactionModule,
    UserModule,
    NotificationModule,
    BlogModule,
    WebsiteInfoModule,
    PermissionModule,
    RolesModule,


  ],
})
export class AdminModule {}
