import { Injectable } from '@nestjs/common';
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage'; // Assuming you have a SojebStorage service

@Injectable()
export class UploadService {

async uploadLogo(logo: Express.Multer.File, userId: string): Promise<string> {
    try {
      // Create a unique file name
      const logoFileName = `${userId}-${Date.now()}-${logo.originalname}`;

      // Upload the logo to storage (S3 or local)
      await SojebStorage.put(`modulePrices/${logoFileName}`, logo.buffer);  // Store logo in 'modulePrices/'

      return logoFileName;
    } catch (error) {
      throw new Error('Failed to upload logo');
    }
  }
}
