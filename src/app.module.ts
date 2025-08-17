// external imports
import { MiddlewareConsumer, Module } from '@nestjs/common';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
// import { BullModule } from '@nestjs/bullmq';

// internal imports
import appConfig from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AbilityModule } from './ability/ability.module';
import { MailModule } from './mail/mail.module';
import { ApplicationModule } from './modules/application/application.module';
import { AdminModule } from './modules/admin/admin.module';
import { BullModule } from '@nestjs/bullmq';
import { PaymentModule } from './modules/payment/payment.module';
import { AiChatbotModule } from './aichatbot/ai-chatbot.module';
import {ServiceManagementModule} from './modules/admin/sevice-management/service-management.module'
import { UserModule } from './user/user.module';
import { FeatureModule } from './modules/admin/features/featuers_module';
import { CategoryModule } from './modules/admin/sevice-management/category/category.module';
import { BlogCategoryModule } from './modules/admin/blog/blog_category/blog_category.module';
import { WebsiteInfoModule } from './modules/admin/admin_settings/website-info/website-info.module';
import { ChatModule } from './chat___/chat_module';
import { Permission } from './modules/admin/permission/entities/permission.entity';
import { PermissionModule } from './modules/admin/permission/permission.module';
import { Role } from './modules/admin/roles/entities/role.entity';
import { RolesModule } from './modules/admin/roles/roles.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    BullModule.forRoot({
      connection: {
        host: appConfig().redis.host,
        password: appConfig().redis.password,
        port: +appConfig().redis.port,
      },
    }),
    PrismaModule,
    AuthModule,
    AbilityModule,
    MailModule,
    ApplicationModule,
    AdminModule,
    ChatModule,
    PaymentModule,
    AiChatbotModule,
    ServiceManagementModule,
    FeatureModule,
    CategoryModule,
    UserModule,
    BlogCategoryModule,
    WebsiteInfoModule,
    PermissionModule,
    RolesModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
