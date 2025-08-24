import { Injectable } from '@nestjs/common';
import { CreateCrmReportDto } from './dto/create-crm-report.dto';
import { UpdateCrmReportDto } from './dto/update-crm-report.dto';

@Injectable()
export class CrmReportService {
  create(createCrmReportDto: CreateCrmReportDto) {
    return 'This action adds a new crmReport';
  }

  findAll() {
    return `This action returns all crmReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} crmReport`;
  }

  update(id: number, updateCrmReportDto: UpdateCrmReportDto) {
    return `This action updates a #${id} crmReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} crmReport`;
  }
}
