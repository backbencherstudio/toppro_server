import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CrmReportService } from './crm-report.service';
import { CreateCrmReportDto } from './dto/create-crm-report.dto';
import { UpdateCrmReportDto } from './dto/update-crm-report.dto';

@Controller('crm-report')
export class CrmReportController {
  constructor(private readonly crmReportService: CrmReportService) {}

  @Post()
  create(@Body() createCrmReportDto: CreateCrmReportDto) {
    return this.crmReportService.create(createCrmReportDto);
  }

  @Get()
  findAll() {
    return this.crmReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.crmReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCrmReportDto: UpdateCrmReportDto) {
    return this.crmReportService.update(+id, updateCrmReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.crmReportService.remove(+id);
  }
}
