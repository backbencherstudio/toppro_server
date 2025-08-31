// leads.service.ts
import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) { }

  // async createLead(dto: CreateLeadDto, ownerId: string, workspaceId: string, userId: string) {
  //   return this.prisma.lead.create({
  //     data: {
  //       subject: dto.subject,
  //       name: dto.name,
  //       email: dto.email,
  //       phone: dto.phone,
  //       followup_at: new Date(dto.followup_at),

  //       owner_id: ownerId,       // from JWT
  //       workspace_id: workspaceId, // from JWT
  //       user_id: ownerId,           // from JWT

  //       // users: {
  //       //   connect: dto.users.map((id) => ({ id })),
  //       // },
  //     },
  //     include: {
  //       users: true,
  //     },
  //   });
  // }

  async createLead(dto: CreateLeadDto, ownerId: string, workspaceId: string, userId: string) {
    // build list of unique user IDs: owner + dto.users
    const userIds = Array.from(new Set([ownerId, ...dto.users]));

    return this.prisma.lead.create({
      data: {
        subject: dto.subject,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        followup_at: new Date(dto.followup_at),

        owner_id: ownerId,        // creator
        workspace_id: workspaceId,

        user_id: ownerId,         // optional primary snapshot

        // attach both owner + assigned users
        users: {
          connect: userIds.map((id) => ({ id })),
        },
      },
      include: {
        users: true,
      },
    });
  }

}
