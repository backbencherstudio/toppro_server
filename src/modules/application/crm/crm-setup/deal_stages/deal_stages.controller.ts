
// deal-stages.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateDealStageDto } from './dto/create-deal_stage.dto';
import { UpdateDealStageDto } from './dto/update-deal_stage.dto';
import { DealStageService } from './deal_stages.service';

@Controller('deal-stages')
export class DealStageController {
  constructor(private readonly dealStageService: DealStageService) {}

  // CREATE (body)
  @Post()
  create(@Body() dto: CreateDealStageDto) {
    return this.dealStageService.create(dto);
  }

  // LIST (params)
  @Get('workspaceid/:workspace_id/ownerid/:owner_id/:pipelineName')
  findAll(
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
    @Param('pipelineName') pipelineName: string,
  ) {
    return this.dealStageService.findAll(workspace_id, owner_id, pipelineName);
  }

  // UPDATE by id only
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealStageDto) {
    return this.dealStageService.updateById(id, dto);
  }

  // DELETE by id only
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dealStageService.removeById(id);
  }
}