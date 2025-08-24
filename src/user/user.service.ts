import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    if (dto.roleId) {
      await this.assignRoleToUser(user.id, dto.roleId);
    }

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

// If `type` is a string column in Prisma (e.g., String):
async getAllUsers() {
  return this.prisma.user.findMany({
    where: { type: 'USER' }, // filter only Users
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
    orderBy: { id: 'asc' },
  });
}
// Get all customers
async getAllCustomers() {
  return this.prisma.user.findMany({
    where: { type: 'CUSTOMER' }, // filter only customers
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
    orderBy: { id: 'asc' },
  });
}

// Get all vendors
async getAllVendor() {
  return this.prisma.user.findMany({
    where: { type: 'VENDOR' }, // filter only Vendors
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
    orderBy: { id: 'asc' },
  });
}


  // Assign role to a user (helper method)
  async assignRoleToUser(userId: string, roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return {
        success: false,
        message: 'Role not found with this roleId',
      };
    }

    try {
      // roleId already ache, just user_id update korte hobe
      const updatedRole = await this.prisma.role.update({
        where: { id: roleId },
        data: { user_id: userId },
      });

      return {
        success: true,
        message: 'User assigned to role successfully!',
        data: updatedRole,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to assign role to user',
        error: error.message,
      };
    }
  }

async updateUser(userId: string, updateUserDto: CreateUserDto) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Update user information
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      ...updateUserDto, // Spread the updated user details 
    },
  });

  return {
    success: true,
    message: 'User updated successfully!',
    user: updatedUser,
  };
}


  // Get a single user by userId
  // Get a user by their ID and include their roles and the associated permissions
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true, // Include permissions related to the role
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Exclude sensitive data (like password) from the response
    const { password, ...safeUser } = user;

    // Format the roles and permissions
    const rolesWithPermissions = user.roles.map((role) => ({
      roleId: role.id,
      roleName: role.title,
      permissions: role.permissions.map((permission) => permission.title), // Only include permission titles
    }));

    return {
      success: true,
      message: 'User fetched successfully',
      user: {
        id: safeUser.id,
        email: safeUser.email,
        first_name: safeUser.first_name,
        last_name: safeUser.last_name,
        type: safeUser.type,
        owner_id: safeUser.owner_id,
        phone_number: safeUser.phone_number,
        created_at: safeUser.created_at,
        updated_at: safeUser.updated_at,
        username: safeUser.username,
        roles: rolesWithPermissions, // Include roles and permissions in the response
      },
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
