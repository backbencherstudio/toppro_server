// // pipeline.controller.ts
// import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
// import { CreatePipelineDto } from './dto/create-pipeline.dto';
// import { PipelineService } from './pipelines.service';

// @Controller('pipelines')
// export class PipelineController {
//   constructor(private readonly pipelineService: PipelineService) { }

//   // Create Pipeline
//   @Post('/create')
//   create(@Body() createPipelineDto: CreatePipelineDto) {
//     return this.pipelineService.create(createPipelineDto);
//   }

//   // Get all Pipelines
//   @Get()
//   findAll() {
//     return this.pipelineService.findAll();
//   }


//   // Update Pipeline
//   @Put(':id')
//   update(@Param('id') id: string, @Body() createPipelineDto: CreatePipelineDto) {
//     return this.pipelineService.update(id, createPipelineDto);
//   }

//   // Delete Pipeline
//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.pipelineService.remove(id);
//   }
// }

// pipeline.controller.ts
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
  @Get('workspaces/:workspace_id/owners/:owner_id/pipelines')
  findAll(
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
  ) {
    return this.pipelineService.findAll(workspace_id, owner_id);
  }

  // UPDATE: params contain id, workspace_id, owner_id; body: { name }
  @Put('workspaces/:workspace_id/owners/:owner_id/pipelines/:id')
  update(
    @Param('id') id: string,
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
    @Body() dto: Pick<CreatePipelineDto, 'name'>,
  ) {
    return this.pipelineService.update(id, workspace_id, owner_id, dto);
  }

  // DELETE
  @Delete('workspaces/:workspace_id/owners/:owner_id/pipelines/:id')
  remove(
    @Param('id') id: string,
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
  ) {
    return this.pipelineService.remove(id, workspace_id, owner_id);
  }
}
