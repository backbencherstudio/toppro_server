import { Controller, Post, Body, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('discussions')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) { }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Req() req, @Body() dto: CreateDiscussionDto) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.discussionService.createDiscussion(dto, ownerId, workspaceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('lead/:leadId')
  async getAllDiscussions(
    @Req() req,
    @Param('leadId') leadId: string,
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.discussionService.getAllDiscussionsByLead(
      leadId,
      ownerId,
      workspaceId,
    );
  }
}
