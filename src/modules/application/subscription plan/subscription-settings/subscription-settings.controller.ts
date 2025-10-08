import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubscriptionSettingsService } from './subscription-settings.service';
import { CreateSubscriptionSettingDto } from './dto/create-subscription-setting.dto';
import { UpdateSubscriptionSettingDto } from './dto/update-subscription-setting.dto';

@Controller('subscription-settings')
export class SubscriptionSettingsController {
  constructor(private readonly subscriptionSettingsService: SubscriptionSettingsService) {}

  @Post()
  create(@Body() createSubscriptionSettingDto: CreateSubscriptionSettingDto) {
    return this.subscriptionSettingsService.create(createSubscriptionSettingDto);
  }

  @Get()
  findAll() {
    return this.subscriptionSettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionSettingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubscriptionSettingDto: UpdateSubscriptionSettingDto) {
    return this.subscriptionSettingsService.update(+id, updateSubscriptionSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionSettingsService.remove(+id);
  }
}
