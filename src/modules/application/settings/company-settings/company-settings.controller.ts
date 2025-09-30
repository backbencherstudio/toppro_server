import { Controller, Post, Body, Request, Res, UseGuards, Get, Patch, Param } from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';
import { CompanySettings } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('company-settings')
@UseGuards(JwtAuthGuard)  // Ensure the user is authenticated with JWT
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) { }

  // Create company settings under a specific owner and workspace
  @Post()
  async create(
    @Request() req,
    @Body() createCompanySettingDto: CreateCompanySettingDto,
    @Res() res: Response
  ): Promise<Response<CompanySettings>> {
    const { id, workspace_id, type } = req.user; // Extract from JWT payload

    // Check if the user type is 'OWNER'
    if (type !== 'OWNER') {
      return res.status(400).json({
        success: false,
        message: 'Only owners can create company settings.',
      });
    }

    const owner_id = id; // If type is OWNER, use the `id` as `owner_id`

    if (!owner_id || !workspace_id) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID and Workspace ID are required',
      });
    }

    const companySettingsData = {
      ...createCompanySettingDto,
      owner_id,         // Use the user ID from JWT as the owner_id
      workspace_id,     // Use the workspace_id from JWT
    };

    try {
      const result = await this.companySettingsService.create(companySettingsData, owner_id, workspace_id);
      return res.json(result);  // Return the result
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get company settings by owner and workspace
  @Get()
  async getCompanySettings(@Request() req, @Res() res: Response): Promise<Response<CompanySettings | null>> {
    const { id, workspace_id, type } = req.user; // Extract from JWT payload

    // Check if the user type is 'OWNER'
    if (type !== 'OWNER') {
      return res.status(400).json({
        success: false,
        message: 'Only owners can view company settings.',
      });
    }

    // Check if `owner_id` and `workspace_id` are available
    if (!id || !workspace_id) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID and Workspace ID are required',
      });
    }

    try {
      const settings = await this.companySettingsService.getByOwnerAndWorkspace(id, workspace_id);

      // Ensure that the company settings belong to the `OWNER` and the `workspace_id` matches
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Company settings not found or you do not have access to view them.',
        });
      }

      return res.json(settings);  // Return the company settings
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update company settings for a specific owner and workspace
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,  // ID of the company settings to update
    @Body() updateCompanySettingDto: UpdateCompanySettingDto,
    @Res() res: Response
  ): Promise<Response<CompanySettings>> {
    const { id: userId, workspace_id, type } = req.user; // Extract from JWT payload

    // Check if the user type is 'OWNER'
    if (type !== 'OWNER') {
      return res.status(400).json({
        success: false,
        message: 'Only owners can update company settings.',
      });
    }

    // Check if `userId` and `workspace_id` are available
    if (!userId || !workspace_id) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID and Workspace ID are required',
      });
    }

    // Validate tax_number_enabled and related fields
    if (updateCompanySettingDto.tax_number_enabled === false &&
      (updateCompanySettingDto.tax_number_type || updateCompanySettingDto.tax_number_value)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot set tax_number_type or tax_number_value when tax_number_enabled is false',
      });
    }

    try {
      // Ensure the settings to be updated belong to the owner's workspace and owner_id
      const updatedSettings = await this.companySettingsService.update(id, updateCompanySettingDto, userId, workspace_id);
      return res.json(updatedSettings);  // Return the updated company settings
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
