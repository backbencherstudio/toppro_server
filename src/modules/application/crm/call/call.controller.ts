import { Controller, Post, Body, Req, UseGuards, Get, Param, Query, Delete, Put } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';

@Controller('calls')
export class CallController {
  constructor(private readonly callService: CallService) { }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Req() req, @Body() dto: CreateCallDto) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.callService.createCall(dto, ownerId, workspaceId);
  }

  //need all assinee users based on Leads id
  @Get('assignees/:leadId')
  async getAssigneeUsers(
    @Param('leadId') leadId: string
  ) {
    const assigneeUsers = await this.callService.getAssigneeUsersByLeadId(leadId);
    return {
      data: assigneeUsers,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('lead/:leadId')
  async getAllCallsByLead(
    @Req() req,
    @Param('leadId') leadId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.callService.getAllCallsByLead(
      leadId,
      ownerId,
      workspaceId,
      Number(page),
      Number(limit),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() data: Partial<CreateCallDto>,
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.callService.updateCall(id, ownerId, workspaceId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.callService.deleteCall(id, ownerId, workspaceId);
  }
}
