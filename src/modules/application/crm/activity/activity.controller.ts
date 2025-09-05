import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  // 🔹 Get all activities for a lead
  @UseGuards(JwtAuthGuard)
  @Get('lead/:leadId')
  async getAllByLead(
    @Req() req,
    @Param('leadId') leadId: string,
  ) {
    const workspaceId = req.user.workspace_id;
    const ownerId = req.user.id;

    return this.activityService.getAllActivitiesByLead(
      leadId,
      workspaceId,
      ownerId,
    );
  }
}
