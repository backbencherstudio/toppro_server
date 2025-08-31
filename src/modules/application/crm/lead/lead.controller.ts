// leads.controller.ts
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsService } from './lead.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createLead(@Req() req, @Body() dto: CreateLeadDto) {
    // req.user comes from JWT strategy
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    const userId = req.user.id;

    return this.leadsService.createLead(dto, ownerId, workspaceId, userId);
  }
}
