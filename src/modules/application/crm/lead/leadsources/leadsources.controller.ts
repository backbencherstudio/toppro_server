import { Controller, Post, Param, Body, Req, UseGuards, Get, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { LeadsSourceService } from './leadsources.service';


@Controller('lead-sources')
export class LeadsSourceController {
  constructor(private readonly leadsSourceService: LeadsSourceService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':leadId')
  async addSources(
    @Req() req,
    @Param('leadId') leadId: string,
    @Body('sourceIds') sourceIds: string[],
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsSourceService.addSourcesToLead(
      leadId,
      workspaceId,
      ownerId,
      sourceIds,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':leadId')
  async getSources(@Req() req, @Param('leadId') leadId: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsSourceService.getSourcesForLead(leadId, workspaceId, ownerId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':leadId/remove/:sourceId')
  async removeSource(
    @Req() req,
    @Param('leadId') leadId: string,
    @Param('sourceId') sourceId: string,
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsSourceService.removeSourceFromLead(
      leadId,
      workspaceId,
      ownerId,
      sourceId,
    );
  }
}
