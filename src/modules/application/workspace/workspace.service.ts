import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import appConfig from 'src/config/app.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateWorkspaceDto, userId: string, ownerId: string) {
    console.log('WorkspaceService', userId, ownerId);
    const ownerForWorkspace = ownerId || userId;

    // Ensure workspace code is unique (schema enforces global uniqueness)
    const exists = await this.prisma.workspace.findUnique({
      where: { code: data.code },
    });
    if (exists) {
      throw new BadRequestException('Workspace code already exists');
    }

    const workspace = await this.prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: {
          ...data,
          owner_id: ownerForWorkspace,
        },
      });

      await tx.companySettings.create({
        data: {
          owner_id: ownerForWorkspace,
          workspace_id: ws.id,
        },
      });

      await tx.currencySettings.create({
        data: {
          owner_id: ownerForWorkspace,
          workspace_id: ws.id,
        },
      });

      return ws;
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

async findAllWorkspaces(ownerId: string, userId: string) {
  try {
    // Fetch workspaces
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        owner_id: ownerId || userId,
      },
    });

    // Check if workspaces exist
    if (!workspaces || workspaces.length === 0) {
      throw new BadRequestException(
        'No workspaces found for the specified owner',
      );
    }

    // Return success response
    return {
      success: true,
      message: 'Workspaces retrieved successfully',
      workspaces,
    };
  } catch (error) {
    // Handle known Prisma errors or other exceptions
    if (error instanceof BadRequestException) {
      throw error; // Re-throw known exceptions
    }

    console.error('Error fetching workspaces:', error);

    // Throw generic internal server error
    throw new InternalServerErrorException(
      'Failed to retrieve workspaces. Please try again later.',
    );
  }
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
      secret: appConfig().jwt.secret,
      expiresIn: appConfig().jwt.expiry,
    });

    return {
      success: true,
      message: 'Workspace switched successfully',
      authorization: {
        type: 'bearer',
        access_token: accessToken,
      },
      type: user.type,
      user: {
        id: user.id,
        owner_id: user.owner_id == null ? user.id : user.owner_id,
        workspace_id: user.workspace_id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
