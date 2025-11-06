import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ControllerSettingsService } from './control-settings.service';
import { UpdateControllerSettingDto } from './dto/update-control-setting.dto';


@Controller('controller-settings')
@UseGuards(JwtAuthGuard)
export class ControllerSettingsController {
  constructor(private readonly controllerSettingsService: ControllerSettingsService) { }

  // ✅ Get current user's brand/system settings
  @Get('me')
  async getMySettings(@Request() req) {
    return this.controllerSettingsService.getMySettings(req.user);
  }

  // ✅ Update current user's settings
  @Patch('me')
  async updateMySettings(@Body() dto: UpdateControllerSettingDto, @Request() req) {
    return this.controllerSettingsService.updateMySettings(dto, req.user);
  }
}
