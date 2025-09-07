// -------- CATEGORY SERVICE (Refactored) --------
import { Injectable } from '@nestjs/common';
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
      message: 'Item category created successfully',
      data: created,
    };
  }

  async findAllItemCategories(ownerId: string, workspaceId: string, userId: string) {
    const data = await this.prisma.itemCategory.findMany({
      where: { owner_id: ownerId || userId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findItemCategoryOne(id: string, ownerId: string, workspaceId: string, userId: string) {
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

  async removeItemCategory(id: string, ownerId: string, workspaceId: string, userId: string) {
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
  ) {
    const created = await this.prisma.invoiceCategory.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
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
    workspaceId: string,
  ) {
    const data = await this.prisma.invoiceCategory.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllInvoiceCategories(ownerId: string, workspaceId: string) {
    const data = await this.prisma.invoiceCategory.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
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
  ) {
    const created = await this.prisma.billCategory.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, message: 'Bill category created', data: created };
  }

  async findBillCategoryOne(id: string, ownerId: string, workspaceId: string) {
    const data = await this.prisma.billCategory.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllBillCategories(ownerId: string, workspaceId: string) {
    const data = await this.prisma.billCategory.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
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
  ) {
    const created = await this.prisma.tax.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, message: 'Tax created', data: created };
  }

  async findTaxCategoryOne(id: string, ownerId: string, workspaceId: string) {
    const data = await this.prisma.tax.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllTaxes(ownerId: string, workspaceId: string) {
    const data = await this.prisma.tax.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
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
    workspaceId: string,
  ) {
    try {
      const created = await this.prisma.unit.create({
        data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
      });

      return { success: true, message: 'Unit created', data: created };
    } catch (error: any) {
      // Handle Prisma unique constraint error
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return {
          success: false,
          message: `Unit with name "${dto.name}" already exists. Please choose a different name.`,
          data: null,
        };
      }

      // Generic error fallback
      return {
        success: false,
        message: 'An unexpected error occurred while creating the unit.',
        data: null,
      };
    }
  }

  async findUnitCategoryOne(id: string, ownerId: string, workspaceId: string) {
    const data = await this.prisma.unit.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllUnits(ownerId: string, workspaceId: string) {
    const data = await this.prisma.unit.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async updateUnit(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    try {
      const updated = await this.prisma.unit.update({
        where: { id },
        data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
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
    workspaceId: string,
  ) {
    const created = await this.prisma.itemType.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, message: 'Item type created', data: created };
  }

    async findItemTypesCategoryOne(id: string, ownerId: string, workspaceId: string) {
    const data = await this.prisma.itemType.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }


  async findAllItemTypes(ownerId: string, workspaceId: string) {
    const data = await this.prisma.itemType.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async updateItemType(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    const updated = await this.prisma.itemType.update({
      where: { id },
      data: dto,
    });
    return { success: true, message: 'Item type updated', data: updated };
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
  ) {
    const created = await this.prisma.accountType.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, message: 'Account type created', data: created };
  }
  
      async findIAccountTypesCategoryOne(id: string, ownerId: string, workspaceId: string) {
    const data = await this.prisma.accountType.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async findAllAccountTypes(ownerId: string, workspaceId: string) {
    const data = await this.prisma.accountType.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
    return { success: true, data };
  }

  async updateAccountType(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    const updated = await this.prisma.accountType.update({
      where: { id },
      data: dto,
    });
    return { success: true, message: 'Account type updated', data: updated };
  }

  async removeAccountType(id: string, ownerId: string, workspaceId: string) {
    const deleted = await this.prisma.accountType.delete({ where: { id } });
    return { success: true, message: 'Account type deleted', data: deleted };
  }
}
