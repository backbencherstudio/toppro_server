import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';
import { CompanySetting } from './entities/company-setting.entity';

@Injectable()
export class CompanySettingsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createCompanySettingDto: CreateCompanySettingDto, ownerId?: string, workspaceId?: string, userId?: string): Promise<CompanySetting> {
    try {
      const companySetting = await this.prisma.companySettings.create({
        data: {
          ...createCompanySettingDto,
          owner_id: ownerId,
          workspace_id: workspaceId,
          user_id: userId,
        },
      });

      return companySetting as CompanySetting;
    } catch (error) {
      throw new ConflictException('Failed to create company setting');
    }
  }

  async findAll(ownerId?: string, workspaceId?: string): Promise<CompanySetting[]> {
    const where: any = {
      deleted_at: null,
    };

    if (ownerId) {
      where.owner_id = ownerId;
    }

    if (workspaceId) {
      where.workspace_id = workspaceId;
    }

    const companySettings = await this.prisma.companySettings.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return companySettings as CompanySetting[];
  }

  async findOne(id: string): Promise<CompanySetting> {
    const companySetting = await this.prisma.companySettings.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!companySetting) {
      throw new NotFoundException(`Company setting with ID ${id} not found`);
    }

    return companySetting as CompanySetting;
  }

  async findByWorkspace(workspaceId: string): Promise<CompanySetting | null> {
    const companySetting = await this.prisma.companySettings.findFirst({
      where: {
        workspace_id: workspaceId,
        deleted_at: null,
      },
    });

    return companySetting as CompanySetting | null;
  }

  async update(id: string, updateCompanySettingDto: UpdateCompanySettingDto): Promise<CompanySetting> {
    const existingSetting = await this.findOne(id);

    const companySetting = await this.prisma.companySettings.update({
      where: { id },
      data: {
        ...updateCompanySettingDto,
        updated_at: new Date(),
      },
    });

    return companySetting as CompanySetting;
  }

  async updateByWorkspace(workspaceId: string, updateCompanySettingDto: UpdateCompanySettingDto): Promise<CompanySetting> {
    const existingSetting = await this.findByWorkspace(workspaceId);

    if (!existingSetting) {
      // Create new setting if none exists
      return this.create(updateCompanySettingDto, undefined, workspaceId);
    }

    const companySetting = await this.prisma.companySettings.update({
      where: { id: existingSetting.id },
      data: {
        ...updateCompanySettingDto,
        updated_at: new Date(),
      },
    });

    return companySetting as CompanySetting;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    await this.prisma.companySettings.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    await this.prisma.companySettings.delete({
      where: { id },
    });
  }
}
