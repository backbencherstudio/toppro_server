// import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';  // Prisma service
// import { T_status, UserType } from '@prisma/client';  // Enum for ticket status
// import { UploadService } from './upload.service';


// @Injectable()
// export class HelpDeskTicketService {
//   constructor(
//     private prisma: PrismaService,
//     private uploadService: UploadService,  // Inject the upload service
//   ) {}

//   // Main logic to create HelpDeskTicket
//   async createHelpDeskTicket(
//     createdBy: string,
//     userType: UserType,
//     categoryId: string,
//     status: T_status,
//     subject: string,
//     description: string,
//     files: Express.Multer.File[] | null,  // Accept multiple files
//     customerId?: string, // Optional for SUPERADMIN only
//     email?: string // Optional for SUPERADMIN only
//   ) {
//     let customerEmail: string | null = null;
//     let customerUserId: string | null = null;

//     // **Admin (SUPERADMIN)** Logic:
//     if (userType === 'SUPERADMIN') {
//       // Admin must provide customerId and email
//       if (!customerId || !email) {
//         throw new BadRequestException('Customer ID and Email are required for admin');
//       }

//       // Fetch the customer based on customerId
//       const customer = await this.prisma.user.findUnique({
//         where: { id: customerId }, // `customerId` is a string
//         select: { email: true, type: true }, // Fetch email and type for validation
//       });

//       if (!customer) {
//         throw new NotFoundException('Customer not found');
//       }

//       if (customer.type !== 'OWNER') {
//         throw new BadRequestException('Only users with type "OWNER" can be assigned as a customer');
//       }

//       // Assign customer info
//       customerUserId = customerId;  // customerId is passed from admin request
//       customerEmail = email;        // customerEmail is passed from admin request
//     }

//     // **Owner** Logic:
//     if (userType === 'OWNER') {
//       // Owner's userId is assigned as the customer for their own ticket
//       customerUserId = createdBy;  // Owner's userId will be the customer
//       const owner = await this.prisma.user.findUnique({
//         where: { id: createdBy }, // `createdBy` is the owner's ID from JWT
//       });
//       if (!owner) {
//         throw new NotFoundException('Owner not found');
//       }
//       customerEmail = owner.email; // Owner's email will be used as the customer's email
//     }

//     // Generate a random ticketId (string) before using it in the uploadFiles function
//     const ticketId = this.generateRandomTicketId();  // Generate the ticketId before use

//     // Create the ticket description (with description and attachment)
//     const ticketDescriptionData: any = {
//       description,
//       attachments: { create: [] }, // Initialize as a nested create array for attachments
//     };

//     // Handle multiple attachments
//     if (files && files.length > 0) {
//       // Upload the files and store their details
//       const fileUploads = await Promise.all(
//         files.map(async (attachment) => {
//           // Use the existing uploadFiles method to upload each attachment
//           const fileUploadResponse = await this.uploadService.uploadFilesToDescription(
//             ticketId,     // The ticketId from the created ticket
//             createdBy,    // The user who created the ticket
//             '',            // Workspace ID, can be passed if needed
//             createdBy,    // User ID
//             [attachment]  // The array of files to be uploaded
//           );

//           return {
//             file_name: fileUploadResponse[0].file_name, // Correcting the response structure
//             file_url: fileUploadResponse[0].file_url,
//             file_size: fileUploadResponse[0].file_size,
//           };
//         })
//       );

//       // Add attachments to the ticket description
//       ticketDescriptionData.attachments = {
//         create: fileUploads, // Add all uploaded files to the attachment array
//       };
//     }

//     // Create the TicketDescriptionWithAttachment
//     const ticketDescription = await this.prisma.ticketDescriptionWithAttachment.create({
//       data: ticketDescriptionData,
//     });

//     // Create the HelpDeskTicket and link it to the description and category
//     const newTicket = await this.prisma.helpDeskTicket.create({
//       data: {
//         customerId: customerUserId, // Assigned customer based on the user type
//         email: customerEmail,       // Assigned email based on the user type
//         categoryId,                 // Link to HelpDeskCategory
//         status,
//         subject,
//         createdBy,                  // The user who created the ticket
//         descriptionId: ticketDescription.id,  // Link to description
//         ticketId,                   // Set the generated ticketId (as string)
//       },
//     });

//     return newTicket;
//   }

//   // Generate a random 5-digit ticket ID (minimum 5 digits) as a string
//   generateRandomTicketId() {
//     return (Math.floor(Math.random() * 90000) + 10000).toString(); // Converts to string
//   }
// }

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Prisma service
import { T_status, UserType } from '@prisma/client'; // Enum for ticket status
import { UploadService } from './upload.service';


@Injectable()
export class HelpDeskTicketService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService, // Inject the upload service
  ) {}

  // Main logic to create HelpDeskTicket
  async createHelpDeskTicket(
    createdBy: string,
    userType: UserType,
    categoryId: string,
    status: T_status,
    subject: string,
    description: string,
    files: Express.Multer.File[] | null, // Accept multiple files
    customerId?: string, // Optional for SUPERADMIN only
    email?: string // Optional for SUPERADMIN only
  ) {
    let customerEmail: string | null = null;
    let customerUserId: string | null = null;

    // **Admin (SUPERADMIN)** Logic:
    if (userType === 'SUPERADMIN') {
      // Admin must provide customerId and email
      if (!customerId || !email) {
        throw new BadRequestException('Customer ID and Email are required for admin');
      }

      // Fetch the customer based on customerId
      const customer = await this.prisma.user.findUnique({
        where: { id: customerId }, // `customerId` is a string
        select: { email: true, type: true }, // Fetch email and type for validation
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      if (customer.type !== 'OWNER') {
        throw new BadRequestException('Only users with type "OWNER" can be assigned as a customer');
      }

      // Assign customer info
      customerUserId = customerId;  // customerId is passed from admin request
      customerEmail = email;        // customerEmail is passed from admin request
    }

    // **Owner** Logic:
    if (userType === 'OWNER') {
      // Owner's userId is assigned as the customer for their own ticket
      customerUserId = createdBy;  // Owner's userId will be the customer
      const owner = await this.prisma.user.findUnique({
        where: { id: createdBy }, // `createdBy` is the owner's ID from JWT
      });
      if (!owner) {
        throw new NotFoundException('Owner not found');
      }
      customerEmail = owner.email; // Owner's email will be used as the customer's email
    }

    // Generate a random ticketId (string) before using it in the uploadFiles function
    const ticketId = this.generateRandomTicketId();  // Generate the ticketId before use

    // Create the ticket description (with description and attachment)
    const ticketDescriptionData: any = {
      description,
      attachments: { create: [] }, // Initialize as a nested create array for attachments
    };

    // Handle multiple attachments
    if (files && files.length > 0) {
      // Upload the files and store their details
      const fileUploads = await Promise.all(
        files.map(async (attachment) => {
          // Use the existing uploadFile method to upload each attachment
          const fileUploadResponse = await this.uploadService.uploadFilesToDescription(
            ticketId,     // The ticketId from the created ticket
            createdBy,    // The user who created the ticket
            '',            // Workspace ID, can be passed if needed
            createdBy,    // User ID
            [attachment]  // The array of files to be uploaded
          );

          return {
            file_name: fileUploadResponse[0].file_name, // Correcting the response structure
            file_url: fileUploadResponse[0].file_url,
            file_size: fileUploadResponse[0].file_size,
          };
        })
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

    // Create the HelpDeskTicket and link it to the description and category
    const newTicket = await this.prisma.helpDeskTicket.create({
      data: {
        customerId: customerUserId, // Assigned customer based on the user type
        email: customerEmail,       // Assigned email based on the user type
        categoryId,                 // Link to HelpDeskCategory
        status,
        subject,
        createdBy,                  // The user who created the ticket
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
