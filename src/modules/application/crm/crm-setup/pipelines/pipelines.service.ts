// import { Injectable } from '@nestjs/common';
// import { CreatePipelineDto } from './dto/create-pipeline.dto';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class PipelineService {
//   constructor(private readonly prisma: PrismaService) {}

//   // Create Pipeline
//   async create(createPipelineDto: CreatePipelineDto) {
//     const pipeline = await this.prisma.pipeline.create({
//       data: {
//         name: createPipelineDto.name,
//       },
//     });
//     return { message: 'Pipeline created successfully', pipeline };
//   }

//   // Get all Pipelines
//   async findAll() {
//     const pipelines = await this.prisma.pipeline.findMany();
//     return { message: 'Pipelines retrieved successfully', pipelines };
//   }

//   // Update Pipeline
//   async update(id: string, createPipelineDto: CreatePipelineDto) {
//     const updatedPipeline = await this.prisma.pipeline.update({
//       where: { id },
//       data: {
//         name: createPipelineDto.name,
//       },
//     });
//     return { message: 'Pipeline updated successfully', updatedPipeline };
//   }

//   // Delete Pipeline
//   async remove(id: string) {
//     await this.prisma.pipeline.delete({
//       where: { id },
//     });
//     return { message: 'Pipeline deleted successfully' };
//   }
// }


// pipeline.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE (body theke workspaceId, ownerId)
  async create(dto: CreatePipelineDto) {
    // same name already exists in this workspace?
    const dup = await this.prisma.pipeline.findFirst({
      where: { workspace_id: dto.workspace_id, name: dto.name },
      select: { id: true },
    });
    if (dup) {
      throw new BadRequestException('Pipeline name already exists in this workspace');
    }

    const pipeline = await this.prisma.pipeline.create({
      data: {
        name: dto.name,
        workspace_id: dto.workspace_id,
        owner_id: dto.owner_id,
      },
    });

    return { message: 'Pipeline created successfully', pipeline };
  }

  // FIND ALL (params theke workspaceId, ownerId)
  async findAll(workspace_id: string, owner_id: string) {
    const pipelines = await this.prisma.pipeline.findMany({
      where: { workspace_id, owner_id },
    });
    return { message: 'Pipelines retrieved successfully', pipelines };
  }

  // UPDATE (params: id, workspaceId, ownerId) + body: { name }
  async update(id: string, workspaceId: string, ownerId: string, dto: Pick<CreatePipelineDto, 'name'>) {
    // scope check
    const existing = await this.prisma.pipeline.findFirst({
      where: { id, workspace_id: workspaceId, owner_id: ownerId },
      select: { id: true, name: true, workspace_id: true },
    });
    if (!existing) throw new NotFoundException('Pipeline not found for this scope');

    // uniqueness (same workspace)
    if (dto.name && dto.name !== existing.name) {
      const dup = await this.prisma.pipeline.findFirst({
        where: { workspace_id: workspaceId, name: dto.name },
        select: { id: true },
      });
      if (dup) {
        throw new BadRequestException('Another pipeline with this name already exists in this workspace');
      }
    }

    const updatedPipeline = await this.prisma.pipeline.update({
      where: { id }, // safe now because scope verified
      data: { name: dto.name },
    });

    return { message: 'Pipeline updated successfully', updatedPipeline };
  }

  // DELETE (params: id, workspaceId, ownerId)
  async remove(id: string, workspaceId: string, ownerId: string) {
    // deleteMany to enforce scope at DB level
    const res = await this.prisma.pipeline.deleteMany({
      where: { id, workspace_id: workspaceId, owner_id: ownerId },
    });
    if (res.count === 0) throw new NotFoundException('Pipeline not found for this scope');

    return { message: 'Pipeline deleted successfully' };
  }
}
