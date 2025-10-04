import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  // Get total count of leads assigned to users
  @Get('total-assigned-leads')
  async getTotalAssignedLeads(@Req() req) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.dashboardService.getTotalAssignedLeads(ownerId, workspaceId);
  }

  // Get total count of all leads
  @Get('total-leads')
  async getTotalLeads(@Req() req) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.dashboardService.getTotalLeads(ownerId, workspaceId);
  }

  // Get 5 most recently created leads
  @Get('recent-leads')
  async getRecentLeads(@Req() req) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.dashboardService.getRecentLeads(ownerId, workspaceId);
  }

  // Get call counts per day for leads in last 7 days
  @Get('recent-7-days-calls')
  async getRecent7DaysCalls(@Req() req) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.dashboardService.getRecent7DaysCalls(ownerId, workspaceId);
  }

  // Get total count of leads by stages
  @Get('leads-by-stages')
  async getLeadsByStages(@Req() req) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.dashboardService.getLeadsByStages(ownerId, workspaceId);
  }

  // Get 5 most recently edited leads
  @Get('recently-edited-leads')
  async getRecentlyEditedLeads(@Req() req) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.dashboardService.getRecentlyEditedLeads(ownerId, workspaceId);
  }
}
