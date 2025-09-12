import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';  // Prisma service to interact with the DB
import { T_status, UserType } from '@prisma/client';  // Enums for ticket status
import { UploadService } from './upload.service';  // Upload service to handle file uploads

@Injectable()
export class HelpDeskTicketService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,  // Inject upload service for handling files
  ) { }

  // Main logic to create HelpDeskTicket
  async createHelpDeskTicket(
    req: any,  // Request object to get user data from JWT token
    userType: UserType,  // UserType (Admin/Owner) extracted from JWT
    categoryId: string,  // Category ID
    status: T_status,  // Status of the ticket (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
    subject: string,  // Subject of the ticket
    description: string,  // Description of the ticket
    files: Express.Multer.File[] | null,  // Files attached to the ticket
    customerId?: string,  // Optional: Customer ID (Required only for Admin)
    email?: string  // Optional: Customer email (Required only for Admin)
  ) {
    let customerEmail: string | null = null;
    let customerUserId: string | null = null;

    // **Admin (SUPERADMIN)** Logic:
    if (userType === 'SUPERADMIN') {
      if (!customerId || !email) {
        throw new BadRequestException('Customer ID and Email are required for admin');
      }

      // Fetch customer based on the provided customerId
      const customer = await this.prisma.user.findUnique({
        where: { id: customerId },
        select: { email: true, type: true },
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
      customerUserId = req.user.id;  // Owner's userId will be the customer
      // Use email directly from JWT payload if present to avoid extra DB read
      customerEmail = req.user.email;
      if (!customerEmail) {
        // fallback to DB if token doesn't have email
        const owner = await this.prisma.user.findUnique({
          where: { id: req.user.id },
          select: { email: true },
        });
        if (!owner) {
          throw new NotFoundException('Owner not found');
        }
        customerEmail = owner.email;
      }
    }

    // Generate a random ticketId (string) before using it in the uploadFiles function
    const ticketId = this.generateRandomTicketId();  // Generate the ticketId before use

    // Create the ticket description (with description and attachment)
    const ticketDescriptionData: any = {
      description,
      attachments: { create: [] as { file_name: string; file_url: string; file_size: number }[] },
    };

    // Handle multiple attachments
    if (files && files.length > 0) {
      // Upload the files and store their details
      const fileUploads = await Promise.all(
        files.map(async (attachment) => {
          const uploaded = await this.uploadService.uploadFilesToDescription(
            ticketId,
            req.user.id,
            '',
            req.user.id,
            [attachment]
          );
          return uploaded[0];
        })
      );

      // Add attachments to be created nested with the description
      ticketDescriptionData.attachments = {
        create: fileUploads,
      };
    }

    // Create the TicketDescriptionWithAttachment
    const ticketDescription = await this.prisma.ticketDescriptionWithAttachment.create({
      data: ticketDescriptionData,
    });

    // Create the HelpDeskTicket and link it to the description and category
    const newTicket = await this.prisma.helpDeskTicket.create({
      data: {
        customerId: customerUserId,   // Assigned customer based on user type
        email: customerEmail,         // Assigned email based on user type
        categoryId,
        status,
        subject,
        createdBy: req.user.id,       // The user who created the ticket (from JWT)
        descriptionId: ticketDescription.id,  // Link to the description
        ticketId,  // Set the generated ticketId (as string)
      },
    });

    return newTicket;
  }

  // Generate a random 5-digit ticket ID (minimum 5 digits) as a string
  generateRandomTicketId() {
    return (Math.floor(Math.random() * 90000) + 10000).toString();  // Converts to string
  }
}
