import { Module } from '@nestjs/common';
import { ControllerSettingsController } from './control-settings.controller';
import { ControllerSettingsService } from './control-settings.service';
import { UploadService } from './upload.service';

@Module({
  controllers: [ControllerSettingsController],
  providers: [ControllerSettingsService, UploadService],
})
export class ControlSettingsModule {}
