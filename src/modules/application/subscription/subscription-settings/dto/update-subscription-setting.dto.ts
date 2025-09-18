import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionSettingDto } from './create-subscription-setting.dto';

export class UpdateSubscriptionSettingDto extends PartialType(CreateSubscriptionSettingDto) {}
