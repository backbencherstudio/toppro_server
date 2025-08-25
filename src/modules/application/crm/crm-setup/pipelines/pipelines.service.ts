import { Injectable } from '@nestjs/common';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Pipeline
  async create(createPipelineDto: CreatePipelineDto) {
    const pipeline = await this.prisma.pipeline.create({
      data: {
        name: createPipelineDto.name,
      },
    });
    return { message: 'Pipeline created successfully', pipeline };
  }

  // Get all Pipelines
  async findAll() {
    const pipelines = await this.prisma.pipeline.findMany();
    return { message: 'Pipelines retrieved successfully', pipelines };
  }

  // Update Pipeline
  async update(id: string, createPipelineDto: CreatePipelineDto) {
    const updatedPipeline = await this.prisma.pipeline.update({
      where: { id },
      data: {
        name: createPipelineDto.name,
      },
    });
    return { message: 'Pipeline updated successfully', updatedPipeline };
  }

  // Delete Pipeline
  async remove(id: string) {
    await this.prisma.pipeline.delete({
      where: { id },
    });
    return { message: 'Pipeline deleted successfully' };
  }
}
