// leads.controller.ts
import { Controller, Post, Get, Put, Body, Req, UseGuards, Param, Query, Delete, BadRequestException } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsService } from './lead.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateNotesDto } from './dto/update-notes.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }


  @Post('create')
  async createLead(@Req() req, @Body() dto: CreateLeadDto) {
    const ownerId = req.user.id || req.user.owner_id;
    const workspaceId = req.user.workspace_id;

    return this.leadsService.createLead(dto, ownerId, workspaceId);
  }

  @Get()
  async getAll(
    @Req() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsService.getAllLeads(ownerId, workspaceId, Number(page), Number(limit));
  }

  // ✅ Get one lead by ID

  @Get('general/:id')
  async getById(@Req() req, @Param('id') id: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsService.getLeadById(id, ownerId, workspaceId);
  }


  @Put(':id')
  async updateLead(@Req() req, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsService.updateLead(id, ownerId, workspaceId, dto);
  }


  @Delete(':id')
  async deleteLead(@Req() req, @Param('id') id: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsService.deleteLead(id, ownerId, workspaceId);
  }

  //Leads Notes fields update endpoint....
  @UseGuards(JwtAuthGuard)
  @Put('update-notes/:leadId')
  async updateNotes(
    @Req() req,
    @Param('leadId') leadId: string,
    @Body() dto: UpdateNotesDto,
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsService.updateNotes(leadId, workspaceId, ownerId, dto);
  }


  @UseGuards(JwtAuthGuard)
  @Get('notes/:leadId')
  async getSources(@Req() req, @Param('leadId') leadId: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadsService.getNotes(leadId, workspaceId, ownerId);
  }


}
