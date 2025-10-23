import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceService } from './workspace.service';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('create')
  create(@Body() createDto: CreateWorkspaceDto, @Req() req) {
    const { id: userId, owner_id: ownerId } = req.user;

    console.log('WorkspaceController', userId, ownerId);
    return this.workspaceService.create(createDto, userId, ownerId);
  }

  @Get('all')
  findAll(@Req() req) {
    const { id: userId, owner_id: ownerId } = req.user;
    return this.workspaceService.findAll(ownerId, userId);
  }

  @Get('all/workspaces/:ownerId')
  findAllWorkspaces(@Param('ownerId') ownerId: string, @Req() req) {
    const { id: userId } = req.user;
    return this.workspaceService.findAllWorkspaces(ownerId, userId);
  }

  // count workspaces
  @Get('count')
  async getWorkspaceCount(@Req() req) {
    const { id: userId, owner_id: ownerId } = req.user;
    return this.workspaceService.countWorkspaces(userId, ownerId);
  }


    @Post('switch-workspace')
  async switchWorkspace(@Body() body: { workspaceId: string }, @Req() req) {
    const { id: userId } = req.user;
    return this.workspaceService.switchWorkspace(userId, body.workspaceId);
  }



  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const { id: userId, owner_id: ownerId } = req.user;
    return this.workspaceService.findOne(id, ownerId, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkspaceDto,
    @Req() req,
  ) {
    const { id: userId, owner_id: ownerId } = req.user;
    return this.workspaceService.update(id, updateDto, ownerId, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const { id: userId, owner_id: ownerId } = req.user;
    return this.workspaceService.remove(id, ownerId, userId);
  }
}
