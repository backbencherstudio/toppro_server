// import { Injectable, ForbiddenException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { UpdateControllerSettingDto } from './dto/update-control-setting.dto';

// @Injectable()
// export class ControllerSettingsService {
//   constructor(private readonly prisma: PrismaService) {}

//   // fetch or auto-create blank settings for current user (owner / superadmin)
//   async getMySettings(user: any) {
//     const where: any = {};
//     if (user.type === 'SUPERADMIN') where.super_id = user.id;
//     else if (user.type === 'OWNER') where.owner_id = user.id;
//     else throw new ForbiddenException('Access denied');

//     const setting = await this.prisma.controllerSettings.findFirst({ where });
//     if (!setting) {
//       return this.prisma.controllerSettings.create({
//         data: {
//           user_id: user.id,
//           super_id: user.type === 'SUPERADMIN' ? user.id : null,
//           owner_id: user.type === 'OWNER' ? user.id : null,
//         },
//       });
//     }
//     return setting;
//   }

//   // Update or create settings (with image URLs already resolved by controller)
//   async updateMySettings(dto: UpdateControllerSettingDto, user: any) {
//     const where: any = {};
//     if (user.type === 'SUPERADMIN') where.super_id = user.id;
//     else if (user.type === 'OWNER') where.owner_id = user.id;
//     else throw new ForbiddenException('Access denied');

//     const existing = await this.prisma.controllerSettings.findFirst({ where });

//     const payload: any = {
//       ...dto,
//       updated_at: new Date(),
//     };

//     if (existing) {
//       return this.prisma.controllerSettings.update({
//         where: { id: existing.id },
//         data: payload,
//       });
//     }

//     return this.prisma.controllerSettings.create({
//       data: {
//         ...payload,
//         user_id: user.id,
//         super_id: user.type === 'SUPERADMIN' ? user.id : null,
//         owner_id: user.type === 'OWNER' ? user.id : null,
//       },
//     });
//   }
// }


import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateControllerSettingDto } from './dto/update-control-setting.dto';

@Injectable()
export class ControllerSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // fetch or auto-create blank settings for current user (owner / superadmin)
  async getMySettings(user: any) {
    const where: any = {};
    if (user.type === 'SUPERADMIN') where.super_id = user.id;
    else if (user.type === 'OWNER') where.owner_id = user.id;
    else throw new ForbiddenException('Access denied');

    const setting = await this.prisma.controllerSettings.findFirst({ where });
    if (!setting) {
      return this.prisma.controllerSettings.create({
        data: {
          user_id: user.id,
          super_id: user.type === 'SUPERADMIN' ? user.id : null,
          owner_id: user.type === 'OWNER' ? user.id : null,
        },
      });
    }
    return setting;
  }

  // Update or create settings (with image URLs already resolved by controller)
  async updateMySettings(dto: UpdateControllerSettingDto, user: any) {
    const where: any = {};
    if (user.type === 'SUPERADMIN') where.super_id = user.id;
    else if (user.type === 'OWNER') where.owner_id = user.id;
    else throw new ForbiddenException('Access denied');

    const existing = await this.prisma.controllerSettings.findFirst({ where });

    const payload: any = {
      ...dto,
      updated_at: new Date(),
    };

    if (existing) {
      return this.prisma.controllerSettings.update({
        where: { id: existing.id },
        data: payload,
      });
    }

    return this.prisma.controllerSettings.create({
      data: {
        ...payload,
        user_id: user.id,
        super_id: user.type === 'SUPERADMIN' ? user.id : null,
        owner_id: user.type === 'OWNER' ? user.id : null,
        logo_dark: dto.logo_dark || existing.logo_dark,
        logo_light: dto.logo_light || existing.logo_light, 
        logo_favicon: dto.logo_favicon || existing.logo_favicon,
        tilte_text: dto.tilte_text || existing.tilte_text,
        footer_text: dto.footer_text || existing.footer_text,
        customer_prefix: dto.customer_prefix || existing.customer_prefix,
        vendor_prefix: dto.vendor_prefix || existing.vendor_prefix
      },
      include: {
        user: true,
      },
    });
  }
}
