import { Controller, Post, Put, Delete, Query, Param, Body, Req, UseGuards, UseInterceptors, UploadedFiles, Get, UploadedFile, NotFoundException, Patch } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { HelpDeskTicketService } from './helpdesk-ticket.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-helpdesk-ticket.dto';
import { UpdateHelpdeskTicketDto } from './dto/update-helpdesk-ticket.dto';
import { UserType } from '@prisma/client';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { AdminGuard } from 'src/modules/auth/guards/admin.guard';

@Controller('helpdesk-ticket')
export class HelpDeskTicketController {
  constructor(private readonly helpDeskTicketService: HelpDeskTicketService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async createTicket(
    @Req() req: any,
    @Body() createTicketDto: CreateTicketDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const { type: userType } = req.user;

    const { categoryId, status, subject, description, customerId, email, workspaceId, notes } = createTicketDto;

    return this.helpDeskTicketService.createHelpDeskTicket(
      req,
      userType,
      categoryId,
      status,
      subject,
      description,
      files,
      customerId,
      email,
      workspaceId,
      notes
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTickets(@Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const { type: userType } = req.user;
    return this.helpDeskTicketService.getHelpDeskTickets(req, userType, Number(page), Number(limit), status,
      search);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTicketById(@Param('id') id: string, @Req() req: any) {
    const ticket = await this.helpDeskTicketService.getTicketById(id);

    if (!ticket) throw new NotFoundException('Ticket not found');

    return ticket;
  }


  @Put(':Id/update')
  @UseGuards(JwtAuthGuard)
  async updateTicket(
    @Param('Id') Id: string,
    @Req() req: any,
    @Body() updateDto: UpdateHelpdeskTicketDto,
  ) {
    const { type: userType } = req.user; // Extract SUPERADMIN or OWNER from JWT

    return this.helpDeskTicketService.updateHelpDeskTicket(
      req,
      userType,
      Id,
      updateDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTicket(@Param('id') id: string, @Req() req: any) {
    const { type: userType } = req.user;
    return this.helpDeskTicketService.deleteHelpDeskTicket(req, userType as UserType, id);
  }

  @Post(':id/description')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addDescription(
    @Req() req: any,
    @Param('id') ticketId: string,
    @Body('description') description: string,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.helpDeskTicketService.addDescriptionToTicket(
      req,
      ticketId,
      description,
      file,
    );
  }

  @Get(':id/description')
  @UseGuards(JwtAuthGuard)
  async getAllDescriptions(
    @Param('id') ticketId: string,
  ) {
    return this.helpDeskTicketService.getAllDescriptionsOfTicket(ticketId);
  }

  // GET notes of a specific ticket
  @UseGuards(JwtAuthGuard)
  @Get(':id/notes')
  async getTicketNotes(@Param('id') id: string) {
    const notes = await this.helpDeskTicketService.getTicketNotes(id);
    return { notes };
  }

  // PATCH update notes of a specific ticket
  @UseGuards(JwtAuthGuard)
  @Patch(':id/notes')
  async updateTicketNotes(
    @Param('id') id: string,
    @Req() req: any,
    @Body('notes') notes: string,
  ) {
    const updatedNotes = await this.helpDeskTicketService.updateTicketNotes(req, id, notes);
    return { notes: updatedNotes };
  }


}
