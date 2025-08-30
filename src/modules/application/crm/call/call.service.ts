// src/calls/call.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { CallQueryDto } from './dto/call-query.dto';
import { CallEntity } from './entities/call.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CallService {
  constructor(private prisma: PrismaService) {}

  async create(createCallDto: CreateCallDto, userId: string, workspaceId: string): Promise<CallEntity> {
    // Verify lead exists and belongs to the same workspace
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: createCallDto.lead_id,
        workspace_id: workspaceId,
      },
    });

    if (!lead) {
      throw new BadRequestException('Lead not found or does not belong to this workspace');
    }

    // If assignee_id is provided, verify user exists
    if (createCallDto.assignee_id) {
      const assignee = await this.prisma.user.findFirst({
        where: {
          id: createCallDto.assignee_id,
        },
      });

      if (!assignee) {
        throw new BadRequestException('Assignee not found');
      }
    }

    // Validate duration format if provided
    if (createCallDto.duration && !this.isValidDuration(createCallDto.duration)) {
      throw new BadRequestException('Duration must be in h:m:s format (e.g., 00:35:20)');
    }

    const call = await this.prisma.call.create({
      data: {
        ...createCallDto,
        workspace_id: workspaceId,
        owner_id: userId, // This is the user creating the call
      },
    });

    return new CallEntity(call);
  }

  async findAll(
    workspaceId: string,
    leadId?: string,
    query?: CallQueryDto,
  ): Promise<CallEntity[]> {
    const whereClause: any = {
      workspace_id: workspaceId,
    };

    if (leadId) {
      whereClause.lead_id = leadId;
    }

    if (query?.call_type) {
      whereClause.call_type = query.call_type;
    }

    if (query?.assignee_id) {
      whereClause.assignee_id = query.assignee_id;
    }

    const calls = await this.prisma.call.findMany({
      where: whereClause,
      include: {
        lead: {
          select: {
            id: true,
            subject: true,
            name: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return calls.map(call => new CallEntity(call));
  }

  async findOne(id: string, workspaceId: string): Promise<CallEntity> {
    const call = await this.prisma.call.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
      },
      include: {
        lead: {
          select: {
            id: true,
            subject: true,
            name: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!call) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }

    return new CallEntity(call);
  }

  async update(
    id: string,
    updateCallDto: UpdateCallDto,
    workspaceId: string,
  ): Promise<CallEntity> {
    // Check if call exists and belongs to workspace
    const existingCall = await this.prisma.call.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
      },
    });

    if (!existingCall) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }

    // If lead_id is being updated, verify lead exists and belongs to the same workspace
    if (updateCallDto.lead_id) {
      const lead = await this.prisma.lead.findFirst({
        where: {
          id: updateCallDto.lead_id,
          workspace_id: workspaceId,
        },
      });

      if (!lead) {
        throw new BadRequestException('Lead not found or does not belong to this workspace');
      }
    }

    // If assignee_id is being updated, verify user exists
    if (updateCallDto.assignee_id) {
      const assignee = await this.prisma.user.findFirst({
        where: {
          id: updateCallDto.assignee_id,
        },
      });

      if (!assignee) {
        throw new BadRequestException('Assignee not found');
      }
    }

    // Validate duration format if provided
    if (updateCallDto.duration && !this.isValidDuration(updateCallDto.duration)) {
      throw new BadRequestException('Duration must be in h:m:s format (e.g., 00:35:20)');
    }

    const updatedCall = await this.prisma.call.update({
      where: { id },
      data: updateCallDto,
      include: {
        lead: {
          select: {
            id: true,
            subject: true,
            name: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return new CallEntity(updatedCall);
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    // Check if call exists and belongs to workspace
    const existingCall = await this.prisma.call.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
      },
    });

    if (!existingCall) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }

    await this.prisma.call.delete({
      where: { id },
    });
  }

  // Helper method to validate duration format (h:m:s)
  private isValidDuration(duration: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    return regex.test(duration);
  }
}