import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogTimeDto } from 'src/modules/application/log-time/dto/create-log-time.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LogTimeService {
  constructor(private readonly prisma: PrismaService) {}

  // POST: Create a new logTime entry
  async create(
    createLogTimeDto: CreateLogTimeDto,
    userId: string,
    ownerId: string,
    workspaceId: string,
    itemId: string,
  ) {
    const logTime = await this.prisma.logTime.create({
      data: {
        description: createLogTimeDto.description,
        date: createLogTimeDto.date,
        user_id: userId,
        owner_id: ownerId,
        workspace_id: workspaceId,
        item_id: itemId,
      },
    });

    return {
      success: true,
      message: 'LogTime created successfully',
      // data: logTime
    };
  }

  // GET all logTime entries
  async findAll(
    userId: string,
    ownerId: string,
    workspaceId: string,
    itemId: string,
  ) {
    const logTimes = await this.prisma.logTime.findMany({
      where: {
        // If either owner_id or user_id can own the log, use an OR condition
        OR: [{ owner_id: ownerId }, { user_id: userId }],
        workspace_id: workspaceId,
        item_id: itemId,
        deleted_at: null,
      },
    });

    return {
      success: true,
      message: logTimes.length
        ? 'LogTime found successfully'
        : 'No logTime entries found',
      data: logTimes.map((log) => ({
        id: log.id || null,
        description: log.description || null,
        date: log.date || null,
      })),
    };
  }

  // DELETE a logTime entry
  async delete(
    id: string,
    userId: string,
    ownerId: string,
    workspaceId: string,
  ) {
    const logTime = await this.prisma.logTime.findUnique({
      where: {
        id,
        OR: [{ owner_id: ownerId }, { user_id: userId }],
        workspace_id: workspaceId,
      },
    });

    if (!logTime) {
      throw new NotFoundException(`LogTime with id ${id} not found`);
    }

    const deletedLogTime = await this.prisma.logTime.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return {
      success: true,
      message: 'LogTime deleted successfully',
      data: deletedLogTime,
    };
  }
}
