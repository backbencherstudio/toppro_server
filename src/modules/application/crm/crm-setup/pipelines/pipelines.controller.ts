import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PipelineService } from './pipelines.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Role } from 'src/modules/admin/roles/entities/role.entity';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) { }

  @Post()
  async create(@Req() req, @Body() dto: CreatePipelineDto) {
    const ownerId = req.user.id;           // Extract from JWT token
    const workspaceId = req.user.workspace_id;
    return this.pipelineService.create(dto, ownerId, workspaceId);
  }

  // LIST: params contain workspace_id & owner_id
  @Get()
 async findAll(@Req() req) {
    const ownerId = req.user.id;  // Extract from JWT token
    const workspaceId = req.user.workspace_id;
    return this.pipelineService.findAll(ownerId, workspaceId);
  }
  @Put(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: Pick<CreatePipelineDto, 'name'>,
  ) {
    const ownerId = req.user.id;           // Extract from JWT token
    const workspaceId = req.user.workspace_id;
    return this.pipelineService.updateById(id, dto, ownerId, workspaceId);
  }

  // DELETE: by pipeline id only
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const ownerId = req.user.id;           // Extract from JWT token
    const workspaceId = req.user.workspace_id;
    return this.pipelineService.removeById(id, ownerId, workspaceId);
  }

}
