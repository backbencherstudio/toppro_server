import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateLeadStageDto } from './dto/create-lead_stage.dto';
import { UpdateLeadStageDto } from './dto/update-lead_stage.dto';
import { LeadStageService } from './lead_stages.service';

@Controller('lead-stages')
export class LeadStageController {
  constructor(private readonly leadStageService: LeadStageService) { }

  // CREATE (body)
  @Post()
  create(@Body() dto: CreateLeadStageDto) {
    return this.leadStageService.create(dto);
  }


  @Get('/:workspace_id/:owner_id/:pipelineId')
  findAll(
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
    @Param('pipelineId') pipelineId: string,
  ) {
    return this.leadStageService.findAll(workspace_id, owner_id, pipelineId);
  }

  // UPDATE by id only
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadStageDto) {
    return this.leadStageService.updateById(id, dto);
  }

  // DELETE by id only
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadStageService.removeById(id);
  }
}
