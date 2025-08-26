import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LeadStagesService } from './lead_stages.service';
import { CreateLeadStageDto } from './dto/create-lead_stage.dto';
import { UpdateLeadStageDto } from './dto/update-lead_stage.dto';

@Controller('lead-stages')
export class LeadStagesController {
  constructor(private readonly leadStagesService: LeadStagesService) {}

  @Post()
  create(@Body() createLeadStageDto: CreateLeadStageDto) {
    return this.leadStagesService.create(createLeadStageDto);
  }

  @Get()
  findAll() {
    return this.leadStagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadStagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadStageDto: UpdateLeadStageDto) {
    return this.leadStagesService.update(+id, updateLeadStageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadStagesService.remove(+id);
  }
}
