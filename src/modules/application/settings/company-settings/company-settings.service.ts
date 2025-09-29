import { Injectable } from '@nestjs/common';
import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';
import { CompanySettings } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new company settings record under a specific owner and workspace
  async create(createCompanySettingDto: CreateCompanySettingDto, ownerId: string, workspaceId: string): Promise<CompanySettings> {
    return await this.prisma.companySettings.create({
      data: {
        ...createCompanySettingDto,
        owner_id: ownerId,
        workspace_id: workspaceId,
      },
    });
  }

  // Get company settings by owner and workspace
  async getByOwnerAndWorkspace(ownerId: string, workspaceId: string): Promise<CompanySettings | null> {
    return await this.prisma.companySettings.findFirst({
      where: {
        owner_id: ownerId,
        workspace_id: workspaceId,
      },
    });
  }

  // Update company settings for a specific owner and workspace
  async update(updateCompanySettingDto: UpdateCompanySettingDto, ownerId: string, workspaceId: string): Promise<CompanySettings> {
    const companySetting = await this.prisma.companySettings.findFirst({
      where: {
        owner_id: ownerId,
        workspace_id: workspaceId,
      },
    });

    if (!companySetting) {
      throw new Error('Company settings not found');
    }

    return this.prisma.companySettings.update({
      where: { id: companySetting.id }, // Use `id` to update the record
      data: updateCompanySettingDto,
    });
  }
}
