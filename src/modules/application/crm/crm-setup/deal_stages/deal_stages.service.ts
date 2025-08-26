// // deal-stage.service.ts
// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateDealStageDto } from './dto/create-deal_stage.dto';


// @Injectable()
// export class DealStageService {
//   constructor(private readonly prisma: PrismaService) {}

//   // Create Deal Stage (lookup pipelineId by name)
//   async create(createDealStageDto: CreateDealStageDto) {
//     const pipeline = await this.prisma.pipeline.findUnique({
//       where: {
//         name: createDealStageDto.pipelineName,  // Find pipeline by name
//       },
//     });

//     if (!pipeline) {
//       throw new Error('Pipeline not found');  // Handle error if pipeline not found
//     }

//     const dealStage = await this.prisma.dealStage.create({
//       data: {
//         name: createDealStageDto.name,
//         pipelineId: pipeline.id,  // Use the found pipelineId
//       },
//     });
    
//     return { message: 'Deal stage created successfully', dealStage };
//   }

//   // Get all Deal Stages for a Pipeline
//   async findAll(pipelineId: string) {
//     const dealStages = await this.prisma.dealStage.findMany({
//       where: { pipelineId },
//     });
//     return { message: 'Deal stages retrieved successfully', dealStages };
//   }

//   // Update Deal Stage
//   async update(id: string, createDealStageDto: CreateDealStageDto) {
//     const pipeline = await this.prisma.pipeline.findUnique({
//       where: {
//         name: createDealStageDto.pipelineName,  // Find pipeline by name for update
//       },
//     });

//     if (!pipeline) {
//       throw new Error('Pipeline not found');  // Handle error if pipeline not found
//     }

//     const updatedDealStage = await this.prisma.dealStage.update({
//       where: { id },
//       data: {
//         name: createDealStageDto.name,
//         pipelineId: pipeline.id,  // Update with the pipelineId
//       },
//     });
//     return { message: 'Deal stage updated successfully', updatedDealStage };
//   }

//   // Delete Deal Stage
//   async remove(id: string) {
//     await this.prisma.dealStage.delete({
//       where: { id },
//     });
//     return { message: 'Deal stage deleted successfully' };
//   }
// }


// deal-stage.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDealStageDto } from './dto/create-deal_stage.dto';
import { UpdateDealStageDto } from './dto/update-deal_stage.dto';

@Injectable()
export class DealStageService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE: body contains { name, pipelineName, workspace_id, owner_id }
  async create(dto: CreateDealStageDto) {
    // Resolve pipeline within the same workspace & owner
    const pipeline = await this.prisma.pipeline.findFirst({
      where: {
        name: dto.pipelineName,
        workspace_id: dto.workspace_id,
        owner_id: dto.owner_id,
      },
      select: { id: true },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found in this workspace');

    // Enforce unique stage name per pipeline
    const dup = await this.prisma.dealStage.findFirst({
      where: { pipelineId: pipeline.id, name: dto.name },
      select: { id: true },
    });
    if (dup) throw new BadRequestException('Deal stage already exists in this pipeline');

    const dealStage = await this.prisma.dealStage.create({
      data: {
        name: dto.name,
        pipelineId: pipeline.id,
        workspace_id: dto.workspace_id,
        owner_id: dto.owner_id,
      },
    });

    return { message: 'Deal stage created successfully', dealStage };
  }

  // LIST: params => workspace_id, owner_id, pipelineId
  async findAll(workspace_id: string, owner_id: string, pipelineId: string) {
    // Optional: verify the pipeline belongs to this scope
    const pipe = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, workspace_id, owner_id },
      select: { id: true },
    });
    if (!pipe) throw new NotFoundException('Pipeline not found for this scope');

    const dealStages = await this.prisma.dealStage.findMany({
      where: { workspace_id, owner_id, pipelineId },
      orderBy: { name: 'asc' },
    });
    return { message: 'Deal stages retrieved successfully', dealStages };
  }

  // UPDATE: params => id, workspace_id, owner_id | body => { name?, pipelineName? }
  async update(id: string, workspace_id: string, owner_id: string, dto: UpdateDealStageDto) {
    // Ensure the stage exists in this scope
    const existing = await this.prisma.dealStage.findFirst({
      where: { id, workspace_id, owner_id },
      select: { id: true, name: true, pipelineId: true },
    });
    if (!existing) throw new NotFoundException('Deal stage not found for this scope');

    // Resolve target pipeline (if pipelineName provided), else keep current
    let targetPipelineId = existing.pipelineId;
    if (dto.pipelineName) {
      const target = await this.prisma.pipeline.findFirst({
        where: { name: dto.pipelineName, workspace_id, owner_id },
        select: { id: true },
      });
      if (!target) throw new NotFoundException('Target pipeline not found in this workspace');
      targetPipelineId = target.id;
    }

    // Uniqueness check if name or pipeline changes
    const nextName = dto.name ?? existing.name;
    if (nextName !== existing.name || targetPipelineId !== existing.pipelineId) {
      const dup = await this.prisma.dealStage.findFirst({
        where: { pipelineId: targetPipelineId, name: nextName },
        select: { id: true },
      });
      if (dup && dup.id !== id) {
        throw new BadRequestException('Another stage with this name already exists in the target pipeline');
      }
    }

    const updatedDealStage = await this.prisma.dealStage.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        pipelineId: targetPipelineId,
      },
    });

    return { message: 'Deal stage updated successfully', updatedDealStage };
  }

  // DELETE: params => id, workspace_id, owner_id
  async remove(id: string, workspace_id: string, owner_id: string) {
    const res = await this.prisma.dealStage.deleteMany({
      where: { id, workspace_id, owner_id },
    });
    if (res.count === 0) throw new NotFoundException('Deal stage not found for this scope');

    return { message: 'Deal stage deleted successfully' };
  }
}
