import { Injectable } from '@nestjs/common';
import { CreateCrmSetupDto } from './dto/create-crm-setup.dto';
import { UpdateCrmSetupDto } from './dto/update-crm-setup.dto';

@Injectable()
export class CrmSetupService {
  create(createCrmSetupDto: CreateCrmSetupDto) {
    return 'This action adds a new crmSetup';
  }

  findAll() {
    return `This action returns all crmSetup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} crmSetup`;
  }

  update(id: number, updateCrmSetupDto: UpdateCrmSetupDto) {
    return `This action updates a #${id} crmSetup`;
  }

  remove(id: number) {
    return `This action removes a #${id} crmSetup`;
  }
}
