import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CrmSetupService } from './crm-setup.service';
import { CreateCrmSetupDto } from './dto/create-crm-setup.dto';
import { UpdateCrmSetupDto } from './dto/update-crm-setup.dto';

@Controller('crm-setup')
export class CrmSetupController {
  constructor(private readonly crmSetupService: CrmSetupService) {}

  @Post()
  create(@Body() createCrmSetupDto: CreateCrmSetupDto) {
    return this.crmSetupService.create(createCrmSetupDto);
  }

  @Get()
  findAll() {
    return this.crmSetupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.crmSetupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCrmSetupDto: UpdateCrmSetupDto) {
    return this.crmSetupService.update(+id, updateCrmSetupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.crmSetupService.remove(+id);
  }
}
