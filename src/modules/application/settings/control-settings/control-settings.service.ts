import { Injectable } from '@nestjs/common';
import { CreateControlSettingDto } from './dto/create-control-setting.dto';
import { UpdateControllerSettingDto } from './dto/update-control-setting.dto';

@Injectable()
export class ControlSettingsService {
  create(createControlSettingDto: CreateControlSettingDto) {
    return 'This action adds a new controlSetting';
  }

  findAll() {
    return `This action returns all controlSettings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} controlSetting`;
  }

  update(id: number, updateControlSettingDto: UpdateControllerSettingDto) {
    return `This action updates a #${id} controlSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} controlSetting`;
  }
}
