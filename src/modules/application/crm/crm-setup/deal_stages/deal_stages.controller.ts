// // deal-stage.controller.ts
// import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
// import { DealStageService } from './deal_stages.service';
// import { CreateDealStageDto } from './dto/create-deal_stage.dto';


// @Controller('deal-stages')
// export class DealStageController {
//   constructor(private readonly dealStageService: DealStageService) { }

//   // Create Deal Stage with pipeline name in the body
//   @Post()
//   create(@Body() createDealStageDto: CreateDealStageDto) {
//     return this.dealStageService.create(createDealStageDto);
//   }

//   // Get all Deal Stages for a Pipeline
//   @Get(':pipelineId')
//   findAll(@Param('pipelineId') pipelineId: string) {
//     return this.dealStageService.findAll(pipelineId);
//   }

//   // Update Deal Stage
//   @Put(':id')
//   update(
//     @Param('id') id: string,
//     @Body() createDealStageDto: CreateDealStageDto,
//   ) {
//     return this.dealStageService.update(id, createDealStageDto);
//   }

//   // Delete Deal Stage
//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.dealStageService.remove(id);
//   }
// }

// deal-stage.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateDealStageDto } from './dto/create-deal_stage.dto';
import { UpdateDealStageDto } from './dto/update-deal_stage.dto';
import { DealStageService } from './deal_stages.service';

@Controller()
export class DealStageController {
  constructor(private readonly dealStageService: DealStageService) {}

  // CREATE (body)
  @Post('deal-stages')
  create(@Body() dto: CreateDealStageDto) {
    return this.dealStageService.create(dto);
  }

  // LIST (params)
  @Get('workspaces/:workspace_id/owners/:owner_id/pipelines/:pipelineId/deal-stages')
  findAll(
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
    @Param('pipelineId') pipelineId: string,
  ) {
    return this.dealStageService.findAll(workspace_id, owner_id, pipelineId);
  }

  // UPDATE (params + body)
  @Put('workspaces/:workspace_id/owners/:owner_id/deal-stages/:id')
  update(
    @Param('id') id: string,
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
    @Body() dto: UpdateDealStageDto,
  ) {
    return this.dealStageService.update(id, workspace_id, owner_id, dto);
  }

  // DELETE (params)
  @Delete('workspaces/:workspace_id/owners/:owner_id/deal-stages/:id')
  remove(
    @Param('id') id: string,
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
  ) {
    return this.dealStageService.remove(id, workspace_id, owner_id);
  }
}
