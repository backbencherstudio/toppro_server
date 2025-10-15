import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Permissions } from 'src/ability/permissions.enum'; // Permissions enum
import { UpdateRoleDto } from 'src/modules/admin/roles/dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto'; // CreateRoleDto for input validation

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}
  private async shapeRoleResponse(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        title: true,
        description: true,
        permissions: { select: { id: true, title: true } }, // keep minimal
        role_users: {
          select: {
            user: {
              select: { id: true, name: true, email: true, username: true },
            },
          },
        },
      },
    });

    if (!role) throw new NotFoundException('Role not found');

    return {
      success: true,
      role: {
        id: role.id,
        title: role.title ?? null,
        description: role.description ?? null,
        permissions: role.permissions,
        users: role.role_users.map((ru) => ru.user), // [{id,name,email,username}]
      },
    };
  }

  async getRole(roleId: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
        select: {
          id: true,
          title: true,
          permissions: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!role) {
        return {
          success: false,
          message: 'Role not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Role fetched successfully!',
        data: role,
      };
    } catch (error) {
      console.error('Error fetching role:', error);
      throw new BadRequestException({
        success: false,
        message: 'Failed to fetch role',
        error: error.message,
      });
    }
  }

  async assignUserToRole(roleId: string, userId: string) {
    // validate role + user exist
    const [role, user] = await Promise.all([
      this.prisma.role.findUnique({
        where: { id: roleId },
        select: { id: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
    ]);
    if (!role) throw new NotFoundException('Role not found');
    if (!user) throw new NotFoundException('User not found');

    // idempotent upsert (relies on @@unique([role_id, user_id]))
    await this.prisma.roleUser.upsert({
      where: { role_id_user_id: { role_id: roleId, user_id: userId } },
      create: { role_id: roleId, user_id: userId },
      update: {},
    });

    return this.shapeRoleResponse(roleId);
  }

  async assignUsersToRole(roleId: string, userIds: string[]) {
    // ensure role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { id: true },
    });
    if (!role) throw new NotFoundException('Role not found');

    // filter only valid users
    const validUsers = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });
    const validSet = new Set(validUsers.map((u) => u.id));
    const toTry = userIds.filter((id) => validSet.has(id));

    if (toTry.length === 0) {
      // still respond with the role, consistent with your style
      return this.shapeRoleResponse(roleId);
    }

    // skip duplicates
    await this.prisma.roleUser.createMany({
      data: toTry.map((uid) => ({ role_id: roleId, user_id: uid })),
      skipDuplicates: true,
    });

    return this.shapeRoleResponse(roleId);
  }

  async unassignUserFromRole(roleId: string, userId: string) {
    // if pair not found, Prisma will throw; you can swallow with try/catch if you prefer soft-delete style.
    await this.prisma.roleUser.delete({
      where: { role_id_user_id: { role_id: roleId, user_id: userId } },
    });

    return this.shapeRoleResponse(roleId);
  }

  // Function to create a role and assign permissions to it
  async createRoleWithPermissions(
    createRoleDto: CreateRoleDto,
    ownerId: string,
    workspaceId: string,
  ) {
    // Step 1: Create the role
    const role = await this.prisma.role.create({
      data: {
        title: createRoleDto.title,
        description: createRoleDto.description,
        owner_id: ownerId,
        workspace_id: workspaceId,
      },
    });

    // Step 2: Get the permissions from the request body
    const permissions = createRoleDto.permissions || [];

    // Step 3: Validate permissions against the Permissions Enum
    const validPermissions = this.getValidPermissions(permissions);

    // console.log('Valid Permissions:', validPermissions);  // Log valid permissions

    if (validPermissions.length === 0) {
      return {
        success: false,
        message: 'No valid permissions provided.',
      };
    }

    // Step 4: Insert missing permissions into the database
    const permissionData = await Promise.all(
      validPermissions.map(async (permission) => {
        // Check if the permission already exists
        let existingPermission = await this.prisma.permission.findUnique({
          where: { title: permission },
        });

        // If permission doesn't exist, create it
        if (!existingPermission) {
          existingPermission = await this.prisma.permission.create({
            data: {
              title: permission,
              action: permission.split('_')[1], // Example: crm_manage -> action: manage
              subject: permission.split('_')[0], // Example: crm_manage -> subject: crm
            },
          });
        }

        return existingPermission;
      }),
    );

    // Step 5: If permissions are found, connect them to the role
    await this.prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          connect: permissionData.map((perm) => ({ id: perm.id })),
        },
      },
    });

    return {
      success: true,
      message: 'Role created and permissions assigned successfully!',
      // role: role,
      // permissions: permissionData,
    };
  }

  async updateRole(
    roleId: string,
    updateRoleDto: CreateRoleDto, // same DTO reuse করা যায়
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    // Step 1: Check if role exists
    const existingRole = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });

    if (!existingRole) {
      return {
        success: false,
        message: 'Role not found!',
      };
    }

    // Step 2: Clear old permissions first
    await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: [], // remove all old relations
        },
      },
    });

    // Step 3: Validate new permissions
    const newPermissions = updateRoleDto.permissions || [];
    const validPermissions = this.getValidPermissions(newPermissions);

    if (validPermissions.length === 0) {
      return {
        success: false,
        message: 'No valid permissions provided for update.',
      };
    }

    // Step 4: Ensure permissions exist (create if missing)
    const permissionData = await Promise.all(
      validPermissions.map(async (permission) => {
        let existingPermission = await this.prisma.permission.findUnique({
          where: { title: permission },
        });

        if (!existingPermission) {
          existingPermission = await this.prisma.permission.create({
            data: {
              title: permission,
              action: permission.split('_')[1],
              subject: permission.split('_')[0],
            },
          });
        }

        return existingPermission;
      }),
    );

    // Step 5: Update role title/description and connect new permissions
    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        title: updateRoleDto.title,
        description: updateRoleDto.description,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
        permissions: {
          connect: permissionData.map((perm) => ({ id: perm.id })),
        },
      },
      include: {
        permissions: {
          select: { title: true },
        },
      },
    });

    return {
      success: true,
      message: 'Role updated successfully with new permissions!',
      data: updatedRole,
    };
  }

  // Function to update a role
  // async updateRole(roleId: string, updateRoleDto: UpdateRoleDto) {
  //   // Step 1: Find the role by id
  //   const role = await this.prisma.role.findUnique({
  //     where: { id: roleId },
  //   });

  //   if (!role) {
  //     throw new Error('Role not found');
  //   }

  //   // Step 2: Update the role data
  //   const updatedRole = await this.prisma.role.update({
  //     where: { id: roleId },
  //     data: {
  //       title: updateRoleDto.title || role.title, // Keep existing title if not provided
  //       description: updateRoleDto.description || role.description, // Keep existing description if not provided
  //     },
  //   });

  //   // Step 3: Handle permissions if provided
  //   if (updateRoleDto.permissions) {
  //     const validPermissions = this.getValidPermissions(
  //       updateRoleDto.permissions,
  //     );

  //     // Fetch existing permission data
  //     const permissionData = await this.prisma.permission.findMany({
  //       where: {
  //         title: { in: validPermissions },
  //       },
  //     });

  //     // Connect the valid permissions to the role
  //     await this.prisma.role.update({
  //       where: { id: updatedRole.id },
  //       data: {
  //         permissions: {
  //           connect: permissionData.map((perm) => ({ id: perm.id })),
  //         },
  //       },
  //     });
  //   }

  //   return {
  //     success: true,
  //     message: 'Role updated successfully!',
  //     role: updatedRole,
  //   };
  // }

  // Function to validate permissions against the Permissions Enum
  private getValidPermissions(permissions: string[]): string[] {
    return permissions.filter((permission) =>
      Object.values(Permissions).includes(permission as Permissions),
    );
  }

  // 📜 GET all roles (filtered by owner & workspace) with minimal fields
  async getAllRoles(ownerId: string, workspaceId: string) {
    // if (!ownerId || !workspaceId) {
    //   throw new BadRequestException('ownerId and workspaceId are required.');
    // }

    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        title: true,
        permissions: { select: { title: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      roles: roles.map((r) => ({
        id: r.id,
        title: r.title,
        permissions: r.permissions, // [{id,title}]
      })),
    };
  }

  // Get a single role by ID
  async getRoleById(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        title: true, // Role name
        description: true, // Role description (if needed)
        permissions: {
          select: {
            id: true,
            title: true, // Permission titles
          },
        },
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return {
      success: true,
      role: role,
    };
  }
}
