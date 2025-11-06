import { Module } from '@nestjs/common';
import { ControllerSettingsController } from './control-settings.controller';
import { ControllerSettingsService } from './control-settings.service';

@Module({
  controllers: [ControllerSettingsController],
  providers: [ControllerSettingsService],
})
export class ControlSettingsModule {}
