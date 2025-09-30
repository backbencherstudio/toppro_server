import { Module } from '@nestjs/common';
import { CurrencySettingsService } from './currency-settings.service';
import { CurrencySettingsController } from './currency-settings.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CurrencySettingsController],
  providers: [CurrencySettingsService, PrismaService],
  exports: [CurrencySettingsService],
})
export class CurrencySettingsModule {}
