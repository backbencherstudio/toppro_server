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

    return{
      success: true,
      message: 'LogTime created successfully',
      // data: logTime
    }
  }

  // GET all logTime entries
async findAll(
  userId: string,
  ownerId: string,
  workspaceId: string,
  itemId: string,
) {
  const logTime = await this.prisma.logTime.findMany({
    where: {
      deleted_at: null,
      owner_id: ownerId || userId,
      workspace_id: workspaceId,
      item_id: itemId,
    }
  });

  // If no logTimes are found, return a 'not found' error
  if (logTime.length === 0) {
    throw new NotFoundException('LogTime not found');
  }

  // Returning the results
  return {
    success: true,
    message: 'LogTime found successfully',
    data: logTime.map((log) => ({
      id: log.id || null,
      description: log.description || null,
      date: log.date || null,
    })),
  };
}


  // DELETE a logTime entry
  async delete(id: string, userId: string, ownerId: string, workspaceId: string) {
    const logTime = await this.prisma.logTime.findUnique({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId },
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
