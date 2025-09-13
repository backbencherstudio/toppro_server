import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private  jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateWorkspaceDto, userId: string, ownerId: string) {
    console.log('WorkspaceService', userId, ownerId);
    const workspace = await this.prisma.workspace.create({
      data: {
        ...data,
        owner_id: userId || ownerId,
      },
    });
    return {
      success: true,
      message: 'Workspace created successfully',
      workspace,
    };
  }

  async findAll(userId: string, ownerId: string) {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        owner_id: ownerId || userId,
      },
    });
    return { success: true, workspaces };
  }

  async findOne(id: string, ownerId: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id, owner_id: ownerId || userId },
    });
    return { success: true, workspace };
  }

  async update(
    id: string,
    data: UpdateWorkspaceDto,
    ownerId: string,
    userId: string,
  ) {
    const workspace = await this.prisma.workspace.update({
      where: { id, owner_id: ownerId || userId },
      data,
    });
    return { success: true, message: 'Workspace updated', workspace };
  }

  async remove(id: string, ownerId: string, userId: string) {
    await this.prisma.workspace.delete({
      where: { id, owner_id: ownerId || userId },
    });
    return { success: true, message: 'Workspace deleted' };
  }

  // workspace.service.ts
  async countWorkspaces(userId: string, ownerId: string) {
    const count = await this.prisma.workspace.count({
      where: {
        owner_id: ownerId || userId,
      },
    });

    return {
      success: true,
      message: `Total workspaces for owner ${ownerId || userId}: ${count}`,
      count,
    };
  }

  // workspace switch
  async switchWorkspace(userId: string, workspaceId: string) {
    // 1. Check workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId, owner_id: userId },
    });
    if (!workspace) {
      throw new BadRequestException('Workspace not found');
    }

    // 2. Update user's workspace_id
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { workspace_id: workspaceId },
    });

    // 3. JWT payload (same style as your login)
    const payload = {
      email: user.email,
      id: user.id,
      owner_id: user.owner_id,
      workspace_id: user.workspace_id,
      type: user.type,
    };

    // 4. Create token
    const accessToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_SECRET + '-' + workspaceId,
    expiresIn: '7d',
  });

    return {
      success: true,
      message: 'Workspace switched successfully',
      authorization: {
        type: 'bearer',
        access_token: accessToken,
      },
      type: user.type,
      user:{
        id: user.id,
        owner_id: user.owner_id == null ? user.id :user.owner_id,
        workspace_id: user.workspace_id,
        email: user.email,
        name: user.name
      },
    };
  }
}
