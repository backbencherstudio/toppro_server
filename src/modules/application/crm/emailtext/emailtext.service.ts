import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmailTextDto } from './dto/create-emailtext.dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class EmailTextService {
  constructor(private prisma: PrismaService, private activityService: ActivityService) { }

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

  async createEmailText(
    dto: CreateEmailTextDto,
    ownerId: string,
    workspaceId: string,
  ) {
    // ✅ Verify lead exists under same workspace & owner
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
        `Lead with id ${dto.lead_id} not found for this workspace/owner`,
      );
    }

    // ✅ Create email text
    const emailText = await this.prisma.emailText.create({
      data: {
        lead_id: dto.lead_id,
        mail_to: dto.mail_to,
        subject: dto.subject,
        description: dto.description,
      },
      select: {
        id: true,
        mail_to: true,
        subject: true,
        description: true,
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
      'email',
      `${owner?.name || 'Someone'} created a new Lead Email`,
    );

    return emailText;

  }

  async getAllByLead(leadId: string, ownerId: string, workspaceId: string) {
    // ✅ Verify lead exists
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

    // ✅ Fetch emails
    const emails = await this.prisma.emailText.findMany({
      where: { lead_id: leadId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        mail_to: true,
        subject: true,
        description: true,
        created_at: true, // need this internally to compute timeAgo
      },
    });

    // ✅ Transform response → add `timeAgo`, remove created_at
    return emails.map((email) => ({
      id: email.id,
      mail_to: email.mail_to,
      subject: email.subject,
      description: email.description,
      timeAgo: this.timeAgo(email.created_at),
    }));
  }
}
