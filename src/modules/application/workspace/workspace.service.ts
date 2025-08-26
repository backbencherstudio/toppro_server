import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorkspaceDto) {
    const workspace = await this.prisma.workspace.create({
      data,
    });
    return {
      success: true,
      message: 'Workspace created successfully',
      workspace,
    };
  }

  async findAll() {
    const workspaces = await this.prisma.workspace.findMany();
    return { success: true, workspaces };
  }

  async findOne(id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });
    return { success: true, workspace };
  }

  async update(id: string, data: UpdateWorkspaceDto) {
    const workspace = await this.prisma.workspace.update({
      where: { id },
      data,
    });
    return { success: true, message: 'Workspace updated', workspace };
  }

  async remove(id: string) {
    await this.prisma.workspace.delete({
      where: { id },
    });
    return { success: true, message: 'Workspace deleted' };
  }
}
