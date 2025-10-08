import { Injectable } from '@nestjs/common';
import { CreateSubscriptionSettingDto } from './dto/create-subscription-setting.dto';
import { UpdateSubscriptionSettingDto } from './dto/update-subscription-setting.dto';

@Injectable()
export class SubscriptionSettingsService {
  create(createSubscriptionSettingDto: CreateSubscriptionSettingDto) {
    return 'This action adds a new subscriptionSetting';
  }

  findAll() {
    return `This action returns all subscriptionSettings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscriptionSetting`;
  }

  update(id: number, updateSubscriptionSettingDto: UpdateSubscriptionSettingDto) {
    return `This action updates a #${id} subscriptionSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscriptionSetting`;
  }
}
