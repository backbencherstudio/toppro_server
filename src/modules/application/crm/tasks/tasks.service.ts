import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private activityService: ActivityService) { }

  async createTask(dto: CreateTaskDto, ownerId: string, workspaceId: string) {
    // ✅ Verify lead belongs to same owner & workspace
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: dto.lead_id,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${dto.lead_id} not found for this workspace/owner`,
      );
    }

    // ✅ Create Task under the lead
    const task = await this.prisma.task.create({
      data: {
        lead_id: dto.lead_id,
        name: dto.name,
        date: dto.date ? new Date(dto.date) : null,
        time: dto.time,
        priority: dto.priority ?? 'LOW',
        status: dto.status ?? 'ONGOING',
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
      'task',
      `${owner?.name || 'Someone'} created a new Lead Task: ${dto.name}`,
    );
    return task;
  }

  async getTasksByLead(leadId: string, ownerId: string, workspaceId: string) {
    // ✅ Verify lead belongs to this owner & workspace
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

    // ✅ Fetch tasks for this lead
    return this.prisma.task.findMany({
      where: { lead_id: leadId },
      orderBy: { created_at: 'asc' },
      select: {
        id: true,
        name: true,
        date: true,
        time: true,
        priority: true,
        status: true,
      },
    });
  }

  async updateTask(
    id: string,
    dto: UpdateTaskDto,
    ownerId: string,
    workspaceId: string,
  ) {
    // ✅ Check if task exists and belongs to this owner/workspace via lead
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        lead: {
          owner_id: ownerId,
          workspace_id: workspaceId,
          deleted_at: null,
        },
      },
    });

    if (!task) {
      throw new NotFoundException(
        `Task with id ${id} not found for this owner/workspace`,
      );
    }

    // ✅ Update allowed fields
    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.time && { time: dto.time }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.status && { status: dto.status }),
      },
      select: {
        id: true,
        name: true,
        date: true,
        time: true,
        priority: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async toggleTaskStatus(id: string, ownerId: string, workspaceId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        lead: {
          owner_id: ownerId,
          workspace_id: workspaceId,
          deleted_at: null,
        },
      },
      select: { id: true, status: true },
    });

    if (!task) {
      throw new NotFoundException(
        `Task with id ${id} not found for this owner/workspace`,
      );
    }

    // ✅ Toggle status
    const newStatus = task.status === 'ONGOING' ? 'COMPLETED' : 'ONGOING';

    return this.prisma.task.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });
  }


  // ✅ Delete a Task (soft delete not needed → hard delete is fine)
  async deleteTask(id: string, ownerId: string, workspaceId: string) {
    // validate task belongs to owner & workspace via lead
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        lead: {
          owner_id: ownerId,
          workspace_id: workspaceId,
          deleted_at: null,
        },
      },
    });

    if (!task) {
      throw new NotFoundException(
        `Task with id ${id} not found for this owner/workspace`,
      );
    }

    await this.prisma.task.delete({ where: { id: task.id } });

    return {
      success: true,
      message: 'Task deleted successfully',
      taskId: id,
    };
  }

}
