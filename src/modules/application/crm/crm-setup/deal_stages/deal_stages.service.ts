import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDealStageDto } from './dto/create-deal_stage.dto';
import { UpdateDealStageDto } from './dto/update-deal_stage.dto';

@Injectable()
export class DealStageService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE: body contains { name, pipelineName, workspace_id, owner_id }
  async create(dto: CreateDealStageDto) {
    // find pipeline in this tenant
    const pipeline = await this.prisma.pipeline.findFirst({
      where: {
        name: dto.pipelineName,
        workspace_id: dto.workspace_id,
        owner_id: dto.owner_id,
      },
      select: { id: true },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found in this workspace');

    // unique per pipeline
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
  // async findAll(workspace_id: string, owner_id: string, pipelineName: string) {
  //   // verify pipeline belongs to tenant
  //   const pipe = await this.prisma.pipeline.findFirst({
  //     where: { name: pipelineName, workspace_id, owner_id },
  //     select: { id: true },
  //   });
  //   if (!pipe) throw new NotFoundException('Pipeline not found for this scope');

  //   const dealStages = await this.prisma.dealStage.findMany({
  //     where: { workspace_id, owner_id, pipelineId: pipe.id },
  //     orderBy: { name: 'asc' },
  //   });
  //   return { message: 'Deal stages retrieved successfully', dealStages };
  // }

  async findAll(workspace_id: string, owner_id: string, pipelineName: string) {
  // verify pipeline belongs to tenant
  const pipe = await this.prisma.pipeline.findFirst({
    where: { name: pipelineName, workspace_id, owner_id },
    select: { id: true, name: true },
  });
  if (!pipe) throw new NotFoundException('Pipeline not found for this scope');

  // fetch deal stages and join pipeline name
  const dealStages = await this.prisma.dealStage.findMany({
    where: { workspace_id, owner_id, pipelineId: pipe.id },
    include: { pipeline: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });

  // map pipeline.name to flat "pipeline"
  const transformed = dealStages.map(stage => ({
    id: stage.id,
    created_at: stage.created_at,
    updated_at: stage.updated_at,
    name: stage.name,
    pipeline: stage.pipeline.name, // flat string field
    pipelineId: stage.pipelineId,
    workspace_id: stage.workspace_id,
    owner_id: stage.owner_id,
  }));

  return {
    message: 'Deal stages retrieved successfully',
    dealStages: transformed,
  };
}


  // UPDATE: by id only (still tenant-safe)
  async updateById(id: string, dto: UpdateDealStageDto) {
    // load existing to get tenant + pipeline for checks
    const existing = await this.prisma.dealStage.findUnique({
      where: { id },
      select: { id: true, name: true, pipelineId: true, workspace_id: true, owner_id: true },
    });
    if (!existing) throw new NotFoundException('Deal stage not found');

    // resolve target pipeline if changing
    let targetPipelineId = existing.pipelineId;
    if (dto.pipelineName) {
      const target = await this.prisma.pipeline.findFirst({
        where: {
          name: dto.pipelineName,
          workspace_id: existing.workspace_id,
          owner_id: existing.owner_id,
        },
        select: { id: true },
      });
      if (!target) throw new NotFoundException('Target pipeline not found in this workspace');
      targetPipelineId = target.id;
    }

    // uniqueness inside target pipeline
    const nextName = dto.name ?? existing.name;
    if (nextName !== existing.name || targetPipelineId !== existing.pipelineId) {
      const dup = await this.prisma.dealStage.findFirst({
        where: { pipelineId: targetPipelineId, name: nextName, NOT: { id } },
        select: { id: true },
      });
      if (dup) throw new BadRequestException('Another stage with this name already exists in the target pipeline');
    }

    const updatedDealStage = await this.prisma.dealStage.update({
      where: { id },
      data: {
        name: nextName,
        pipelineId: targetPipelineId,
      },
    });

    return { message: 'Deal stage updated successfully', updatedDealStage };
  }

  // DELETE: by id only (still tenant-safe)
  async removeById(id: string) {
    try {
      await this.prisma.dealStage.delete({ where: { id } });
      return { message: 'Deal stage deleted successfully' };
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Deal stage not found');
      throw e;
    }
  }
}
