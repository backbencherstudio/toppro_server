import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompanySettingsService } from './company-settings.service';
import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';
import { CompanySetting } from './entities/company-setting.entity';

@ApiTags('Company Settings')
@Controller('company-settings')
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) { }

  @Post()
  @ApiOperation({ summary: 'Create company settings' })
  @ApiResponse({ status: 201, description: 'Company settings created successfully', type: CompanySetting })
  @ApiResponse({ status: 409, description: 'Conflict - Failed to create company settings' })
  async create(
    @Body() createCompanySettingDto: CreateCompanySettingDto,
    @Request() req: any
  ): Promise<CompanySetting> {
    return this.companySettingsService.create(
      createCompanySettingDto,
      req.user?.owner_id,
      req.user?.workspace_id,
      req.user?.id
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all company settings' })
  @ApiResponse({ status: 200, description: 'Company settings retrieved successfully', type: [CompanySetting] })
  async findAll(
    @Request() req: any,
    @Query('workspace_id') workspaceId?: string
  ): Promise<CompanySetting[]> {
    return this.companySettingsService.findAll(
      req.user?.owner_id,
      workspaceId || req.user?.workspace_id
    );
  }

  @Get('workspace/:workspaceId')
  @ApiOperation({ summary: 'Get company settings by workspace' })
  @ApiResponse({ status: 200, description: 'Company settings retrieved successfully', type: CompanySetting })
  @ApiResponse({ status: 404, description: 'Company settings not found' })
  async findByWorkspace(@Param('workspaceId') workspaceId: string): Promise<CompanySetting | null> {
    return this.companySettingsService.findByWorkspace(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company settings by ID' })
  @ApiResponse({ status: 200, description: 'Company settings retrieved successfully', type: CompanySetting })
  @ApiResponse({ status: 404, description: 'Company settings not found' })
  async findOne(@Param('id') id: string): Promise<CompanySetting> {
    return this.companySettingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company settings by ID' })
  @ApiResponse({ status: 200, description: 'Company settings updated successfully', type: CompanySetting })
  @ApiResponse({ status: 404, description: 'Company settings not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCompanySettingDto: UpdateCompanySettingDto
  ): Promise<CompanySetting> {
    return this.companySettingsService.update(id, updateCompanySettingDto);
  }

  @Patch('workspace/:workspaceId')
  @ApiOperation({ summary: 'Update company settings by workspace' })
  @ApiResponse({ status: 200, description: 'Company settings updated successfully', type: CompanySetting })
  @ApiResponse({ status: 201, description: 'Company settings created successfully', type: CompanySetting })
  async updateByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Body() updateCompanySettingDto: UpdateCompanySettingDto
  ): Promise<CompanySetting> {
    return this.companySettingsService.updateByWorkspace(workspaceId, updateCompanySettingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete company settings' })
  @ApiResponse({ status: 204, description: 'Company settings deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company settings not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.companySettingsService.remove(id);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete company settings' })
  @ApiResponse({ status: 204, description: 'Company settings permanently deleted' })
  @ApiResponse({ status: 404, description: 'Company settings not found' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.companySettingsService.hardDelete(id);
  }
}
