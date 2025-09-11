import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';  // Prisma service to access DB
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage'; // Assuming you have a custom storage service

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  // File upload logic for HelpDeskTicket (similar to your old code for Lead)
  async uploadFilesToDescription(
    ticketDescriptionId: string,  // Link to the description
    createdBy: string,            // User who created the ticket
    workspaceId: string,         // Workspace ID of the user
    userId: string,              // User ID (typically the one creating the ticket)
    files: Express.Multer.File[] // Accept multiple files
  ) {
    // Ensure that the directory for file storage exists
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create directory if it doesn't exist
    }

    // Initialize an array to store attachment data
    const fileDetails: any[] = [];

    // Loop through the files and upload each one
    for (const file of files) {
      // Generate a unique file name
      const fileName = `${userId}-${Date.now()}-${file.originalname}`;

      // Upload the file using your storage service (e.g., SojebStorage)
      await SojebStorage.put(`helpdesk-tickets/${fileName}`, file.buffer);

      // Store file details in the fileDetails array
      fileDetails.push({
        file_name: fileName,
        file_url: `helpdesk-tickets/${fileName}`,  // Path of the file
        file_size: file.size,
        descriptionId: ticketDescriptionId, // Link this attachment to the ticket description
      });
    }

    // Create a new attachment record in the database for each file
    const attachments = await this.prisma.descriptionAttachment.createMany({
      data: fileDetails,  // Insert all the file details at once
    });

    return attachments; // Return file details (attachments)
  }
}
