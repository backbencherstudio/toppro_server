import { Injectable } from '@nestjs/common';
import { Permissions } from 'src/ability/permissions.enum'; // Permissions enum
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto'; // CreateRoleDto for input validation
import { UpdateRoleDto } from 'src/modules/admin/roles/dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  // Function to create a role and assign permissions to it
  async createRoleWithPermissions(createRoleDto: CreateRoleDto) {
    // Step 1: Create the role
    const role = await this.prisma.role.create({
      data: {
        title: createRoleDto.title,
        description: createRoleDto.description,
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
      role: role,
      permissions: permissionData, // Include permission id and title in the response
    };
  }


  // Function to update a role
  async updateRole(roleId: string, updateRoleDto: UpdateRoleDto) {
    // Step 1: Find the role by id
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Step 2: Update the role data
    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        title: updateRoleDto.title || role.title,  // Keep existing title if not provided
        description: updateRoleDto.description || role.description,  // Keep existing description if not provided
      },
    });

    // Step 3: Handle permissions if provided
    if (updateRoleDto.permissions) {
      const validPermissions = this.getValidPermissions(updateRoleDto.permissions);

      // Fetch existing permission data
      const permissionData = await this.prisma.permission.findMany({
        where: {
          title: { in: validPermissions },
        },
      });

      // Connect the valid permissions to the role
      await this.prisma.role.update({
        where: { id: updatedRole.id },
        data: {
          permissions: {
            connect: permissionData.map((perm) => ({ id: perm.id })),
          },
        },
      });
    }

    return {
      success: true,
      message: 'Role updated successfully!',
      role: updatedRole,
    };
  }

  // Function to validate permissions against the Permissions Enum
  private getValidPermissions(permissions: string[]): string[] {
    return permissions.filter((permission) =>
      Object.values(Permissions).includes(permission as Permissions),
    );
  }

  // Get all roles with name and ID
  async getAllRoles() {
    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        title: true, // This will return the role name (title)
      },
    });

    return {
      success: true,
      roles: roles, // All roles with name and ID
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
