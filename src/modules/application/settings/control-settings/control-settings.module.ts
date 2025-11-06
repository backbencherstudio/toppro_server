import { Module } from '@nestjs/common';
import { ControlSettingsService } from './control-settings.service';
import { ControlSettingsController } from './control-settings.controller';

@Module({
  controllers: [ControlSettingsController],
  providers: [ControlSettingsService],
})
export class ControlSettingsModule {}
