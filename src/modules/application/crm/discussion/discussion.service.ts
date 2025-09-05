import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';

@Injectable()
export class DiscussionService {
  constructor(private prisma: PrismaService) {}

  private timeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const key in intervals) {
      const value = Math.floor(seconds / intervals[key]);
      if (value >= 1) {
        return `${value} ${key}${value > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  }

  // --- CREATE DISCUSSION ---
  async createDiscussion(dto: CreateDiscussionDto, ownerId: string, workspaceId: string) {
    // verify lead exists
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: dto.lead_id,
        owner_id: ownerId,
        workspace_id: workspaceId,
      },
      select: { id: true },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${dto.lead_id} not found in this workspace/owner`,
      );
    }

    return this.prisma.discussion.create({
      data: {
        content: dto.content,
        lead: { connect: { id: dto.lead_id } },
        owner: { connect: { id: ownerId } },
        workspace: { connect: { id: workspaceId } },
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        owner: { select: { id: true, name: true } },
      },
    });
  }

  // --- GET ALL DISCUSSIONS BY LEAD ---
  async getAllDiscussionsByLead(
    leadId: string,
    ownerId: string,
    workspaceId: string,
  ) {
    // verify lead exists
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        owner_id: ownerId,
        workspace_id: workspaceId,
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found in this workspace/owner`,
      );
    }

    

    const [discussions, total] = await Promise.all([
      this.prisma.discussion.findMany({
        where: { lead_id: leadId },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          content: true,
          created_at: true,
          owner: { select: { id: true, name: true } },
        },
      }),
      this.prisma.discussion.count({ where: { lead_id: leadId } }),
    ]);

    return {
      total,
      leadId,
      data: discussions.map((d) => ({
        id: d.id,
        content: d.content,
        owner_id: d.owner.id,
        owner_name: d.owner.name,
        timeAgo: this.timeAgo(d.created_at),
      })),
    };
  }
}
