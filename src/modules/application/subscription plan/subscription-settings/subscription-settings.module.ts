import { Module } from '@nestjs/common';
import { SubscriptionSettingsService } from './subscription-settings.service';
import { SubscriptionSettingsController } from './subscription-settings.controller';

@Module({
  controllers: [SubscriptionSettingsController],
  providers: [SubscriptionSettingsService],
})
export class SubscriptionSettingsModule {}
