import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateWebsiteInfoDto } from './dto/update-website-info.dto';
import { SojebStorage } from '../../../../common/lib/Disk/SojebStorage';
import appConfig from '../../../../config/app.config';

@Injectable()
export class WebsiteInfoService {
  constructor(private prisma: PrismaService) {}

  async getInfo() {
    const websiteInfo = await this.prisma.websiteInfo.findFirst({
      select: {
        id: true,
        site_name: true,
        site_description: true,
        time_zone: true,
        phone_number: true,
        email: true,
        address: true,
        logo: true,
        favicon: true,
        copyright: true,
        cancellation_policy: true,
      },
    });

    if (!websiteInfo) return null;

    if (websiteInfo.logo) {
      websiteInfo['logo_url'] = SojebStorage.url(
        appConfig().storageUrl.websiteInfo + websiteInfo.logo,
      );
    }

    if (websiteInfo.favicon) {
      websiteInfo['favicon_url'] = SojebStorage.url(
        appConfig().storageUrl.websiteInfo + websiteInfo.favicon,
      );
    }

    return { success: true, data: websiteInfo };
  }

  async updateInfo(
    dto: UpdateWebsiteInfoDto,
    files?: {
      logo?: Express.Multer.File[];
      favicon?: Express.Multer.File[];
    },
  ) {
    const existing = await this.prisma.websiteInfo.findFirst();
    if (!existing) throw new Error('Website settings not found.');

    const data: any = {
      ...dto,
      updated_at: new Date(),
    };

    // Handle logo
    if (files?.logo?.[0]) {
      if (existing.logo) {
        await SojebStorage.delete(
          appConfig().storageUrl.websiteInfo + existing.logo,
        );
      }
      data.logo = files.logo[0].filename;
    }

    // Handle favicon
    if (files?.favicon?.[0]) {
      if (existing.favicon) {
        await SojebStorage.delete(
          appConfig().storageUrl.websiteInfo + existing.favicon,
        );
      }
      data.favicon = files.favicon[0].filename;
    }

    return this.prisma.websiteInfo.update({
      where: { id: existing.id },
      data,
    });
  }

  async restoreDefaults() {
    const existing = await this.prisma.websiteInfo.findFirst();
    if (!existing) throw new Error('Website settings not found.');

    // Delete logo and favicon files if they exist
    if (existing.logo) {
      await SojebStorage.delete(
        appConfig().storageUrl.websiteInfo + existing.logo,
      );
    }
    if (existing.favicon) {
      await SojebStorage.delete(
        appConfig().storageUrl.websiteInfo + existing.favicon,
      );
    }

    return this.prisma.websiteInfo.update({
      where: { id: existing.id },
      data: {
        site_name: 'Default Site',
        site_description: 'Default description',
        time_zone: 'UTC',
        phone_number: '1234567890',
        email: 'admin@example.com',
        address: 'Default address',
        logo: null,
        favicon: null,
        copyright: '',
        cancellation_policy: '',
        updated_at: new Date(),
      },
    });
  }
}
