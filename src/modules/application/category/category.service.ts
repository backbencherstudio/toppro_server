import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // -------- ITEM CATEGORY --------
  createItemCategory(
    dto: CreateCategoryDto,
    ownerId: string,
    workspaceId: string,
    user_id: string,
  ) {
    console.log('Creating item category with ownerId:', ownerId, 'and workspaceId:', workspaceId, dto);
     return this.prisma.itemCategory.create({
    data: {
      name: dto.name,
      color: dto.color,
      owner_id: ownerId,
      workspace: { connect: { id: workspaceId } }, // ✅ workspace relation
    },
  });
  }

  findAllItemCategories(ownerId: string, workspaceId: string) {
    return this.prisma.itemCategory.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  updateItemCategory(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.itemCategory.update({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
      data: dto,
    });
  }

  removeItemCategory(id: string, ownerId: string, workspaceId: string) {
    return this.prisma.itemCategory.delete({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  // -------- INVOICE CATEGORY --------
  createInvoiceCategory(
    dto: CreateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.invoiceCategory.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  findAllInvoiceCategories(ownerId: string, workspaceId: string) {
    return this.prisma.invoiceCategory.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  updateInvoiceCategory(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.invoiceCategory.update({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
      data: dto,
    });
  }

  removeInvoiceCategory(id: string, ownerId: string, workspaceId: string) {
    return this.prisma.invoiceCategory.delete({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  // -------- BILL CATEGORY --------
  createBillCategory(
    dto: CreateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.billCategory.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  findAllBillCategories(ownerId: string, workspaceId: string) {
    return this.prisma.billCategory.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  updateBillCategory(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.billCategory.update({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
      data: dto,
    });
  }

  removeBillCategory(id: string, ownerId: string, workspaceId: string) {
    return this.prisma.billCategory.delete({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  // -------- TAX --------
  createTax(dto: CreateCategoryDto, ownerId: string, workspaceId: string) {
    return this.prisma.tax.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  findAllTaxes(ownerId: string, workspaceId: string) {
    return this.prisma.tax.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  updateTax(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.tax.update({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
      data: dto,
    });
  }

  removeTax(id: string, ownerId: string, workspaceId: string) {
    return this.prisma.tax.delete({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  // -------- UNIT --------
  createUnit(dto: CreateCategoryDto, ownerId: string, workspaceId: string) {
    return this.prisma.unit.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  findAllUnits(ownerId: string, workspaceId: string) {
    return this.prisma.unit.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  updateUnit(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.unit.update({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
      data: dto,
    });
  }

  removeUnit(id: string, ownerId: string, workspaceId: string) {
    return this.prisma.unit.delete({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  // -------- ITEM TYPE --------
  createItemType(dto: CreateCategoryDto, ownerId: string, workspaceId: string) {
    return this.prisma.itemType.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  findAllItemTypes(ownerId: string, workspaceId: string) {
    return this.prisma.itemType.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  updateItemType(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.itemType.update({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
      data: dto,
    });
  }

  removeItemType(id: string, ownerId: string, workspaceId: string) {
    return this.prisma.itemType.delete({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  // -------- ACCOUNT TYPE --------
  createAccountType(
    dto: CreateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.accountType.create({
      data: { ...dto, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  findAllAccountTypes(ownerId: string, workspaceId: string) {
    return this.prisma.accountType.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  updateAccountType(
    id: string,
    dto: UpdateCategoryDto,
    ownerId: string,
    workspaceId: string,
  ) {
    return this.prisma.accountType.update({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
      data: dto,
    });
  }

  removeAccountType(id: string, ownerId: string, workspaceId: string) {
    return this.prisma.accountType.delete({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
  }
}
