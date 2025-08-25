// pipeline.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PipelineService } from './pipelines.service';

@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) { }

  // Create Pipeline
  @Post('/create')
  create(@Body() createPipelineDto: CreatePipelineDto) {
    return this.pipelineService.create(createPipelineDto);
  }

  // Get all Pipelines
  @Get()
  findAll() {
    return this.pipelineService.findAll();
  }


  // Update Pipeline
  @Put(':id')
  update(@Param('id') id: string, @Body() createPipelineDto: CreatePipelineDto) {
    return this.pipelineService.update(id, createPipelineDto);
  }

  // Delete Pipeline
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pipelineService.remove(id);
  }
}
