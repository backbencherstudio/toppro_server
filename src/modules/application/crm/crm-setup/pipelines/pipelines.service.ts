import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) { }

  // CREATE: body theke workspace_id, owner_id
  async create(dto: CreatePipelineDto, ownerId: string, workspaceId: string) {
    // unique name per workspace
    const dup = await this.prisma.pipeline.findFirst({
      where: { owner_id: ownerId, workspace_id: workspaceId, name: dto.name },
      select: { id: true },
    });
    if (dup) throw new BadRequestException('Pipeline name already exists in this workspace');

    const pipeline = await this.prisma.pipeline.create({
      data: {
        name: dto.name,
        owner_id: ownerId,
        workspace_id: workspaceId,
      },
    });

    return { message: 'Pipeline created successfully', pipeline };
  }

  async findAll(ownerId: string, workspaceId: string) {
    const pipelines = await this.prisma.pipeline.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
    return { message: 'Pipelines retrieved successfully', pipelines };
  }

  async updateById(id: string, dto: { name: string }, ownerId: string, workspaceId: string) {
    // Load existing to get workspace_id for uniqueness check
    const existing = await this.prisma.pipeline.findUnique({
      where: { id },
      select: { id: true, name: true, workspace_id: true },
    });
    if (!existing) {
      throw new NotFoundException('Pipeline not found');
    }

    // If name changes, ensure unique within the same workspace
    if (dto.name && dto.name !== existing.name) {
      const dup = await this.prisma.pipeline.findFirst({
        where: {
          workspace_id: workspaceId,
          name: dto.name,
          NOT: { id },
        },
        select: { id: true },
      });
      if (dup) {
        throw new BadRequestException('Another pipeline with this name already exists in this workspace');
      }
    }

    const updatedPipeline = await this.prisma.pipeline.update({
      where: { id, workspace_id: workspaceId, owner_id: ownerId },
      data: { name: dto.name },
    });

    return { message: 'Pipeline updated successfully', updatedPipeline };
  }

  // DELETE by pipeline id only
  async removeById(id: string, ownerId: string, workspaceId: string) {
    try {
      await this.prisma.pipeline.delete({ where: { id, owner_id: ownerId, workspace_id: workspaceId } });
      return { message: 'Pipeline deleted successfully' };
    } catch (e: any) {
      // Prisma P2025 -> record not found
      if (e.code === 'P2025') throw new NotFoundException('Pipeline not found');
      throw e;
    }
  }
}
