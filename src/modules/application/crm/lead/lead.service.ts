import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) { }


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
  async getAllLeads(ownerId: string, workspaceId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [leads, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where: {
          workspace_id: workspaceId,
          owner_id: ownerId,
          deleted_at: null,
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          subject: true,
          stage: true,
          followup_at: true,
          owner_id: true,
          owner: {
            select: { id: true, name: true },
          },
          workspace_id: true,
          workspace: {
            select: { id: true, name: true },
          },
          users: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { tasks: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.lead.count({
        where: {
          workspace_id: workspaceId,
          owner_id: ownerId,
          deleted_at: null,
        },
      }),
    ]);

    return {
      data: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        subject: lead.subject,
        stage: lead.stage,
        followup_at: lead.followup_at,
        owner_id: lead.owner_id,
        owner_name: lead.owner?.name ?? null,
        workspace_id: lead.workspace_id,
        workspace_name: lead.workspace?.name ?? null,
        users: lead.users,
        tasks: lead._count.tasks,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  // ✅ Get specific lead by ID
  async getLeadById(id: string, ownerId: string, workspaceId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      select: {
        id: true,
        owner_id: true,
        owner: {
          select: { id: true, name: true },
        },
        workspace_id: true,
        workspace: {
          select: { id: true, name: true },
        },
        email: true,
        phone: true,
        pipeline: {
          select: { id: true, name: true },
        },
        stage: true,
        created_at: true,
        followup_at: true,
        _count: {
          select: {
            tasks: true,
            products: true,
            sources: true,
            files: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${id} not found for this owner/workspace`,
      );
    }

    return {
      id: lead.id,
      owner_id: lead.owner_id,
      owner_name: lead.owner?.name ?? null,
      workspace_id: lead.workspace_id,
      workspace_name: lead.workspace?.name ?? null,
      email: lead.email,
      phone: lead.phone,
      pipeline: lead.pipeline ? lead.pipeline.name : null,
      stage: lead.stage,
      created_at: lead.created_at,
      followup_at: lead.followup_at,
      total_tasks: lead._count.tasks,
      total_products: lead._count.products,
      total_sources: lead._count.sources,
      total_files: lead._count.files,
    };
  }

  async updateLead(id: string, ownerId: string, workspaceId: string, dto: UpdateLeadDto) {
    const sourceConnect = dto.sources
      ? { set: dto.sources.map((id) => ({ id })) }
      : undefined;

    const productConnect = dto.products
      ? { set: dto.products.map((id) => ({ id })) }
      : undefined;

    return this.prisma.lead.update({
      where: {
        id,
        workspace_id: workspaceId,
        owner_id: ownerId,
      },
      data: {
        subject: dto.subject,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        followup_at: dto.followup_at ? new Date(dto.followup_at) : undefined,
        pipeline_id: dto.pipeline_id,
        stage: dto.stage as any, // cast if enum
        notes: dto.notes,
        ...(sourceConnect && { sources: sourceConnect }),
        ...(productConnect && { products: productConnect }),
      },
      include: {
        sources: true,
        products: true,
      },
    });
  }

  async deleteLead(id: string, ownerId: string, workspaceId: string) {
    // ✅ Validate lead existence
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${id} not found in this workspace for this owner`,
      );
    }

    // ✅ Soft delete
    await this.prisma.lead.update({
      where: { id: lead.id },
      data: { deleted_at: new Date() },
    });

    return {
      success: true,
      message: 'Lead deleted successfully',
      leadId: id,
    };
  }


}
