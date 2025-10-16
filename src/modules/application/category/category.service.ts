// -------- CATEGORY SERVICE (Refactored) --------
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCategoryDto } from 'src/modules/application/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/application/category/dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // -------- ITEM CATEGORY --------
  async createItemCategory(
    dto: CreateCategoryDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try {
      const created = await this.prisma.itemCategory.create({
        data: {
          name: dto.name,
          color: dto.color,
          owner_id: ownerId || userId,
          workspace: { connect: { id: workspaceId } },
        },
      });

      return {
        success: true,
        message: 'Item category created successfully!',
        data: created,
      };
    } catch (error: any) {
      console.error('❌ Error creating item category:', error);

      if (error.code === 'P2002') {
        // Unique constraint violation (duplicate name, etc.)
        return {
          success: false,
          message: `Duplicate value for field: ${
            error.meta?.target?.join(', ') || 'unknown'
          }.`,
        };
      }

      if (error.code === 'P2003') {
        // Foreign key constraint (workspace_id invalid)
        return {
          success: false,
          message:
            'Invalid reference: The workspace_id or owner_id does not exist.',
        };
      }

      if (error.code === 'P2011') {
        // Null constraint violation (missing required fields)
        return {
          success: false,
          message: 'Missing required fields. Please check and try again.',
        };
      }

      // General catch-all for unexpected issues
      return {
        success: false,
        message: 'Unexpected error occurred while creating the item category.',
        error: error.message,
      };
    }
  }

  async findAllItemCategories(
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const data = await this.prisma.itemCategory.findMany({
      where: { owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findItemCategoryOne(
    id: string,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const data = await this.prisma.itemCategory.findFirst({
      where: { id: id, owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async updateItemCategory(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const updated = await this.prisma.itemCategory.update({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId },
      data: dto,
    });
    return {
      success: true,
      message: 'Item category updated successfully',
      data: updated,
    };
  }

  async removeItemCategory(
    id: string,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const deleted = await this.prisma.itemCategory.delete({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return {
      success: true,
      message: 'Item category deleted successfully',
      data: deleted,
    };
  }

  // -------- INVOICE CATEGORY --------
  async createInvoiceCategory(
    dto: CreateCategoryDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const created = await this.prisma.invoiceCategory.create({
      data: { ...dto, owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return {
      success: true,
      message: 'Invoice category created',
      data: created,
    };
  }

  async findInvoiceCategoryOne(
    id: string,
    ownerId: string,
    userId: string,
    workspaceId: string,
  ) {
    const data = await this.prisma.invoiceCategory.findFirst({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllInvoiceCategories(
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const data = await this.prisma.invoiceCategory.findMany({
      where: { owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async updateInvoiceCategory(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    const updated = await this.prisma.invoiceCategory.update({
      where: { id },
      data: dto,
    });
    return {
      success: true,
      message: 'Invoice category updated',
      data: updated,
    };
  }

  async removeInvoiceCategory(
    id: string,
    ownerId: string,
    workspaceId: string,
  ) {
    const deleted = await this.prisma.invoiceCategory.delete({ where: { id } });
    return {
      success: true,
      message: 'Invoice category deleted',
      data: deleted,
    };
  }

  // -------- BILL CATEGORY --------
  async createBillCategory(
    dto: CreateCategoryDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try {
      // ✅ Create the bill category
      const created = await this.prisma.billCategory.create({
        data: {
          ...dto,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
        },
      });

      return {
        success: true,
        message: 'Bill category created successfully!',
        data: created,
      };
    } catch (error: any) {
      console.error('❌ Error creating bill category:', error);

      // ✅ Prisma unique constraint error (duplicate name, slug, etc.)
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Duplicate value for field: ${error.meta?.target?.join(', ') || 'unknown'}.`,
        );
      }

      // ✅ Foreign key constraint (owner_id or workspace_id invalid)
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid reference: workspace_id or owner_id not found.',
        );
      }

      // ✅ Missing required field or null constraint
      if (error.code === 'P2011') {
        throw new BadRequestException(
          'Missing required fields. Please fill all mandatory values.',
        );
      }

      // ✅ General Prisma or database connection issue
      if (error.code === 'P1001' || error.code === 'P1010') {
        throw new InternalServerErrorException(
          'Database connection issue. Please try again later.',
        );
      }

      // ✅ Fallback for unexpected errors
      throw new InternalServerErrorException(
        `Unexpected error occurred: ${error.message}`,
      );
    }
  }

  async findBillCategoryOne(id: string, ownerId: string, workspaceId: string) {
    const data = await this.prisma.billCategory.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllBillCategories(
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const data = await this.prisma.billCategory.findMany({
      where: { owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async updateBillCategory(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    const updated = await this.prisma.billCategory.update({
      where: { id },
      data: dto,
    });
    return { success: true, message: 'Bill category updated', data: updated };
  }

  async removeBillCategory(id: string, ownerId: string, workspaceId: string) {
    const deleted = await this.prisma.billCategory.delete({ where: { id } });
    return { success: true, message: 'Bill category deleted', data: deleted };
  }

  // -------- TAX --------
  async createTax(
    dto: CreateCategoryDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try {
      const created = await this.prisma.tax.create({
        data: {
          ...dto,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
        },
      });

      return {
        success: true,
        message: 'Tax created successfully!',
        data: created,
      };
    } catch (error: any) {
      console.error('❌ Error creating tax:', error);

      // Prisma-specific error handling
      if (error.code === 'P2002') {
        // Unique constraint (e.g., same tax name exists)
        return {
          success: false,
          message: `Duplicate value for field: ${
            error.meta?.target?.join(', ') || 'unknown'
          }.`,
        };
      }

      if (error.code === 'P2003') {
        // Foreign key constraint
        return {
          success: false,
          message: 'Invalid reference: workspace_id or owner_id not found.',
        };
      }

      if (error.code === 'P2011') {
        // Null constraint violation
        return {
          success: false,
          message: 'Missing required fields. Please fill all mandatory values.',
        };
      }

      // Fallback for any unexpected errors
      return {
        success: false,
        message: 'Unexpected error occurred while creating the tax.',
        error: error.message,
      };
    }
  }

  async findTaxCategoryOne(id: string, ownerId: string, workspaceId: string) {
    const data = await this.prisma.tax.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllTaxes(ownerId: string, workspaceId: string, userId: string) {
    try {
      const data = await this.prisma.tax.findMany({
        where: {
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
        },
      });

      return {
        success: true,
        message: data.length
          ? 'Taxes fetched successfully!'
          : 'No taxes found for this workspace.',
        data,
      };
    } catch (error: any) {
      console.error('❌ Error fetching taxes:', error);

      // Prisma error handling
      if (error.code === 'P1001') {
        // Database connection issue
        return {
          success: false,
          message:
            'Database connection failed. Please check your connection or try again later.',
        };
      }

      if (error.code === 'P2023') {
        // Invalid ID format or query
        return {
          success: false,
          message:
            'Invalid query or ID format. Please verify workspace and owner IDs.',
        };
      }

      // General fallback
      return {
        success: false,
        message: 'Unexpected error occurred while fetching taxes.',
        error: error.message,
      };
    }
  }

  async updateTax(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    const updated = await this.prisma.tax.update({ where: { id }, data: dto });
    return { success: true, message: 'Tax updated', data: updated };
  }

  async removeTax(id: string, ownerId: string, workspaceId: string) {
    const deleted = await this.prisma.tax.delete({ where: { id } });
    return { success: true, message: 'Tax deleted', data: deleted };
  }

  // -------- UNIT --------
  async createUnit(
    dto: CreateCategoryDto,
    ownerId: string,
    userId: string,
    workspaceId: string,
  ) {
    try {
      // basic validation
      if (!dto.name) {
        throw new BadRequestException('❌ Unit name is required.');
      }

      const created = await this.prisma.unit.create({
        data: {
          name: dto.name,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
        },
      });

      return {
        success: true,
        message: '✅ Unit created successfully.',
        data: {
          id: created.id,
          name: created.name,
          status: created.status,
        },
      };
    } catch (error: any) {
      // 👇 Using console instead of Logger
      console.error('❌ Error while creating unit:', error);

      if (error.code === 'P2002') {
        const target = error.meta?.target?.join(', ') || 'unique field';
        throw new ConflictException(
          `❌ Duplicate value for ${target}. A unit with this ${target} already exists.`,
        );
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          '❌ Invalid reference — related owner or workspace not found.',
        );
      }

      if (error.code === 'P2025') {
        throw new BadRequestException(
          '❌ Record not found. Please check your data references.',
        );
      }

      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while creating the unit.',
      );
    }
  }

  async findUnitCategoryOne(id: string, ownerId: string, workspaceId: string) {
    const data = await this.prisma.unit.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllUnits(ownerId: string, workspaceId: string, userId: string) {
    const data = await this.prisma.unit.findMany({
      where: { owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async updateUnit(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try {
      const updated = await this.prisma.unit.update({
        where: { id },
        data: { ...dto, owner_id: ownerId || userId, workspace_id: workspaceId },
      });

      return {
        success: true,
        message: 'Unit updated successfully',
        data: updated,
      };
    } catch (error: any) {
      // Handle Prisma unique constraint error
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return {
          success: false,
          message: `Unit with name "${dto.name}" already exists. Please choose a different name.`,
          data: null,
        };
      }

      // Generic fallback
      return {
        success: false,
        message: 'An unexpected error occurred while updating the unit.',
        data: null,
      };
    }
  }

  async removeUnit(id: string, ownerId: string, workspaceId: string) {
    const deleted = await this.prisma.unit.delete({ where: { id } });
    return { success: true, message: 'Unit deleted', data: deleted };
  }

  // -------- ITEM TYPE --------
  async createItemType(
    dto: CreateCategoryDto,
    ownerId: string,
    userId: string,
    workspaceId: string,
  ) {
    try {
      // ✅ Step 1: Check if workspace exists
      const workspaceExists = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspaceExists) {
        throw new BadRequestException(
          `❌ Workspace with ID "${workspaceId}" not found.`,
        );
      }

      // ✅ Step 2: Create the item type
      const created = await this.prisma.itemType.create({
        data: {
          name: dto.name,
          description: dto.description,
          color: dto.color,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
        },
      });

      return {
        success: true,
        message: '✅ Item type created successfully.',
        data: created,
      };
    } catch (error: any) {
      console.error('❌ Error creating item type:', error);

      if (error.code === 'P2002') {
        throw new ConflictException(
          `❌ Duplicate item type name "${dto.name}" already exists.`,
        );
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          '❌ Invalid reference — please check that the workspace exists.',
        );
      }

      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while creating item type.',
      );
    }
  }

  async findItemTypesCategoryOne(
    id: string,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const data = await this.prisma.itemType.findFirst({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllItemTypes(ownerId: string, workspaceId: string, userId: string) {
    const data = await this.prisma.itemType.findMany({
      where: { owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

async updateItemType(
  id: string,
  dto: UpdateCategoryDto,
  ownerId: string,
  workspaceId: string,
  userId: string,
) {
  try {
    const existing = await this.prisma.itemType.findUnique({ where: { id } });
    if (!existing) {
      return {
        success: false,
        message: 'Item type not found',
      };
    }

    const updated = await this.prisma.itemType.update({
      where: { id },
      data: {
        ...dto,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
      },
    });

    return {
      success: true,
      message: 'Item type updated successfully',
      data: updated,
    };
  } catch (error) {
    // Prisma-specific error handling
    if (error.code === 'P2002') {
      // Unique constraint failed
      return {
        success: false,
        message: 'Duplicate entry — item type with this name already exists',
      };
    }

    if (error.code === 'P2025') {
      // Record not found
      return {
        success: false,
        message: 'Item type not found or already deleted',
      };
    }

    // General fallback
    console.error('Update ItemType Error:', error);
    return {
      success: false,
      message: 'Something went wrong while updating the item type',
      error: error.message,
    };
  }
}


  async removeItemType(id: string, ownerId: string, workspaceId: string) {
    const deleted = await this.prisma.itemType.delete({ where: { id } });
    return { success: true, message: 'Item type deleted', data: deleted };
  }

  // -------- ACCOUNT TYPE --------
  async createAccountType(
    dto: CreateCategoryDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const created = await this.prisma.accountType.create({
      data: { ...dto, owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, message: 'Account type created', data: created };
  }

  async findIAccountTypesCategoryOne(
    id: string,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const data = await this.prisma.accountType.findFirst({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllAccountTypes(
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const data = await this.prisma.accountType.findMany({
      where: { owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async updateAccountType(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const updated = await this.prisma.accountType.update({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId },
      data: dto,
    });
    return { success: true, message: 'Account type updated', data: updated };
  }

  async removeAccountType(id: string, ownerId: string, workspaceId: string) {
    const deleted = await this.prisma.accountType.delete({ where: { id } });
    return { success: true, message: 'Account type deleted', data: deleted };
  }
}
