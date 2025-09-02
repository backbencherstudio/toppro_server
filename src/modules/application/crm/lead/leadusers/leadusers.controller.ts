import { Controller, Post, Param, Body, Req, UseGuards, Get, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { LeadsUserService } from './leadusers.service';

@Controller('lead-users')
export class LeadsUserController {
  constructor(private readonly leadsUserService: LeadsUserService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async addUsers(
    @Req() req,
    @Param('id') leadId: string,
    @Body('userIds') userIds: string[],
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsUserService.addUsersToLead(leadId, workspaceId, ownerId, userIds);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUsers(@Req() req, @Param('id') leadId: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsUserService.getUsersForLead(leadId, workspaceId, ownerId);
  }

   @UseGuards(JwtAuthGuard)
  @Delete(':leadId/remove/:userId')
  async removeUser(
    @Req() req,
    @Param('leadId') leadId: string,
    @Param('userId') userId: string,
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsUserService.removeUserFromLead(
      leadId,
      workspaceId,
      ownerId,
      userId,
    );
  }
}
