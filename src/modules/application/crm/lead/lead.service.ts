// leads.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ✅ Get all leads for a workspace
  async getAllLeads(workspaceId: string) {
    return this.prisma.lead.findMany({
      where: {
        workspace_id: workspaceId,
        deleted_at: null, // exclude soft-deleted
      },
      include: {
        users: true,
        owner: true,
        pipeline: true,
        lead_stage: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ✅ Get specific lead by ID
  async getLeadById(id: string, workspaceId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
        deleted_at: null,
      },
      include: {
        users: true,
        owner: true,
        pipeline: true,
        lead_stage: true,
        tasks: true,
        calls: true,
        emails: true,
        activity: true,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }

    return lead;
  }

}
