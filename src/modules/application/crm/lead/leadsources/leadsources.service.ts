import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeadsSourceService {
  constructor(private prisma: PrismaService) {}

  async addSourcesToLead(
    leadId: string,
    workspaceId: string,
    ownerId: string,
    sourceIds: string[],
  ) {
    // 1️⃣ Check that the lead exists in this workspace/owner
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId
      },
      select: { id: true },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found in this workspace/owner`,
      );
    }

    // 2️⃣ Attach the sources
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        sources: {
          connect: sourceIds.map((id) => ({ id })),
        },
      },
    });

    // ✅ Return clean response
    return {
      success: true,
      message: 'Sources added to lead successfully',
      lead_id: leadId,
      sourceIds,
    };
  }

   async getSourcesForLead(leadId: string, workspaceId: string, ownerId: string) {
    // 1️⃣ Verify the lead exists
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      include: {
        sources: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found in this workspace/owner`,
      );
    }

    // 2️⃣ Format response
    return {
      success: true,
      lead_id: lead.id,
      sources: lead.sources.map((s) => ({
        source_id: s.id,
        name: s.name,
      })),
    };
  }

  async removeSourceFromLead(
    leadId: string,
    workspaceId: string,
    ownerId: string,
    sourceId: string,
  ) {
    // 1️⃣ Verify lead exists
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId,
      },
      include: {
        sources: { select: { id: true, name: true } },
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found in this workspace/owner`,
      );
    }

    // 2️⃣ Verify source exists
    const source = await this.prisma.source.findUnique({
      where: { id: sourceId },
      select: { id: true, name: true },
    });

    if (!source) {
      throw new NotFoundException(`Source with id ${sourceId} not found`);
    }

        // 3️⃣ Check if source is attached to this lead
    const isAttached = lead.sources.some((s) => s.id === sourceId);
    if (!isAttached) {
      throw new BadRequestException(
        `Source '${source.name}' is not assigned to this lead`,
      );
    }

    // 3️⃣ Disconnect source
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        sources: {
          disconnect: { id: sourceId },
        },
      },
    });

    // ✅ Return with source name
    return {
      success: true,
      message: `Source '${source.name}' removed from lead successfully`,
      lead_id: leadId,
      removed_source: {
        id: source.id,
      },
    };
  }
}
