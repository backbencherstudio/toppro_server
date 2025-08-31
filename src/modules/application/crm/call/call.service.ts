import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { CallQueryDto } from './dto/call-query.dto';
import { CallEntity } from './entities/call.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CallService {
  constructor(private prisma: PrismaService) {}

  // Get all users that can be assigned to calls
  async getAssignees(workspaceId: string) {
    return this.prisma.user.findMany({
      where: {
        workspace_id: workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Create a new call
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

    let assignee_id = null;
    
    // If assignee_name is provided, find the user and get their ID
    if (createCallDto.assignee_name) {
      const assignee = await this.prisma.user.findFirst({
        where: {
          name: createCallDto.assignee_name,
          workspace_id: workspaceId,
        },
      });

      if (!assignee) {
        throw new BadRequestException(`Assignee with name '${createCallDto.assignee_name}' not found`);
      }
      
      assignee_id = assignee.id;
    }

    // Validate duration format if provided
    if (createCallDto.duration && !this.isValidDuration(createCallDto.duration)) {
      throw new BadRequestException('Duration must be in h:m:s format (e.g., 00:35:20)');
    }

    const call = await this.prisma.call.create({
      data: {
        subject: createCallDto.subject,
        call_type: createCallDto.call_type,
        duration: createCallDto.duration,
        assignee_id: assignee_id,
        description: createCallDto.description,
        result: createCallDto.result,
        lead_id: createCallDto.lead_id,
        workspace_id: workspaceId,
        owner_id: userId,
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

    return new CallEntity(call);
  }

  // Get all calls with optional filtering
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

    if (query?.assignee_name) {
      // Find users with the specified name
      const assignees = await this.prisma.user.findMany({
        where: {
          name: {
            contains: query.assignee_name,
            mode: 'insensitive',
          },
          workspace_id: workspaceId,
        },
        select: {
          id: true,
        },
      });

      const assigneeIds = assignees.map(assignee => assignee.id);
      
      if (assigneeIds.length > 0) {
        whereClause.assignee_id = {
          in: assigneeIds,
        };
      } else {
        // No assignees found with that name, return empty result
        return [];
      }
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

  // Get a single call by ID
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

  // Update a call
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

    let assignee_id = undefined;
    
    // If assignee_name is provided, find the user and get their ID
    if (updateCallDto.assignee_name !== undefined) {
      if (updateCallDto.assignee_name === '') {
        // Empty string means remove the assignee
        assignee_id = null;
      } else {
        const assignee = await this.prisma.user.findFirst({
          where: {
            name: updateCallDto.assignee_name,
            workspace_id: workspaceId,
          },
        });

        if (!assignee) {
          throw new BadRequestException(`Assignee with name '${updateCallDto.assignee_name}' not found`);
        }
        
        assignee_id = assignee.id;
      }
    }

    // Validate duration format if provided
    if (updateCallDto.duration && !this.isValidDuration(updateCallDto.duration)) {
      throw new BadRequestException('Duration must be in h:m:s format (e.g., 00:35:20)');
    }

    // Prepare update data
    const updateData: any = { ...updateCallDto };
    
    // Remove assignee_name from update data as it's not a database field
    delete updateData.assignee_name;
    
    // Add assignee_id if it was resolved
    if (assignee_id !== undefined) {
      updateData.assignee_id = assignee_id;
    }

    const updatedCall = await this.prisma.call.update({
      where: { id },
      data: updateData,
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

  // Delete a call
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