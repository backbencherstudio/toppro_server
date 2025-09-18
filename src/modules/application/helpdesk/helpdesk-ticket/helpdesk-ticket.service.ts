import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';  // Prisma service to interact with the DB
import { T_status, UserType } from '@prisma/client';  // Enums for ticket status
import { UploadService } from './upload.service';  // Upload service to handle file uploads
import { UpdateHelpdeskTicketDto } from './dto/update-helpdesk-ticket.dto';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);


@Injectable()
export class HelpDeskTicketService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
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
    workspaceId?: string,  // Optional for Admin; OWNER workspace derived from JWT
    notes?: string  // Optional notes for the ticket
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

    // Prepare file uploads if there are attachments
    let fileUploads = [];
    if (files && files.length > 0) {
      // Upload the files and store their details
      fileUploads = await Promise.all(
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
    }

    // Create both the ticket and its description in a single transaction
    const newTicket = await this.prisma.helpDeskTicket.create({
      data: {
        customerId: customerUserId,   // Assigned customer based on user type
        email: customerEmail,         // Assigned email based on user type
        categoryId,
        status,
        subject,
        createdBy: req.user.id,      // The user who created the ticket (from JWT)
        ticketId,
        workspaceId: workspaceId!,   // validated/derived workspace id
        descriptions: {
          create: {
            description,
            attachments: {
              create: fileUploads
            }
          }
        }, 
        notes: notes || null
      },
      include: {
        descriptions: {
          include: {
            attachments: true
          }
        }
      }
    });

    return newTicket;
  }

  // list tickets based on role
  async getHelpDeskTickets(req: any, userType: UserType, page = 1, limit = 10, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    let where: any = {};

    if (userType === 'SUPERADMIN') {
      where = {}; // no workspace restriction
    } else if (userType === 'OWNER') {
      const ownerId = req.user.id;
      let workspaceId = req.user.workspace_id as string | null;
      if (!workspaceId) {
        const owner = await this.prisma.user.findUnique({
          where: { id: ownerId },
          select: { workspace_id: true },
        });
        workspaceId = owner?.workspace_id || null;
      }
      if (!workspaceId) throw new ForbiddenException('Owner does not have a workspace assigned');

      where = {
        workspaceId: workspaceId,
        OR: [{ createdBy: ownerId }, { customerId: ownerId }],
      };
    } else {
      throw new ForbiddenException('Unauthorized');
    }

    // 🔹 Add status filter if provided
    if (status) {
      where.status = status;
    }

    // 🔹 Add search filter if provided
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { description: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const tickets = await this.prisma.helpDeskTicket.findMany({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    });

    const totalTickets = await this.prisma.helpDeskTicket.count({ where });

    return {
      loggedInUser: {
        id: req.user.id,
        workspace: req.user.workspace_id,
      },
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketId: t.ticketId,
        subject: t.subject,
        status: t.status,
        created: dayjs(t.createdAt).fromNow(),
        category: { name: t.category?.name, color: t.category?.color },
        assignedTo: { id: t.customer?.id, name: t.customer?.name },
        email: t.customer?.email,
        createdBy: { id: t.creator?.id, name: t.creator?.name },
      })),
      totalPages: Math.ceil(totalTickets / limit),
      currentPage: page,
      totalItems: totalTickets,
    };
  }



  // Update HelpDeskTicket (no description, attachments, or notes modifications)
  async updateHelpDeskTicket(
    req: any,
    userType: UserType,
    id: string,
    updateDto: UpdateHelpdeskTicketDto
  ) {
    // Fetch ticket by Ticket's id
    const ticket = await this.prisma.helpDeskTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // OWNER: Only creator can edit and workspace must match owner's workspace
    if (userType === 'OWNER') {
      const ownerId = req.user.id;
      let ownerWorkspaceId = req.user.workspace_id as string | null;
      if (!ownerWorkspaceId) {
        const owner = await this.prisma.user.findUnique({
          where: { id: ownerId },
          select: { workspace_id: true },
        });
        ownerWorkspaceId = owner?.workspace_id || null;
      }

      if (!ownerWorkspaceId) {
        throw new ForbiddenException('Owner does not have a workspace assigned');
      }

      if (ticket.workspaceId !== ownerWorkspaceId || ticket.createdBy !== ownerId) {
        throw new ForbiddenException('You do not have access to this ticket');
      }
    }

    // Build update payload
    const { categoryId, status, subject, customerId, email, workspaceId, notes } = updateDto as any;
    const updateData: any = {};

    // Common allowed fields
    if (typeof categoryId !== 'undefined') updateData.categoryId = categoryId;
    if (typeof status !== 'undefined') updateData.status = status;
    if (typeof subject !== 'undefined') updateData.subject = subject;
    if (typeof notes !== 'undefined') updateData.notes = notes;

    if (userType === 'SUPERADMIN') {
      // Admin can update customerId, email, workspaceId
      let targetCustomerId = typeof customerId !== 'undefined' ? customerId : ticket.customerId;
      let targetWorkspaceId = typeof workspaceId !== 'undefined' ? workspaceId : ticket.workspaceId;

      if (typeof customerId !== 'undefined' || typeof workspaceId !== 'undefined') {
        // Load the (new or existing) customer to validate OWNER type and workspace relation
        const customer = await this.prisma.user.findUnique({
          where: { id: targetCustomerId },
          select: { id: true, type: true, workspace_id: true },
        });
        if (!customer) {
          throw new NotFoundException('Customer not found');
        }
        if (customer.type !== 'OWNER') {
          throw new BadRequestException('Only users with type "OWNER" can be assigned as a customer');
        }

        if (typeof customerId !== 'undefined' && typeof workspaceId === 'undefined') {
          // If admin changed customer but not workspace, sync workspace to the new owner's workspace
          targetWorkspaceId = customer.workspace_id;
        }

        if (typeof workspaceId !== 'undefined' && targetWorkspaceId !== customer.workspace_id) {
          // If workspaceId is explicitly provided, ensure it matches the owner's workspace
          throw new BadRequestException('workspaceId does not belong to the specified owner');
        }

        // Set updates after validation
        if (typeof customerId !== 'undefined') updateData.customerId = targetCustomerId;
        if (typeof workspaceId !== 'undefined' || (typeof customerId !== 'undefined' && targetWorkspaceId !== ticket.workspaceId)) {
          updateData.workspaceId = targetWorkspaceId;
        }

        // If customer changed and email not explicitly provided, sync email from owner
        if (typeof customerId !== 'undefined' && typeof email === 'undefined') {
          updateData.email = customer.workspace_id ? (await this.prisma.user.findUnique({ where: { id: targetCustomerId }, select: { email: true } })).email : ticket.email;
        }
      }

      if (typeof email !== 'undefined') {
        updateData.email = email;
      }

    }

    // OWNER cannot update customerId/email/workspaceId; they are ignored implicitly

    const updatedTicket = await this.prisma.helpDeskTicket.update({
      where: { id: id },
      data: updateData,
    });

    return updatedTicket;
  }

  async deleteHelpDeskTicket(req: any, userType: UserType, id: string) {
    // Fetch ticket by Ticket's id
    const ticket = await this.prisma.helpDeskTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // OWNER: can delete only if they created it and workspace matches
    if (userType === 'OWNER') {
      const ownerId = req.user.id;
      let ownerWorkspaceId = req.user.workspace_id as string | null;

      if (!ownerWorkspaceId) {
        const owner = await this.prisma.user.findUnique({
          where: { id: ownerId },
          select: { workspace_id: true },
        });
        ownerWorkspaceId = owner?.workspace_id || null;
      }

      if (!ownerWorkspaceId) {
        throw new ForbiddenException('Owner does not have a workspace assigned');
      }

      if (ticket.workspaceId !== ownerWorkspaceId || ticket.createdBy !== ownerId) {
        throw new ForbiddenException('You do not have permission to delete this ticket');
      }
    }

    // SUPERADMIN can delete any ticket (no extra check)

    await this.prisma.helpDeskTicket.delete({
      where: { id },
    });

    return { message: 'Ticket deleted successfully' };
  }

  // Generate a random 5-digit ticket ID (minimum 5 digits) as a string
  generateRandomTicketId() {
    return (Math.floor(Math.random() * 90000) + 10000).toString();  // Converts to string
  }



}
