import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a purchase with multiple items
async create(dto: CreatePurchaseDto, ownerId: string, workspaceId: string, userId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const items = await tx.items.findMany({
        where: { id: { in: dto.items.map(i => i.itemId) }, workspace_id: workspaceId, owner_id: ownerId },
      });

      const itemsMap = new Map(items.map(i => [i.id, i]));

      const linesData = dto.items.map(line => {
        const baseItem = itemsMap.get(line.itemId);
        if (!baseItem) throw new BadRequestException(`Item not found: ${line.itemId}`);

        return {
          item_id: line.itemId,
          name: line.name ?? baseItem.name,
          sku: line.sku ?? baseItem.sku,
          description: line.description ?? baseItem.description,
          unit_id: line.unitId ?? baseItem.unit_id,
          tax_id: line.taxId ?? baseItem.tax_id,
          itemCategory_id: line.itemCategoryId ?? baseItem.itemCategory_id,
          itemType_id: line.itemTypeId ?? baseItem.itemType_id,

          quantity: line.quantity,
          unit_price: line.unitPrice ?? baseItem.sale_price ?? 0,
          discount: line.discount ?? 0,
          taxPercent: line.taxPercent ?? 0,

          owner_id: ownerId,
          workspace_id: workspaceId,
          user_id: userId,
        };
      });

      return tx.purchase.create({
        data: {
          vendor_id: dto.vendorId,
          accountType_id: dto.accountTypeId,
          workspace_id: workspaceId,
          owner_id: ownerId,
          user_id: userId,
          purchase_no: dto.purchaseNo,
          created_at: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,

          purchaseItems: { create: linesData },
        },
        include: { purchaseItems: true },
      });
    });
  }

  // Get all purchases for a workspace + owner
  // async findAll(ownerId: string, workspaceId: string) {
  //   return this.prisma.purchase.findMany({
  //     where: { owner_id: ownerId, workspace_id: workspaceId },
  //     include: { 
  //       // purchase: true,      // load PurchaseItems
  //       vendor: true,
  //       itemCategory: true,
  //       billing_category: true,
  //       AccountType: true,
  //       tax: true,
  //     },
  //     orderBy: { created_at: 'desc' },
  //   });
  // }

  // // Optional: Get single purchase
  // async findOne(id: string) {
  //   const purchase = await this.prisma.purchase.findUnique({
  //     where: { id },
  //     include: { purchase: true, vendor: true },
  //   });
  //   if (!purchase) throw new BadRequestException('Purchase not found');
  //   return purchase;
  // }
}
