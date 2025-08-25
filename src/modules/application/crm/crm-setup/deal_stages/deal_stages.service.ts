// deal-stage.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDealStageDto } from './dto/create-deal_stage.dto';


@Injectable()
export class DealStageService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Deal Stage (lookup pipelineId by name)
  async create(createDealStageDto: CreateDealStageDto) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: {
        name: createDealStageDto.pipelineName,  // Find pipeline by name
      },
    });

    if (!pipeline) {
      throw new Error('Pipeline not found');  // Handle error if pipeline not found
    }

    const dealStage = await this.prisma.dealStage.create({
      data: {
        name: createDealStageDto.name,
        pipelineId: pipeline.id,  // Use the found pipelineId
      },
    });
    
    return { message: 'Deal stage created successfully', dealStage };
  }

  // Get all Deal Stages for a Pipeline
  async findAll(pipelineId: string) {
    const dealStages = await this.prisma.dealStage.findMany({
      where: { pipelineId },
    });
    return { message: 'Deal stages retrieved successfully', dealStages };
  }

  // Update Deal Stage
  async update(id: string, createDealStageDto: CreateDealStageDto) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: {
        name: createDealStageDto.pipelineName,  // Find pipeline by name for update
      },
    });

    if (!pipeline) {
      throw new Error('Pipeline not found');  // Handle error if pipeline not found
    }

    const updatedDealStage = await this.prisma.dealStage.update({
      where: { id },
      data: {
        name: createDealStageDto.name,
        pipelineId: pipeline.id,  // Update with the pipelineId
      },
    });
    return { message: 'Deal stage updated successfully', updatedDealStage };
  }

  // Delete Deal Stage
  async remove(id: string) {
    await this.prisma.dealStage.delete({
      where: { id },
    });
    return { message: 'Deal stage deleted successfully' };
  }
}
