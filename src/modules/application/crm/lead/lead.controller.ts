// leads.controller.ts
import { Controller, Post, Get, Put, Body, Req, UseGuards, Param, Query, Delete, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsService } from './lead.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly prisma: PrismaService,
  ) { }


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


  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id') leadId: string,  // Extract leadId from URL params
    @UploadedFile() file: Express.Multer.File,  // Extract file from form-data
    @Req() req: any  // Access request object to get userId from JWT
  ) {
    const userId = req.user.id;  // Get user ID from JWT payload (assuming JWT contains user info)
    return this.leadsService.uploadFile(leadId, userId, file);  // Call uploadFile in service
  }

  // Inside LeadsController
  @Get(':leadId/files')
  async getFiles(@Param('leadId') leadId: string) {
    return this.leadsService.getFilesForLead(leadId);
  }

  // Inside LeadsController
  @Delete(':leadId/files/:fileId')
  async removeFile(@Param('leadId') leadId: string, @Param('fileId') fileId: string) {
    return this.leadsService.removeFileFromLead(leadId, fileId);
  }


}
