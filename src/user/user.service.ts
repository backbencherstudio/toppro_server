import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create_user-dto';
import { LoginDto } from './dto/login_dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Create new user and assign role
  async create(dto: CreateUserDto) {
    // Check for existing username and email
    const [existingUser, existingEmail] = await Promise.all([
      this.prisma.user.findUnique({ where: { username: dto.username } }),
      this.prisma.user.findUnique({ where: { email: dto.email } }),
    ]);

    if (existingUser || existingEmail) {
      return {
        success: false,
        message: '❗ Username or Email already taken, try a different one.',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        owner_id: dto.owner_id,
        password: hashedPassword,
        first_name: dto.first_name ?? null,
        last_name: dto.last_name ?? null,
      },
    });

    // Assign role if provided (roleId)
    // if (dto.roleId) {
    //   await this.assignRoleToUse(user.id, dto.roleId);
    // }

    // Exclude unnecessary fields
    const { password, created_at, updated_at, ...safeUser } = user;

    return {
      success: true,
      message: '✅ User created successfully!',
      user: safeUser, // Returning only the necessary fields
    };
  }

  // Login method
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Exclude password before returning
    const { password, ...safeUser } = user;

    // Return response with required fields
    return {
      success: true,
      message: '✅ Login successful!',
      user: {
        id: safeUser.id,
        email: safeUser.email,
        first_name: safeUser.first_name,
        last_name: safeUser.last_name,
        type: safeUser.type,
        owner_id: safeUser.owner_id, // Add owner_id
        phone_number: safeUser.phone_number, // Add phone_number
        created_at: safeUser.created_at, // Add created_at
        updated_at: safeUser.updated_at, // Add updated_at
        username: safeUser.username, // Add username
      },
    };
  }

  // Get all users
  async getAllUsers(ownerId: string, workspaceId: string, userId: string) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          owner_id: ownerId || userId, // Match ownerId or userId
          workspace_id: workspaceId, // Match workspaceId
          type: 'USER', // Filter only USER type
        },
        select: {
          id: true,
          username: true,
          email: true,
          type: true,
          owner_id: true,
          phone_number: true,
          created_at: true,
          updated_at: true,
          first_name: true,
          last_name: true,
        },
        orderBy: { created_at: 'desc' },
      });

      // ✅ Handle empty data case
      if (users.length === 0) {
        return {
          success: true,
          message: 'No users found in this workspace.',
          data: [],
        };
      }

      // ✅ Success case
      return {
        success: true,
        message: 'All users fetched successfully!',
        data: users,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new BadRequestException({
        success: false,
        message: 'Failed to fetch users.',
        error: error.message,
      });
    }
  }

  // // Get all customers
  // async getAllCustomers(ownerId: string, workspaceId: string) {
  //   return this.prisma.user.findMany({
  //     where: {
  //       type: 'CUSTOMER',
  //       owner_id: ownerId,
  //       workspace_id: workspaceId,
  //     },
  //     select: {
  //       id: true,
  //       username: true,
  //       email: true,
  //       type: true,
  //       owner_id: true,
  //       phone_number: true,
  //       created_at: true,
  //       updated_at: true,
  //       first_name: true,
  //       last_name: true,
  //     },
  //     orderBy: { id: 'asc' },
  //   });
  // }

  // // Get all vendors
  // async getAllVendor(ownerId: string, workspaceId: string) {
  //   return this.prisma.user.findMany({
  //     where: {
  //       type: 'VENDOR',
  //       owner_id: ownerId,
  //       workspace_id: workspaceId,
  //     },
  //     select: {
  //       id: true,
  //       username: true,
  //       email: true,
  //       type: true,
  //       owner_id: true,
  //       phone_number: true,
  //       created_at: true,
  //       updated_at: true,
  //       first_name: true,
  //       last_name: true,
  //     },
  //     orderBy: { id: 'asc' },
  //   });
  // }

  // Assign role to a user (helper method)
  // async assignRoleToUser(userId: string, roleId: string) {
  //   const role = await this.prisma.role.findUnique({
  //     where: { id: roleId },
  //   });

  //   if (!role) {
  //     return {
  //       success: false,
  //       message: 'Role not found with this roleId',
  //     };
  //   }

  //   try {
  //     // roleId already ache, just user_id update korte hobe
  //     const updatedRole = await this.prisma.role.update({
  //       where: { id: roleId },
  //       data: { user_id: userId },
  //     });

  //     return {
  //       success: true,
  //       message: 'User assigned to role successfully!',
  //       data: updatedRole,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Failed to assign role to user',
  //       error: error.message,
  //     };
  //   }
  // }

  async updateUser(userId: string, updateUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ✅ Email check logic
    if (updateUserDto.email) {
      const isSameEmail = updateUserDto.email === user.email;

      if (!isSameEmail) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email },
        });

        if (emailExists) {
          throw new BadRequestException('Email already in use by another user');
        }
      }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...updateUserDto,
        },
      });

      return {
        success: true,
        message: 'User updated successfully!',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new BadRequestException('Failed to update user');
    }
  }

  // Get a single user by userId
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        type: true,
        owner_id: true,
        phone_number: true,
        created_at: true,
        updated_at: true,
        // 🔗 pivot → role → permissions (minimal fields only)
        role_users: {
          select: {
            role: {
              select: {
                id: true,
                title: true,
                permissions: {
                  select: { title: true }, // শুধু title লাগলে এটুকুই রাখো
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 🎯 Map roles & permissions from pivot
    const rolesWithPermissions = user.role_users.map((ru) => ({
      roleId: ru.role.id,
      roleName: ru.role.title,
      permissions: ru.role.permissions.map((p) => p.title), // ["crm_read", ...]
    }));

    return {
      success: true,
      message: 'User fetched successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        type: user.type,
        owner_id: user.owner_id,
        phone_number: user.phone_number,
        created_at: user.created_at,
        updated_at: user.updated_at,
        username: user.username,
        roles: rolesWithPermissions,
      },
    };
  }

  // Get users with CRM access
  async getUsersWithCrmAccess(
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        workspace_id: workspaceId,
        ...(ownerId ? { owner_id: ownerId } : {}), // ownerId না থাকলে skip
        role_users: {
          some: {
            role: {
              permissions: {
                some: {
                  title: { in: ['crm_read', 'crm_manage'] },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        name: true,
        type: true,
        created_at: true,
        updated_at: true,
        role_users: {
          select: {
            role: {
              select: {
                id: true,
                title: true,
                permissions: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // shape response (roles + permission titles)
    return {
      success: true,
      message: 'Users with CRM access fetched successfully',
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        name:
          u.name ||
          [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
          null,
        type: u.type,
        created_at: u.created_at,
        updated_at: u.updated_at,
        roles: u.role_users.map((ru) => ({
          roleId: ru.role.id,
          roleName: ru.role.title,
          permissions: ru.role.permissions.map((p) => p.title),
        })),
      })),
    };
  }

  // Get users with CRM access
  async getUsersWithPurchaseAccess(
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        workspace_id: workspaceId,
        ...(ownerId ? { owner_id: ownerId } : {}),
        role_users: {
          some: {
            role: {
              permissions: {
                some: {
                  title: { in: ['pruchase_read', 'pruchase_manage'] },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        name: true,
        type: true,
        created_at: true,
        updated_at: true,
        role_users: {
          select: {
            role: {
              select: {
                id: true,
                title: true,
                permissions: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // shape response (roles + permission titles)
    return {
      success: true,
      message: 'Users with CRM access fetched successfully',
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        name:
          u.name ||
          [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
          null,
        type: u.type,
        created_at: u.created_at,
        updated_at: u.updated_at,
        roles: u.role_users.map((ru) => ({
          roleId: ru.role.id,
          roleName: ru.role.title,
          permissions: ru.role.permissions.map((p) => p.title),
        })),
      })),
    };
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Delete the user
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: 'User deleted successfully!',
    };
  }

  async enableDisableUser(userId: string, status: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update the user status (enabled/disabled)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: status ? 1 : 0, // 1 for active, 0 for inactive
      },
    });

    return {
      success: true,
      message: `User ${status ? 'enabled' : 'disabled'} successfully!`,
      user: updatedUser,
    };
  }
}
