import { Controller, Post, Body, UseGuards, UploadedFile, UseInterceptors, Get, Req, Param, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // File upload handling
import { ModulePriceService } from './module-price.service'; // ModulePrice Service
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateModulePriceDto, UpdateModulePriceDto } from './dto/module-price.dto';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { OwnerGuard } from 'src/modules/auth/guards/owner.guard';

@Controller('module-price')
export class ModulePriceController {
  constructor(private readonly modulePriceService: ModulePriceService) { }

  // Create ModulePrice with logo upload - Admin only
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('logo'))  // Interceptor for logo upload
  async createModulePrice(
    @Req() req: any,  // Get the JWT from the request
    @UploadedFile() logo: Express.Multer.File,  // Logo file
    @Body() createModulePriceDto: CreateModulePriceDto,  // ModulePrice data (excluding logo)
  ) {
    const userId = req.user.id;  // Extract userId from JWT (from req.user)
    return this.modulePriceService.createModulePrice(createModulePriceDto, logo, userId);
  }

  // Get all ModulePrices - Available to all authenticated users
  @UseGuards(JwtAuthGuard)
  @Get()
  async getModulePrices() {
    return this.modulePriceService.getAllModulePrices();
  }

  // Get monthly prices
  @UseGuards(JwtAuthGuard)
  @Get('yearly')
  async getMonthlyPrices() {
    return this.modulePriceService.getPrices('priceYear');
  }

  // Get yearly prices
  @UseGuards(JwtAuthGuard)
  @Get('monthly')
  async getYearlyPrices() {
    return this.modulePriceService.getPrices('priceMonth');
  }

  // Update ModulePrice - Admin only
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id') 
  @UseInterceptors(FileInterceptor('logo'))  // Interceptor for logo upload (only if logo is provided)
  async updateModulePrice(
    @Param('id') id: string,  // The ID of the ModulePrice to update
    @UploadedFile() logo: Express.Multer.File | null,  // Logo file (optional)
    @Body() updateModulePriceDto: UpdateModulePriceDto,  // ModulePrice data (excluding logo)
    @Req() req: any  // Request object to get userId from JWT
  ) {
    const userId = req.user.id;  // Get user ID from JWT token
    return this.modulePriceService.updateModulePrice(id, updateModulePriceDto, logo, userId);
  }
}
