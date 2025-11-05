import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ControlSettingsService } from './control-settings.service';
import { CreateControlSettingDto } from './dto/create-control-setting.dto';
import { UpdateControllerSettingDto } from './dto/update-control-setting.dto';

@Controller('control-settings')
export class ControlSettingsController {
  constructor(private readonly controlSettingsService: ControlSettingsService) {}

  @Post()
  create(@Body() createControlSettingDto: CreateControlSettingDto) {
    return this.controlSettingsService.create(createControlSettingDto);
  }

  @Get()
  findAll() {
    return this.controlSettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.controlSettingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateControlSettingDto: UpdateControllerSettingDto) {
    return this.controlSettingsService.update(+id, updateControlSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.controlSettingsService.remove(+id);
  }
}
