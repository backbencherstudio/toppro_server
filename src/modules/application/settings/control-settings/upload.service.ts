import { Injectable, Logger } from '@nestjs/common';
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  async uploadFilesToDescription(
    ticketId: string,
    createdBy: string,
    workspaceId: string,
    userId: string,
    files: Express.Multer.File[]
  ): Promise<{ file_name: string; file_url: string; file_size: number }[]> {
    this.logger.log(`Uploading ${files.length} files for user ${userId}`);
    
    // Ensure upload directory exists (for local fallback)
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileDetails: { file_name: string; file_url: string; file_size: number }[] = [];

    for (const file of files) {
      try {
        const fileName = `${userId}-${Date.now()}-${file.originalname}`;
        this.logger.debug(`Processing file: ${file.originalname} -> ${fileName}`);
        
        await SojebStorage.put(`logo/${fileName}`, file.buffer);
        
        fileDetails.push({
          file_name: fileName,
          file_url: `logo/${fileName}`,
          file_size: file.size,
        });
        
        this.logger.debug(`Successfully uploaded: ${fileName}`);
      } catch (error) {
        this.logger.error(`Error uploading file ${file.originalname}:`, error);
        throw error;
      }
    }

    return fileDetails;
  }
}