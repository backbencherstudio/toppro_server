import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

@Injectable()
export class SourceService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
  async create(dto: CreateSourceDto) {
    // unique per workspace
    const dup = await this.prisma.source.findFirst({
      where: { workspace_id: dto.workspace_id, name: dto.name },
      select: { id: true },
    });
    if (dup) throw new BadRequestException('Source already exists in this workspace');

    const source = await this.prisma.source.create({
      data: {
        name: dto.name,
        workspace_id: dto.workspace_id,
        owner_id: dto.owner_id,
      },
    });

    return { message: 'Source created successfully', source };
  }

  // LIST
  async findAll(workspace_id: string, owner_id: string) {
    const sources = await this.prisma.source.findMany({
      where: { workspace_id, owner_id },
      orderBy: { created_at: 'asc' },
    });

    return { message: 'Sources retrieved successfully', sources };
  }

  // UPDATE by id
  async update(id: string, dto: UpdateSourceDto) {
    const existing = await this.prisma.source.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Source not found');

    if (dto.name && dto.name !== existing.name) {
      const dup = await this.prisma.source.findFirst({
        where: { workspace_id: existing.workspace_id, name: dto.name },
      });
      if (dup) throw new BadRequestException('Another source with this name already exists in this workspace');
    }

    const updatedSource = await this.prisma.source.update({
      where: { id },
      data: { name: dto.name ?? existing.name },
    });

    return { message: 'Source updated successfully', updatedSource };
  }

  // DELETE by id
  async remove(id: string) {
    try {
      await this.prisma.source.delete({ where: { id } });
      return { message: 'Source deleted successfully' };
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Source not found');
      throw e;
    }
  }
}
