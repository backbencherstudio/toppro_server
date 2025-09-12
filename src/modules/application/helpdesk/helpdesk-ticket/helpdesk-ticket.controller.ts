import { Controller, Post, Body, Req, UseGuards, UseInterceptors, UploadedFiles, Get } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';  // File upload interceptor for multiple files
import { HelpDeskTicketService } from './helpdesk-ticket.service';  // Service to handle ticket logic
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';  // JWT guard to authenticate the user
import { CreateTicketDto } from './dto/create-helpdesk-ticket.dto';  // DTO for request validation

@Controller('helpdesk-ticket')
export class HelpDeskTicketController {
  constructor(private readonly helpDeskTicketService: HelpDeskTicketService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)  // Use JWT guard to authenticate the request
  @UseInterceptors(FilesInterceptor('files', 10))  // Handle multiple file uploads
  async createTicket(
    @Req() req: any,  // Get the user details from the JWT token (userId, userType)
    @Body() createTicketDto: CreateTicketDto,  // DTO for validation
    @UploadedFiles() files: Express.Multer.File[]  // Extract multiple files from form-data
  ) {
    const { type: userType } = req.user;  // Get user type from JWT

    const { categoryId, status, subject, description, customerId, email, workspaceId } = createTicketDto;

    return this.helpDeskTicketService.createHelpDeskTicket(
      req,            // Pass the full request so service can access req.user
      userType,       // User type (from JWT)
      categoryId,
      status,
      subject,
      description,
      files,          // Pass the uploaded files (multiple)
      customerId,     // Optional for Admin
      email,          // Optional for Admin
      workspaceId     // Optional for Admin; OWNER will be derived from JWT
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTickets(@Req() req: any) {
    const { type: userType } = req.user;
    return this.helpDeskTicketService.getHelpDeskTickets(req, userType);
  }
}
