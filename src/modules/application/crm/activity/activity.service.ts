import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivityService {
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

  async createActivity(
    workspaceId: string,
    ownerId: string,
    leadId: string,
    type: string,
    message: string,
  ) {
    return this.prisma.activity.create({
      data: {
        workspace_id: workspaceId,
        owner_id: ownerId,
        lead_id: leadId,
        type,
        message,
      },
    });
  }

  async getAllActivitiesByLead(
    leadId: string,
    workspaceId: string,
    ownerId: string,
  ) {

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { lead_id: leadId },
        orderBy: { created_at: 'desc' },
        include: {
          owner: { select: { id: true, name: true } },
        },
      }),
      this.prisma.activity.count({ where: { lead_id: leadId } }),
    ]);

    return {
      success: true,
      total,
      data: activities.map(act => ({
        id: act.id,
        type: act.type,
        message: act.message,
        owner_id: act.owner_id,
        owner_name: act.owner?.name || null,
        time_ago: this.timeAgo(act.created_at),
      })),
    };
  }
}
