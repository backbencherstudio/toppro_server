import { PartialType } from '@nestjs/mapped-types';
import { CreateControlSettingDto } from './create-control-setting.dto';


export class UpdateControllerSettingDto extends PartialType(CreateControlSettingDto) {}
