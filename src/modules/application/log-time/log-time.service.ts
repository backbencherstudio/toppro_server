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
    return await this.prisma.logTime.create({
      data: {
        description: createLogTimeDto.description,
        date: createLogTimeDto.date,
        user_id: userId,
        owner_id: ownerId,
        workspace_id: workspaceId,
        item_id: itemId,
      },
    });
  }

  // GET all logTime entries
  async findAll(
    userId: string,
    ownerId: string,
    workspaceId: string,
    itemId: string,
  ) {
    return this.prisma.logTime.findMany({
      where: {
        deleted_at: null,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
        item_id: itemId,
      },
      select:{
        id: true,
        description: true,
        date: true
      }
    });
  }


  // DELETE a logTime entry
  async delete(id: string, userId: string, ownerId: string, workspaceId: string) {
    const logTime = await this.prisma.logTime.findUnique({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId },
    });

    if (!logTime) {
      throw new NotFoundException(`LogTime with id ${id} not found`);
    }

    return this.prisma.logTime.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
