

// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateSourceDto } from './dto/create-source.dto';
// import { UpdateSourceDto } from './dto/update-source.dto';

// @Injectable()
// export class SourceService {
//   constructor(private readonly prisma: PrismaService) { }

//   // CREATE: body theke workspace_id, owner_id
//   async create(dto: CreateSourceDto, ownerId: string, workspaceId: string) {
//     // Check if source already exists within the workspace
//     const dup = await this.prisma.source.findFirst({
//       where: { workspace_id: workspaceId, name: dto.name },
//       select: { id: true },
//     });
//     if (dup) throw new BadRequestException('Source already exists in this workspace');

//     // Create source
//     const source = await this.prisma.source.create({
//       data: {
//         name: dto.name,
//         owner_id: ownerId,       // owner_id passed from JWT token
//         workspace_id: workspaceId, // workspace_id passed from JWT token
//       },
//     });

//     return { message: 'Source created successfully', source };
//   }

//   // LIST: fetch sources for the workspace/owner
//   async findAll(ownerId: string, workspaceId: string) {
//     const sources = await this.prisma.source.findMany({
//       where: { owner_id: ownerId, workspace_id: workspaceId },
//       orderBy: { created_at: 'asc' },
//     });

//     return { message: 'Sources retrieved successfully', sources };
//   }

//   // UPDATE: update source name, ensure uniqueness
//   async update(id: string, dto: UpdateSourceDto, ownerId: string, workspaceId: string) {
//     const existing = await this.prisma.source.findUnique({ where: { id } });
//     if (!existing) throw new NotFoundException('Source not found');

//     // Ensure no duplicates with the same name in the workspace
//     if (dto.name && dto.name !== existing.name) {
//       const dup = await this.prisma.source.findFirst({
//         where: { workspace_id: workspaceId, name: dto.name },
//       });
//       if (dup) throw new BadRequestException('Another source with this name already exists in this workspace');
//     }

//     const updatedSource = await this.prisma.source.update({
//       where: {
//         id,
//         workspace_id: workspaceId,
//         owner_id: ownerId,
//       },
//       data: { name: dto.name ?? existing.name },
//     });

//     return { message: 'Source updated successfully', updatedSource };
//   }

//   // DELETE: delete source by ID
//   async remove(id: string, ownerId: string, workspaceId: string) {
//     try {
//       const source = await this.prisma.source.findFirst({
//         where: { id, owner_id: ownerId, workspace_id: workspaceId },
//       });
//       if (!source) throw new NotFoundException('Source not found in this workspace/owner');

//       await this.prisma.source.delete({ where: { id } });
//       return { message: 'Source deleted successfully' };
//     } catch (e: any) {
//       if (e.code === 'P2025') throw new NotFoundException('Source not found');
//       throw e;
//     }
//   }
// }


import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

@Injectable()
export class SourceService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
  async create(dto: CreateSourceDto, ownerId: string, workspaceId: string) {
    const dup = await this.prisma.source.findFirst({
      where: { workspace_id: workspaceId, name: dto.name },
      select: { id: true },
    });
    if (dup) throw new BadRequestException('Source already exists in this workspace');

    const source = await this.prisma.source.create({
      data: {
        name: dto.name,
        owner_id: ownerId,
        workspace_id: workspaceId,
        
      },
    });

    return { message: 'Source created successfully', source };
  }

  // LIST
  async findAll(ownerId: string, workspaceId: string) {
    const sources = await this.prisma.source.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
      orderBy: { created_at: 'asc' },
    });

    return { message: 'Sources retrieved successfully', sources };
  }

  // UPDATE
  async update(id: string, dto: UpdateSourceDto, ownerId: string, workspaceId: string) {
    const existing = await this.prisma.source.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Source not found');

    if (dto.name && dto.name !== existing.name) {
      const dup = await this.prisma.source.findFirst({
        where: { workspace_id: workspaceId, name: dto.name },
      });
      if (dup) throw new BadRequestException('Another source with this name already exists in this workspace');
    }

    const updatedSource = await this.prisma.source.update({
      where: {
        id,
        workspace_id: workspaceId,
        owner_id: ownerId,
      },
      data: { name: dto.name ?? existing.name },
    });

    return { message: 'Source updated successfully', updatedSource };
  }

  // DELETE
  async remove(id: string, ownerId: string, workspaceId: string) {
    try {
      const source = await this.prisma.source.findFirst({
        where: { id, owner_id: ownerId, workspace_id: workspaceId },
      });
      if (!source) throw new NotFoundException('Source not found in this workspace/owner');
      
      await this.prisma.source.delete({ where: { id } });
      return { message: 'Source deleted successfully' };
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Source not found');
      throw e;
    }
  }
}