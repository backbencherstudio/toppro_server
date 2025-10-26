import { Injectable, ForbiddenException } from '@nestjs/common';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HelpDeskCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Create HelpDesk Category (Only SUPERADMIN can do this)
  async createHelpDeskCategory(userId: string, name: string, color: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.type !== 'SUPERADMIN') {
      throw new ForbiddenException(
        'You do not have permission to create a HelpDesk Category',
      );
    }

    const newCategory = await this.prisma.helpDeskCategory.create({
      data: {
        name,
        color,
        created_by: userId,
      },
    });

    return newCategory;
  }

  // Get all HelpDesk Categories (Available to all users)
  async getHelpDeskCategories(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit; // Calculate how many items to skip

    const categories = await this.prisma.helpDeskCategory.findMany({
      skip, // Skip the first (page - 1) * limit items
      take: limit, // Ensure limit is passed as an integer (not a string)
    });

    // Optionally, return total count for pagination metadata
    const totalCategories = await this.prisma.helpDeskCategory.count();

    return {
      categories,
      totalPages: Math.ceil(totalCategories / limit), // Total number of pages
      currentPage: page, // Current page number
      totalItems: totalCategories, // Total number of items
    };
  }

  // Update HelpDesk Category (Only SUPERADMIN can do this)
  async updateHelpDeskCategory(
    userId: string,
    categoryId: string,
    name: string,
    color: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.type !== 'SUPERADMIN') {
        throw new ForbiddenException(
          'You do not have permission to update the HelpDesk Category',
        );
      }

      const category = await this.prisma.helpDeskCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new Error('Category not found');
      }

      const updatedCategory = await this.prisma.helpDeskCategory.update({
        where: { id: categoryId },
        data: {
          name,
          color,
        },
      });

      return updatedCategory;
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  // Delete HelpDesk Category (Only SUPERADMIN can do this)
  async deleteHelpDeskCategory(userId: string, categoryId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.type !== 'SUPERADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete the HelpDesk Category',
      );
    }

    const category = await this.prisma.helpDeskCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new Error('Category not found');
    }

    await this.prisma.helpDeskCategory.delete({
      where: { id: categoryId },
    });

    return { message: 'Category deleted successfully' };
  }
}
