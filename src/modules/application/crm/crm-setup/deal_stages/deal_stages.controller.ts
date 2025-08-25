// deal-stage.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { DealStageService } from './deal_stages.service';
import { CreateDealStageDto } from './dto/create-deal_stage.dto';


@Controller('deal-stages')
export class DealStageController {
  constructor(private readonly dealStageService: DealStageService) { }

  // Create Deal Stage with pipeline name in the body
  @Post()
  create(@Body() createDealStageDto: CreateDealStageDto) {
    return this.dealStageService.create(createDealStageDto);
  }

  // Get all Deal Stages for a Pipeline
  @Get(':pipelineId')
  findAll(@Param('pipelineId') pipelineId: string) {
    return this.dealStageService.findAll(pipelineId);
  }

  // Update Deal Stage
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() createDealStageDto: CreateDealStageDto,
  ) {
    return this.dealStageService.update(id, createDealStageDto);
  }

  // Delete Deal Stage
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dealStageService.remove(id);
  }
}
