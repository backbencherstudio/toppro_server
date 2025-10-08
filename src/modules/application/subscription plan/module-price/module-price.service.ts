import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from './upload.service';  // Service to handle file uploads
import { CreateModulePriceDto, UpdateModulePriceDto } from './dto/module-price.dto';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';

@Injectable()
export class ModulePriceService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,  // Injecting the file upload service
  ) { }

  // Create ModulePrice and handle file upload
  async createModulePrice(modulePriceDto: CreateModulePriceDto, logo: Express.Multer.File, userId: string) {
    const { name, priceMonth, priceYear } = modulePriceDto;

    // Upload the logo file
    const logoFileName = await this.uploadService.uploadLogo(logo, userId);

    // Create the module price record in the database with the logo file name
    const newModulePrice = await this.prisma.modulePrice.create({
      data: {
        name,
        priceMonth,  // Price as integer
        priceYear,   // Price as integer
        logo: logoFileName,  // Store the uploaded file name in DB
      },
    });

    return newModulePrice;
  }

  async updateModulePrice(
    id: string,
    modulePriceDto: UpdateModulePriceDto,
    logo: Express.Multer.File | null,
    userId: string
  ) {
    const { name, priceMonth, priceYear } = modulePriceDto;

    // Fetch the existing ModulePrice record
    const existingModulePrice = await this.prisma.modulePrice.findUnique({
      where: { id },
    });

    if (!existingModulePrice) {
      throw new NotFoundException('ModulePrice not found');
    }

    // Prepare the update data
    const updateData: any = {
      name,
      priceMonth,
      priceYear,
    };

    // Handle logo upload if provided
    if (logo) {
      // Step 1: Delete the old logo if it exists
      const oldLogo = existingModulePrice.logo;  // Retrieve the old logo filename
      if (oldLogo) {
        // Step 2: Delete old image from the storage
        await SojebStorage.delete(`modulePrices/${oldLogo}`);
      }

      // Step 3: Upload the new logo and update the logo field
      const logoFileName = await this.uploadService.uploadLogo(logo, userId);
      updateData.logo = logoFileName;
    }

    // Step 4: Update the ModulePrice record in the database
    const updatedModulePrice = await this.prisma.modulePrice.update({
      where: { id },
      data: updateData,
    });

    return updatedModulePrice;
  }

  // Get all ModulePrices
  async getAllModulePrices() {
    return this.prisma.modulePrice.findMany();
  }


  async getPrices(priceType: 'priceMonth' | 'priceYear') {
    const modulePrices = await this.prisma.modulePrice.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        createdAt: true,
        updatedAt: true,
        [priceType]: true,  // Dynamically select either priceMonth or priceYear
      },
    });

    return modulePrices;
  }
}

