import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { CallQueryDto } from './dto/call-query.dto';
import { CallEntity } from './entities/call.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CallService {
  constructor(private prisma: PrismaService) {}


  async createCall(dto: CreateCallDto, ownerId: string, workspaceId: string) {
  // ✅ Verify lead exists
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
  return this.prisma.call.create({
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
}

}