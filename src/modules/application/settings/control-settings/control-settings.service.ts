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


import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateControllerSettingDto } from './dto/update-control-setting.dto';

@Injectable()
export class ControllerSettingsService {
  private readonly logger = new Logger(ControllerSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMySettings(user: any) {
    this.logger.log(`Getting settings for user ${user.id} (${user.type})`);
    
    const where: any = {};
    if (user.type === 'SUPERADMIN') where.super_id = user.id;
    else if (user.type === 'OWNER') where.owner_id = user.id;
    else throw new ForbiddenException('Access denied');

    let setting = await this.prisma.controllerSettings.findFirst({ where });
    
    if (!setting) {
      this.logger.log(`No settings found for user ${user.id}, creating default settings`);
      setting = await this.prisma.controllerSettings.create({
        data: {
          super_id: user.type === 'SUPERADMIN' ? user.id : null,
          owner_id: user.type === 'OWNER' ? user.id : null,
        },
      });
    }
    
    return setting;
  }

  async updateMySettings(dto: UpdateControllerSettingDto, user: any) {
    this.logger.log(`Updating settings for user ${user.id} (${user.type})`);
    this.logger.debug('DTO received:', dto);
    
    const where: any = {};
    if (user.type === 'SUPERADMIN') where.super_id = user.id;
    else if (user.type === 'OWNER') where.owner_id = user.id;
    else throw new ForbiddenException('Access denied');

    const existing = await this.prisma.controllerSettings.findFirst({ where });
    
    const payload: any = {
      ...dto,
      updated_at: new Date(),
    };
    
    this.logger.debug('Payload to save:', payload);

    if (existing) {
      this.logger.log(`Updating existing settings with ID ${existing.id}`);
      return this.prisma.controllerSettings.update({
        where: { id: existing.id },
        data: payload,
      });
    }

    this.logger.log(`Creating new settings for user ${user.id}`);
    return this.prisma.controllerSettings.create({
      data: {
        ...payload,
        super_id: user.type === 'SUPERADMIN' ? user.id : null,
        owner_id: user.type === 'OWNER' ? user.id : null,
      },
    });
  }
}