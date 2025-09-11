import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';  // Prisma service
import { T_status, UserType } from '@prisma/client';  // Enum for ticket status
import { UploadService } from './upload.service';

@Injectable()
export class HelpDeskTicketService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,  // Inject the upload service
  ) {}

  // Main logic to create HelpDeskTicket
  async createHelpDeskTicket(
    createdBy: string,
    userType: UserType,
    categoryId: string,
    status: T_status,
    subject: string,
    description: string,
    files: Express.Multer.File[] | null,  // Accept multiple files
    customerId?: string, // Optional for SUPERADMIN only
    email?: string // Optional for SUPERADMIN only
  ) {
    let customerEmail: string | null = null;
    let customerUserId: string | null = null;

    // **Admin (SUPERADMIN)** Logic:
    if (userType === 'SUPERADMIN') {
      if (!customerId || !email) {
        throw new BadRequestException('Customer ID and Email are required for admin');
      }

      const customer = await this.prisma.user.findUnique({
        where: { id: customerId },
        select: { email: true, type: true }, // Fetch email and type for validation
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      if (customer.type !== 'OWNER') {
        throw new BadRequestException('Only users with type "OWNER" can be assigned as a customer');
      }

      customerUserId = customerId;
      customerEmail = email;
    }

    // **Owner** Logic:
    if (userType === 'OWNER') {
      customerUserId = createdBy;  // Owner's userId will be the customer
      const owner = await this.prisma.user.findUnique({
        where: { id: createdBy },
      });
      if (!owner) {
        throw new NotFoundException('Owner not found');
      }
      customerEmail = owner.email; // Owner's email will be used as the customer's email
    }

    // Create the ticket description (with description and attachment)
    const ticketDescriptionData: any = {
      description,
      attachments: { create: [] }, // Initialize as a nested create array for attachments
    };

    // Handle multiple attachments
    if (files && files.length > 0) {
      const fileUploads = await this.uploadService.uploadFilesToDescription(
        ticketDescriptionData.id, // Link to description
        createdBy,    // The user who created the ticket
        '',            // Workspace ID, can be passed if needed
        createdBy,    // User ID
        files          // The array of files to be uploaded
      );

      // Add attachments to the ticket description
      ticketDescriptionData.attachments = {
        create: fileUploads, // Add all uploaded files to the attachment array
      };
    }

    // Create the TicketDescriptionWithAttachment
    const ticketDescription = await this.prisma.ticketDescriptionWithAttachment.create({
      data: ticketDescriptionData,
    });

    // Generate a random ticketId (string)
    const ticketId = this.generateRandomTicketId();  // Generate the ticketId before use

    // Create the HelpDeskTicket and link it to the description and category
    const newTicket = await this.prisma.helpDeskTicket.create({
      data: {
        customerId: customerUserId, // Assigned customer based on the user type
        email: customerEmail,       // Assigned email based on the user type
        categoryId,                 // Link to HelpDeskCategory
        status,
        subject,
        createdBy,                  // The user who created the ticket (admin or owner)
        descriptionId: ticketDescription.id,  // Link to description
        ticketId,                   // Set the generated ticketId (as string)
      },
    });

    return newTicket;
  }

  // Generate a random 5-digit ticket ID (minimum 5 digits) as a string
  generateRandomTicketId() {
    return (Math.floor(Math.random() * 90000) + 10000).toString(); // Converts to string
  }
}
