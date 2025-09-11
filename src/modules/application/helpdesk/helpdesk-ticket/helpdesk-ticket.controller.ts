import { Controller, Post, Body, Req, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // File upload interceptor
import { HelpDeskTicketService } from './helpdesk-ticket.service';  // HelpDeskTicket service
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-helpdesk-ticket.dto';


@Controller('helpdesk-ticket')
export class HelpDeskTicketController {
  constructor(private readonly helpDeskTicketService: HelpDeskTicketService) {}

  @Post('create-ticket')
  @UseGuards(JwtAuthGuard)  // Use JWT guard to authenticate the request
  @UseInterceptors(FileInterceptor('files', { limits: { files: 10 } }))  // Handle the file upload
  async createTicket(
    @Req() req: any,  // Get the user details from the JWT token (userId, userType)
    @Body() createTicketDto: CreateTicketDto,  // DTO for validation
    @UploadedFiles() files: Express.Multer.File[] // Extract multiple files from form-data
  ) {
    const { id: createdBy, type: userType } = req.user;  // Get user data from JWT

    const { categoryId, status, subject, description, customerId, email } = createTicketDto;

    return this.helpDeskTicketService.createHelpDeskTicket(
      createdBy,      // User creating the ticket (from JWT)
      userType,       // User type (from JWT)
      categoryId,
      status,
      subject,
      description,
      files,           // Pass the uploaded files (multiple)
      customerId,     // Optional for SUPERADMIN
      email           // Optional for SUPERADMIN
    );
  }
}
