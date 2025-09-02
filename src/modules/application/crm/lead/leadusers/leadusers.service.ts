import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeadsUserService {
  constructor(private prisma: PrismaService) { }

  async addUsersToLead(
    leadId: string,
    workspaceId: string,
    ownerId: string,
    userIds: string[],
  ) {
    // 1️⃣ Verify lead exists for current owner/workspace
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found in this workspace/owner`,
      );
    }

    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        users: {
          connect: userIds.map((id) => ({ id })),
        },
      },
    });

    // ✅ return only success, lead_id and added users
    return {
      success: true,
      message: 'Users added to lead successfully',
      lead_id: leadId,
      userIds: userIds,
    };
  }

  async getUsersForLead(leadId: string, workspaceId: string, ownerId: string) {
    // 1️⃣ Verify lead exists in this workspace and owner
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found for this workspace/owner`,
      );
    }

    // 2️⃣ Return only users list
    return {
      success: true,
      lead_id: leadId,
      users: lead.users,
    };
  }

  async removeUserFromLead(
    leadId: string,
    workspaceId: string,
    ownerId: string,
    userId: string,
  ) {
    // 1️⃣ Verify lead exists
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found in this workspace/owner`,
      );
    }

    // 2️⃣ Disconnect user from lead
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        users: {
          disconnect: { id: userId },
        },
      },
    });

    // ✅ return minimal response
    return {
      success: true,
      message: `User ${userId} removed from lead successfully`,
      lead_id: leadId,
      removed_user_id: userId,
    };
  }
}
