import { PartialType } from '@nestjs/swagger';
import { CreateCompanySettingDto } from './create-company-setting.dto';

export class UpdateCompanySettingDto extends PartialType(CreateCompanySettingDto) {}
