import { Module } from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { CompanySettingsController } from './company-settings.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CompanySettingsController],
  providers: [CompanySettingsService, PrismaService],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule { }
