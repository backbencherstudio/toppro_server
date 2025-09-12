import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    email?: string,  // Optional: Customer email (Required only for Admin)
    workspaceId?: string // Optional for Admin; OWNER workspace derived from JWT
  ) {
    let customerEmail: string | null = null;
    let customerUserId: string | null = null;

    // **Admin (SUPERADMIN)** Logic:
    if (userType === 'SUPERADMIN') {
      if (!customerId || !email || !workspaceId) {
        throw new BadRequestException('Customer ID, Email and workspaceId are required for admin');
      }

      // Fetch customer based on the provided customerId
      const customer = await this.prisma.user.findUnique({
        where: { id: customerId },
        select: { email: true, type: true, workspace_id: true },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      if (customer.type !== 'OWNER') {
        throw new BadRequestException('Only users with type "OWNER" can be assigned as a customer');
      }

      // Validate workspace belongs to the owner
      if (customer.workspace_id !== workspaceId) {
        throw new BadRequestException('workspaceId does not belong to the specified owner');
      }

      customerUserId = customerId;
      customerEmail = email;
    }

    // **Owner** Logic:
    if (userType === 'OWNER') {
      customerUserId = req.user.id;  // Owner's userId will be the customer
      // Use email directly from JWT payload if present to avoid extra DB read
      customerEmail = req.user.email;
      let ownerWorkspaceId = req.user.workspace_id;

      if (!customerEmail || !ownerWorkspaceId) {
        // fallback to DB if token doesn't have email/workspace
        const owner = await this.prisma.user.findUnique({
          where: { id: req.user.id },
          select: { email: true, workspace_id: true },
        });
        if (!owner) {
          throw new NotFoundException('Owner not found');
        }
        customerEmail = customerEmail || owner.email;
        ownerWorkspaceId = ownerWorkspaceId || owner.workspace_id;
      }

      if (!ownerWorkspaceId) {
        throw new BadRequestException('Owner does not have a workspace assigned');
      }

      // OWNER must use their own workspace (ignore any provided workspaceId)
      workspaceId = ownerWorkspaceId;
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
        ticketId,  
        workspaceId: workspaceId!,    // validated/derived workspace id
      },
    });

    return newTicket;
  }

  // list tickets based on role
  async getHelpDeskTickets(req: any, userType: UserType) {
    if (userType === 'SUPERADMIN') {
      // Admin sees all tickets
      return this.prisma.helpDeskTicket.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userType === 'OWNER') {
      const ownerId = req.user.id;
      // get workspaceId from JWT or DB
      let workspaceId = req.user.workspace_id as string | null;
      if (!workspaceId) {
        const owner = await this.prisma.user.findUnique({
          where: { id: ownerId },
          select: { workspace_id: true },
        });
        workspaceId = owner?.workspace_id || null;
      }
      if (!workspaceId) {
        throw new ForbiddenException('Owner does not have a workspace assigned');
      }

      // Owner sees tickets in their workspace where they are creator or customer
      return this.prisma.helpDeskTicket.findMany({
        where: {
          workspaceId: workspaceId,
          OR: [
            { createdBy: ownerId },
            { customerId: ownerId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // default: restrict
    throw new ForbiddenException('Unauthorized');
  }

  // Generate a random 5-digit ticket ID (minimum 5 digits) as a string
  generateRandomTicketId() {
    return (Math.floor(Math.random() * 90000) + 10000).toString();  // Converts to string
  }
}
