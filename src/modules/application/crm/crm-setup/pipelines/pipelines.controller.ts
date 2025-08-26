import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PipelineService } from './pipelines.service';

@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) { }

  // CREATE: body contains workspace_id & owner_id
  @Post()
  create(@Body() dto: CreatePipelineDto) {
    return this.pipelineService.create(dto);
  }

  // LIST: params contain workspace_id & owner_id
  @Get('workspaceid/:workspace_id/ownerid/:owner_id')
  findAll(
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
  ) {
    return this.pipelineService.findAll(workspace_id, owner_id);
  }

  // UPDATE: params contain id, workspace_id, owner_id; body: { name }
  @Put('workspaceid/:workspace_id/ownersid/:owner_id/pipeid/:id')
  update(
    @Param('id') id: string,
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
    @Body() dto: Pick<CreatePipelineDto, 'name'>,
  ) {
    return this.pipelineService.update(id, workspace_id, owner_id, dto);
  }

  // DELETE
  @Delete('workspaceid/:workspace_id/ownerid/:owner_id/pipeid/:id')
  remove(
    @Param('id') id: string,
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
  ) {
    return this.pipelineService.remove(id, workspace_id, owner_id);
  }
}
