import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeadStageDto } from './dto/create-lead_stage.dto';
import { UpdateLeadStageDto } from './dto/update-lead_stage.dto';

@Injectable()
export class LeadStageService {
  constructor(private readonly prisma: PrismaService) { }

  // CREATE: body contains { name, pipelineName, workspace_id, owner_id }
  // async create(dto: CreateLeadStageDto) {
  //   // find pipeline in this tenant
  //   const pipeline = await this.prisma.pipeline.findFirst({
  //     where: {
  //       name: dto.pipelineName,
  //       workspace_id: dto.workspace_id,
  //       owner_id: dto.owner_id,
  //     },
  //     select: { id: true },
  //   });
  //   if (!pipeline) throw new NotFoundException('Pipeline not found in this workspace');

  //   // unique per pipeline
  //   const dup = await this.prisma.leadStage.findFirst({
  //     where: { pipelineId: pipeline.id, name: dto.name },
  //     select: { id: true },
  //   });
  //   if (dup) throw new BadRequestException('Lead stage already exists in this pipeline');

  //   const leadStage = await this.prisma.leadStage.create({
  //     data: {
  //       name: dto.name,
  //       pipelineId: pipeline.id,
  //       workspace_id: dto.workspace_id,
  //       owner_id: dto.owner_id,
  //     },
  //   });

  //   return { message: 'Lead stage created successfully', leadStage };
  // }

  async create(dto: CreateLeadStageDto) {
    // check if the given pipeline exists in this workspace and owner context
    const pipeline = await this.prisma.pipeline.findFirst({
      where: {
        id: dto.pipelineId,
        workspace_id: dto.workspace_id,
        owner_id: dto.owner_id,
      },
      select: { id: true },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found in this workspace');
    }

    // check for duplicate stage name within this pipeline
    const dup = await this.prisma.leadStage.findFirst({
      where: {
        pipelineId: dto.pipelineId,
        name: dto.name,
      },
      select: { id: true },
    });

    if (dup) {
      throw new BadRequestException('Lead stage already exists in this pipeline');
    }

    // create the new lead stage
    const leadStage = await this.prisma.leadStage.create({
      data: {
        name: dto.name,
        pipelineId: dto.pipelineId,
        workspace_id: dto.workspace_id,
        owner_id: dto.owner_id,
      },
    });

    return {
      message: 'Lead stage created successfully',
      leadStage,
    };
  }



  // LIST: GET by pipelineId (scoped by workspace & owner), include flat pipeline name
  async findAll(workspace_id: string, owner_id: string, pipelineId: string) {
    const pipe = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, workspace_id, owner_id },
      select: { id: true, name: true },
    });
    if (!pipe) throw new NotFoundException('Pipeline not found for this scope');

    const leadStages = await this.prisma.leadStage.findMany({
      where: { workspace_id, owner_id, pipelineId: pipe.id },
      include: { pipeline: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });

    const transformed = leadStages.map(stage => ({
      id: stage.id,
      created_at: stage.created_at,
      updated_at: stage.updated_at,
      name: stage.name,
      pipeline: stage.pipeline.name, // flat pipeline name
      pipelineId: stage.pipelineId,
      workspace_id: stage.workspace_id,
      owner_id: stage.owner_id,
    }));

    return {
      message: 'Lead stages retrieved successfully',
      leadStages: transformed,
    };
  }

  // UPDATE: by id only (still tenant-safe)
  async updateById(id: string, dto: UpdateLeadStageDto) {
    const existing = await this.prisma.leadStage.findUnique({
      where: { id },
      select: { id: true, name: true, pipelineId: true, workspace_id: true, owner_id: true },
    });
    if (!existing) throw new NotFoundException('Lead stage not found');

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
      const dup = await this.prisma.leadStage.findFirst({
        where: { pipelineId: targetPipelineId, name: nextName, NOT: { id } },
        select: { id: true },
      });
      if (dup) throw new BadRequestException('Another stage with this name already exists in the target pipeline');
    }

    const updatedLeadStage = await this.prisma.leadStage.update({
      where: { id },
      data: {
        name: nextName,
        pipelineId: targetPipelineId,
      },
    });

    return { message: 'Lead stage updated successfully', updatedLeadStage };
  }

  // DELETE: by id only (still tenant-safe)
  async removeById(id: string) {
    try {
      await this.prisma.leadStage.delete({ where: { id } });
      return { message: 'Lead stage deleted successfully' };
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Lead stage not found');
      throw e;
    }
  }
}
