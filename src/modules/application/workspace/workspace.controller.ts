import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceService } from './workspace.service';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  create(@Body() createDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createDto);
  }

  @Get("all/:superId/:ownerId")
  findAll(@Param('superId') superId: string, @Param('ownerId') ownerId: string) {
    return this.workspaceService.findAll( superId, ownerId);

  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workspaceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWorkspaceDto) {
    return this.workspaceService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workspaceService.remove(id);
  }

  // workspace.controller.ts
@Get('count/:superId/:ownerId')
async getWorkspaceCount(
  @Param('superId') superId: string,
  @Param('ownerId') ownerId: string,
) {
  return this.workspaceService.countWorkspaces(superId, ownerId);
}

}
