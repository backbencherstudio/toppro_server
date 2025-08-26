import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE: body theke workspace_id, owner_id
  async create(dto: CreatePipelineDto) {
    // unique name per workspace
    const dup = await this.prisma.pipeline.findFirst({
      where: { workspace_id: dto.workspace_id, name: dto.name },
      select: { id: true },
    });
    if (dup) throw new BadRequestException('Pipeline name already exists in this workspace');

    const pipeline = await this.prisma.pipeline.create({
      data: {
        name: dto.name,
        workspace_id: dto.workspace_id,
        owner_id: dto.owner_id,
      },
    });

    return { message: 'Pipeline created successfully', pipeline };
  }

  async findAll(workspace_id: string, owner_id: string) {
    const pipelines = await this.prisma.pipeline.findMany({
      where: { workspace_id, owner_id },
    });
    return { message: 'Pipelines retrieved successfully', pipelines };
  }

  // // UPDATE: params -> id, workspace_id, owner_id | body -> { name }
  // async update(id: string, workspace_id: string, owner_id: string, dto: { name: string }) {
  //   const existing = await this.prisma.pipeline.findFirst({
  //     where: { id, workspace_id, owner_id },
  //     select: { id: true, name: true },
  //   });
  //   if (!existing) throw new NotFoundException('Pipeline not found for this scope');

  //   if (dto.name && dto.name !== existing.name) {
  //     const dup = await this.prisma.pipeline.findFirst({
  //       where: { workspace_id, name: dto.name },
  //       select: { id: true },
  //     });
  //     if (dup) throw new BadRequestException('Another pipeline with this name already exists in this workspace');
  //   }

  //   const updatedPipeline = await this.prisma.pipeline.update({
  //     where: { id },
  //     data: { name: dto.name },
  //   });

  //   return { message: 'Pipeline updated successfully', updatedPipeline };
  // }

  // // DELETE: params -> id, workspace_id, owner_id
  // async remove(id: string, workspace_id: string, owner_id: string) {
  //   const res = await this.prisma.pipeline.deleteMany({
  //     where: { id, workspace_id, owner_id },
  //   });
  //   if (res.count === 0) throw new NotFoundException('Pipeline not found for this scope');

  //   return { message: 'Pipeline deleted successfully' };
  // }

  async updateById(id: string, dto: { name: string }) {
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
          workspace_id: existing.workspace_id,
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
      where: { id },
      data: { name: dto.name },
    });

    return { message: 'Pipeline updated successfully', updatedPipeline };
  }

  // DELETE by pipeline id only
  async removeById(id: string) {
    try {
      await this.prisma.pipeline.delete({ where: { id } });
      return { message: 'Pipeline deleted successfully' };
    } catch (e: any) {
      // Prisma P2025 -> record not found
      if (e.code === 'P2025') throw new NotFoundException('Pipeline not found');
      throw e;
    }
  }
}
