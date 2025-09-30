import { PartialType } from '@nestjs/swagger';
import { CreateCurrencySettingDto } from './create-currency-setting.dto';

export class UpdateCurrencySettingDto extends PartialType(CreateCurrencySettingDto) {}
