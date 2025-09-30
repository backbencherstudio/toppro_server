// import { Injectable } from '@nestjs/common';
// import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
// import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';
// import { CompanySettings } from '@prisma/client';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class CompanySettingsService {
//   constructor(private readonly prisma: PrismaService) {}

//   // Create a new company settings record under a specific owner and workspace
//   async create(createCompanySettingDto: CreateCompanySettingDto, ownerId: string, workspaceId: string): Promise<CompanySettings> {
//     if (!ownerId || !workspaceId) {
//       throw new Error('Owner ID and Workspace ID are required');
//     }

//     return await this.prisma.companySettings.create({
//       data: {
//         ...createCompanySettingDto,
//         owner_id: ownerId,  // Set owner_id from the controller (user's id)
//         workspace_id: workspaceId,  // Set workspace_id from the controller
//       },
//     });
//   }

//   // Get company settings by owner and workspace
//   async getByOwnerAndWorkspace(ownerId: string, workspaceId: string): Promise<CompanySettings | null> {
//     return await this.prisma.companySettings.findFirst({
//       where: {
//         owner_id: ownerId,
//         workspace_id: workspaceId,
//       },
//     });
//   }

//   // Update company settings for a specific owner and workspace
//   async update(id: string, updateCompanySettingDto: UpdateCompanySettingDto, ownerId: string, workspaceId: string): Promise<CompanySettings> {
//     const existingSettings = await this.prisma.companySettings.findFirst({
//       where: {
//         id,
//         owner_id: ownerId,  // Ensure only the owner can update their settings
//         workspace_id: workspaceId,
//       },
//     });

//     if (!existingSettings) {
//       throw new Error('Company settings not found or you do not have access to update them');
//     }

//     return await this.prisma.companySettings.update({
//       where: { id },
//       data: updateCompanySettingDto,
//     });
//   }
// }

import { Injectable } from '@nestjs/common';
import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';
import { CompanySettings } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanySettingsService {
  constructor(private readonly prisma: PrismaService) { }

  // Create a new company settings record under a specific owner and workspace
  async create(createCompanySettingDto: CreateCompanySettingDto, ownerId: string, workspaceId: string): Promise<CompanySettings> {
    if (!ownerId || !workspaceId) {
      throw new Error('Owner ID and Workspace ID are required');
    }

    return await this.prisma.companySettings.create({
      data: {
        ...createCompanySettingDto,
        owner_id: ownerId,  // Set owner_id from the controller (user's id)
        workspace_id: workspaceId,  // Set workspace_id from the controller
      },
    });
  }

  // Get company settings by owner and workspace
  async getByOwnerAndWorkspace(ownerId: string, workspaceId: string): Promise<CompanySettings | null> {
    return await this.prisma.companySettings.findFirst({
      where: {
        owner_id: ownerId,  // Ensure owner_id matches
        workspace_id: workspaceId,  // Ensure workspace_id matches
      },
    });
  }

  // Update company settings for a specific owner and workspace
  async update(id: string, updateCompanySettingDto: UpdateCompanySettingDto, ownerId: string, workspaceId: string): Promise<CompanySettings> {
    // Ensure the settings to be updated belong to the owner's workspace and owner_id
    const existingSettings = await this.prisma.companySettings.findFirst({
      where: {
        id,
        owner_id: ownerId,  // Ensure only the owner can update their settings
        workspace_id: workspaceId,  // Ensure workspace_id matches
      },
    });

    if (!existingSettings) {
      throw new Error('Company settings not found or you do not have access to update them');
    }

    return await this.prisma.companySettings.update({
      where: { id },
      data: updateCompanySettingDto,
    });
  }
}
