import { Controller, Post, Body, Param, Patch, Get, UseGuards, Request, Res } from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';
import { CompanySettings } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('company-settings')
@UseGuards(JwtAuthGuard) // Ensure the user is authenticated with JWT
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) {}

  // Create company settings under a specific owner and workspace
  @Post()
  async create(
    @Request() req,
    @Body() createCompanySettingDto: CreateCompanySettingDto,
    @Res() res: Response
  ): Promise<Response<CompanySettings>> {
    const { owner_id, workspace_id } = req.user; // Extract from JWT payload
    try {
      const result = await this.companySettingsService.create(createCompanySettingDto, owner_id, workspace_id);
      return res.json(result); // Ensure we return a valid CompanySettings object
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get company settings by owner and workspace
  @Get()
  async getByOwnerAndWorkspace(@Request() req, @Res() res: Response): Promise<Response<CompanySettings | null>> {
    const { owner_id, workspace_id } = req.user; // Extract from JWT payload
    try {
      const result = await this.companySettingsService.getByOwnerAndWorkspace(owner_id, workspace_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Settings not found' });
      }
      return res.json(result); // Ensure we return a valid CompanySettings object
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update company settings for a specific owner and workspace
  @Patch()
  async update(
    @Request() req,
    @Body() updateCompanySettingDto: UpdateCompanySettingDto,
    @Res() res: Response
  ): Promise<Response<CompanySettings>> {
    const { owner_id, workspace_id } = req.user; // Extract from JWT payload
    try {
      const result = await this.companySettingsService.update(updateCompanySettingDto, owner_id, workspace_id);
      return res.json(result); // Ensure we return a valid CompanySettings object
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
