import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCallDto } from './dto/create-call.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class CallService {
  constructor(private prisma: PrismaService, private activityService: ActivityService,) { }


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


  async createCall(dto: CreateCallDto, ownerId: string, workspaceId: string) {
    // Verify lead exists
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: dto.lead_id,
        owner_id: ownerId,
        workspace_id: workspaceId,
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${dto.lead_id} not found in this workspace/owner`,
      );
    }

    // ✅ Create call with relation `connect`
    const call = await this.prisma.call.create({
      data: {
        subject: dto.subject,
        call_type: dto.call_type,
        duration: dto.duration,
        description: dto.description,
        result: dto.result,

        // 👇 relation to Lead
        lead: {
          connect: { id: dto.lead_id },
        },

        // 👇 optional relation to Assignee (User)
        ...(dto.assignee_id && {
          assignee: { connect: { id: dto.assignee_id } },
        }),
      },
      select: {
        id: true,
        subject: true,
        call_type: true,
        duration: true,
        assignee_id: true,
        description: true,
        result: true,
        created_at: true,
      },
    });

    // 2️⃣ Get owner name (for message)
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { name: true },
    });


    // 3️⃣ Create activity via ActivityService
    await this.activityService.createActivity(
      workspaceId,
      ownerId,
      dto.lead_id,
      'call',
      `${owner?.name || 'Someone'} created a new Lead call`,
    );

    return call;
  }


  async getAllCallsByLead(
    leadId: string,
    ownerId: string,
    workspaceId: string,
    page = 1,
    limit = 10,
  ) {
    // ✅ Verify lead
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

    const skip = (page - 1) * limit;

    // ✅ Fetch calls with pagination and assignee relation
    const [calls, total] = await Promise.all([
      this.prisma.call.findMany({
        where: { lead_id: leadId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          subject: true,
          call_type: true,
          duration: true,
          assignee_id: true,
          description: true,
          result: true,
          created_at: true,
          assignee: {
            select: { name: true }, // 👈 get assignee name
          },
        },
      }),
      this.prisma.call.count({ where: { lead_id: leadId } }),
    ]);

    return {
      page,
      limit,
      total,
      data: calls.map((call) => ({
        id: call.id,
        subject: call.subject,
        call_type: call.call_type,
        duration: call.duration,
        assignee_id: call.assignee_id,
        assignee_name: call.assignee?.name || null,
        description: call.description,
        result: call.result,
        timeAgo: this.timeAgo(call.created_at),
      })),
    };
  }

  async updateCall(
    id: string,
    ownerId: string,
    workspaceId: string,
    data: Partial<CreateCallDto>,
  ) {
    // check if call exists under this workspace/owner
    const call = await this.prisma.call.findFirst({
      where: {
        id,
        lead: {
          owner_id: ownerId,
          workspace_id: workspaceId,
        },
      },
    });

    if (!call) {
      throw new NotFoundException(
        `Call with id ${id} not found in this workspace/owner`,
      );
    }

    return this.prisma.call.update({
      where: { id },
      data: {
        subject: data.subject,
        call_type: data.call_type,
        duration: data.duration,
        description: data.description,
        result: data.result,
        ...(data.assignee_id && {
          assignee: { connect: { id: data.assignee_id } },
        }),
      },
    });
  }

  // --- DELETE CALL ---
  async deleteCall(id: string, ownerId: string, workspaceId: string) {
    // verify call exists
    const call = await this.prisma.call.findFirst({
      where: {
        id,
        lead: {
          owner_id: ownerId,
          workspace_id: workspaceId,
        },
      },
    });

    if (!call) {
      throw new NotFoundException(
        `Call with id ${id} not found in this workspace/owner`,
      );
    }

    await this.prisma.call.delete({ where: { id } });

    return { success: true, message: 'Call deleted successfully' };
  }

}