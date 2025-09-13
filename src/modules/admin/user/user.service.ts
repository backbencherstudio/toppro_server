import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/modules/auth/dto/update-user.dto';
import { DateHelper } from '../../../common/helper/date.helper';
import { UserRepository } from '../../../common/repository/user/user.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Create a new Owner
  async create(createUserDto: CreateUserDto) {
    try {
      //@ts-ignore
      const user = await UserRepository.createUser(createUserDto);

      if (user.success) {
        return {
          success: user.success,
          message: user.message,
        };
      } else {
        return {
          success: user.success,
          message: user.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get all owners
  async findAll() {
    return this.prisma.user.findMany({
      where: { type: UserType.OWNER }, // or UserType.OWNER
      select: {
        id: true,
        avatar: true,
        name: true,
        email: true,
        type: true,
        status: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Get one user by id
  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          avatar: true,
          name: true,
          email: true,
          type: true,
          status: true,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Failed to fetch user: ' + error.message);
    }
  }

  async approve(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: id },
      });
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }
      await this.prisma.user.update({
        where: { id: id },
        data: { status: 1, approved_at: DateHelper.now() },
      });
      return {
        success: true,
        message: 'User approved successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async reject(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: id },
      });
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }
      await this.prisma.user.update({
        where: { id: id },
        data: { approved_at: null },
      });
      return {
        success: true,
        message: 'User rejected successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update user status (disable or enable) only
  async updateStatus(id: string, status: number) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          status,
          approved_at: status === 1 ? new Date() : null, 
        },
        select: {
          avatar: true,
          name: true,
          email: true,
          type: true,
          status: true,
        },
      });

      return {
        success: true,
        message:
          status === 1
            ? 'User enabled successfully'
            : 'User disabled successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update status: ' + error.message,
      };
    }
  }

  async updateUser(id: string, data: UpdateUserDto) {
    try {
      const updateData: any = { ...data };

      // Password hash if provided
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(data.password, salt);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          first_name: true,
          last_name: true,
          address: true,
          phone_number: true,
        },
      });

      return {
        success: true,
        message: 'User updated successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update user: ' + error.message,
      };
    }
  }

async deleteOwner(id: string) {
  try {
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    return { success: false, message: 'Failed to delete user: ' + error.message };
  }
}

}
