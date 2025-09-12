import { Injectable } from '@nestjs/common';
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';

@Injectable()
export class UploadService {
  // File upload logic (handle multiple files). This only uploads files and returns metadata.
  async uploadFilesToDescription(
    ticketId: string, // unused here but kept for signature compatibility
    createdBy: string,
    workspaceId: string,
    userId: string,
    files: Express.Multer.File[]
  ): Promise<{ file_name: string; file_url: string; file_size: number }[]> {
    // Ensure that the directory for file storage exists (for local fallback, if needed)
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileDetails: { file_name: string; file_url: string; file_size: number }[] = [];

    for (const file of files) {
      const fileName = `${userId}-${Date.now()}-${file.originalname}`;
      await SojebStorage.put(`helpdesk-tickets/${fileName}`, file.buffer);

      fileDetails.push({
        file_name: fileName,
        file_url: `helpdesk-tickets/${fileName}`,
        file_size: file.size,
      });
    }

    // Return metadata; DB insert will be handled via nested create by the caller
    return fileDetails;
  }
}
