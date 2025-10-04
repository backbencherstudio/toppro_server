import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  // Get total count of users assigned to different leads
  async getTotalAssignedLeads(ownerId: string, workspaceId: string) {
    // Get all unique users who are assigned to leads
    const assignedUsers = await this.prisma.user.findMany({
      where: {
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
        leads: {
          some: {
            deleted_at: null,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return {
      total_assigned_users: assignedUsers.length,
    };
  }

  // Get total count of all leads
  async getTotalLeads(ownerId: string, workspaceId: string) {
    const totalLeads = await this.prisma.lead.count({
      where: {
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    return {
      total_leads: totalLeads,
    };
  }

  // Get 5 most recently created leads
  async getRecentLeads(ownerId: string, workspaceId: string) {
    const recentLeads = await this.prisma.lead.findMany({
      where: {
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      select: {
        name: true,
        subject: true,
        created_at: true,
        followup_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 5,
    });

    return {
      recent_leads: recentLeads,
    };
  }

  // Get call counts per day for leads in last 7 days (today + 6 most recent days)
  async getRecent7DaysCalls(ownerId: string, workspaceId: string) {
    // Get today + 6 most recent days (7 days total)
    const dailyCallCounts = [];

    for (let i = 6; i >= 0; i--) {
      const currentDay = new Date();
      currentDay.setDate(currentDay.getDate() - i);

      const startOfDay = new Date(currentDay);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDay);
      endOfDay.setHours(23, 59, 59, 999);

      const callCount = await this.prisma.call.count({
        where: {
          lead: {
            workspace_id: workspaceId,
            owner_id: ownerId,
            deleted_at: null,
          },
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      dailyCallCounts.push({
        date: currentDay.toISOString().split('T')[0], // YYYY-MM-DD format
        call_count: callCount,
      });
    }

    return {
      daily_call_counts: dailyCallCounts,
    };
  }

  // Get total count of leads by stages (DRAFT, SENT)
  async getLeadsByStages(ownerId: string, workspaceId: string) {
    // Get lead counts for each stage (DRAFT, SENT)
    const stageLeadCounts = await Promise.all([
      // Count DRAFT leads
      this.prisma.lead.count({
        where: {
          workspace_id: workspaceId,
          owner_id: ownerId,
          deleted_at: null,
          stage: 'DRAFT',
        },
      }),
      // Count SENT leads
      this.prisma.lead.count({
        where: {
          workspace_id: workspaceId,
          owner_id: ownerId,
          deleted_at: null,
          stage: 'SENT',
        },
      }),
    ]);

    const results = [
      {
        stage_name: 'DRAFT',
        lead_count: stageLeadCounts[0],
      },
      {
        stage_name: 'SENT',
        lead_count: stageLeadCounts[1],
      },
    ];

    // Sort by lead count descending
    results.sort((a, b) => b.lead_count - a.lead_count);

    return {
      leads_by_stages: results,
    };
  }

  // Get 5 most recently edited leads
  async getRecentlyEditedLeads(ownerId: string, workspaceId: string) {
    const recentlyEditedLeads = await this.prisma.lead.findMany({
      where: {
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
        updated_at: {
          not: undefined, // Ensure it has been updated (not just created)
        },
      },
      select: {
        name: true,
        subject: true,
        followup_at: true,
        updated_at: true,
        created_at: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: 5,
    });

    // Add updated field information
    const leadsWithUpdatedField = recentlyEditedLeads.map(lead => ({
      lead_name: lead.name,
      subject: lead.subject,
      updated_date: lead.updated_at,
      followup_at: lead.followup_at,
    }));

    return {
      recently_edited_leads: leadsWithUpdatedField,
    };
  }
}
