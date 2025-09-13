// external imports
import { MiddlewareConsumer, Module } from '@nestjs/common';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
// import { BullModule } from '@nestjs/bullmq';

// internal imports
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { AbilityModule } from './ability/ability.module';
import { AiChatbotModule } from './aichatbot/ai-chatbot.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat___/chat_module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import appConfig from './config/app.config';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './modules/admin/admin.module';
import { WebsiteInfoModule } from './modules/admin/admin_settings/website-info/website-info.module';
import { BlogCategoryModule } from './modules/admin/blog/blog_category/blog_category.module';
import { FeatureModule } from './modules/admin/features/featuers_module';
import { PermissionModule } from './modules/admin/permission/permission.module';
import { RolesModule } from './modules/admin/roles/roles.module';
import { CategoryModule } from './modules/admin/sevice-management/category/category.module';
import { ServiceManagementModule } from './modules/admin/sevice-management/service-management.module';
import { ApplicationModule } from './modules/application/application.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';


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
    JwtModule
    // InvoiceModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
  // exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
