import { Controller, Post, Put, Body, Req, UseGuards, Get, Delete, Param, Patch } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createTask(@Req() req, @Body() dto: CreateTaskDto) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.tasksService.createTask(dto, ownerId, workspaceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('lead/:leadId')
  async getTasksByLead(@Req() req, @Param('leadId') leadId: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.tasksService.getTasksByLead(leadId, ownerId, workspaceId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateTask(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.tasksService.updateTask(id, dto, ownerId, workspaceId);
  }

  // Toggle task status
  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-status')
  async toggleTaskStatus(@Req() req, @Param('id') id: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.tasksService.toggleTaskStatus(id, ownerId, workspaceId);
  }

  // Delete task
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTask(@Req() req, @Param('id') id: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.tasksService.deleteTask(id, ownerId, workspaceId);
  }

}
