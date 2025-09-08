import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, Status } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  // ------- helpers -------
  private pad(n: number, width = 7) {
    return 'PUR' + String(n).padStart(width, '0');
  }

  // simple per-workspace numberer (fine for low/mod concurrency)
  private async nextPurchaseNo(
    tx: Prisma.TransactionClient,
    workspaceId: string,
    userId?: string,
  ) {
    const last = await tx.purchase.findFirst({
      where: {
        workspace: { id: workspaceId || userId },
        purchase_no: { startsWith: 'PUR' },
      },
      orderBy: { purchase_no: 'desc' },
      select: { purchase_no: true },
    });
    const next = last ? parseInt(last.purchase_no!.slice(3), 10) + 1 : 1;
    return this.pad(next);
  }

  // ------- Resolve lines and compute total, ensuring ItemType exists -------
  private async resolveLinesAndCompute(
    tx: Prisma.TransactionClient,
    items: Array<any>,
    ownerId: string,
    workspaceId: string,
    userId?: string,
  ): Promise<{ lineCreates: any[]; grandTotal: number }> {
    if (!items?.length) return { lineCreates: [], grandTotal: 0 };

    // 1) Load base Items inside scope
    const requestedIds = [...new Set(items.map((i) => i.item_id))];

    const baseItems = await tx.items.findMany({
      where: {
        id: { in: requestedIds },
        owner_id: ownerId,
        workspace: { id: workspaceId },
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        unit_id: true,
        tax_id: true,
        itemCategory_id: true,
        itemType_id: true,
        sale_price: true,
        purchase_price: true,
      },
    });

    const found = new Set(baseItems.map((b) => b.id));
    const missing = requestedIds.filter((id) => !found.has(id));
    if (missing.length) {
      throw new BadRequestException({
        code: 'ITEM_NOT_FOUND_IN_SCOPE',
        message:
          'Some items are not found in this workspace/owner scope or are deleted.',
        missingIds: missing,
      });
    }

    const baseMap = new Map(baseItems.map((b) => [b.id, b]));

    // 2) Resolve nulls from base snapshot
    const resolved = await Promise.all(
      items.map(async (raw) => {
        const base = baseMap.get(raw.item_id)!;

        // Ensure ItemType exists for each item in the resolved items
        if (raw.item_type_id) {
          const itemType = await tx.itemType.findUnique({
            where: { id: raw.item_type_id },
          });

          if (!itemType) {
            throw new BadRequestException(
              `ItemType with ID ${raw.item_type_id} does not exist.`,
            );
          }
        }

        const quantity = Number(raw.quantity ?? 1);
        const price = Number(
          raw.purchase_price ?? base.purchase_price ?? base.sale_price ?? 0,
        );
        const discount = Number(raw.discount ?? 0);

        const item_type_id = raw.item_type_id ?? base.itemType_id ?? null;
        const tax_id = raw.tax_id ?? base.tax_id ?? null;
        const itemCategoryId =
          raw.itemCategory_id ?? base.itemCategory_id ?? null;
        const unit_id = raw.unit_id ?? base.unit_id ?? null;

        const name = raw.name ?? base.name ?? null;
        const sku = raw.sku ?? base.sku ?? null;
        const description = raw.description ?? base.description ?? null;

        return {
          item_id: raw.item_id,
          quantity,
          price,
          discount,
          item_type_id,
          tax_id,
          itemCategoryId,
          unit_id,
          name,
          sku,
          description,
        };
      }),
    );

    // 3) Fetch tax percents (by resolved tax_id)
    const taxIds = [
      ...new Set(resolved.map((r) => r.tax_id).filter(Boolean)),
    ] as string[];
    const taxPct = new Map<string, number>();
    if (taxIds.length) {
      const taxes = await tx.tax.findMany({
        where: { id: { in: taxIds } },
        select: { id: true, rate: true },
      });
      taxes.forEach((t) => taxPct.set(t.id, Number(t.rate ?? 0)));
    }

    // 4) Build nested create payloads
    let grandTotal = 0;

    const lineCreates = resolved.map((r) => {
      const subtotal = r.quantity * r.price;
      const afterDiscount = subtotal - r.discount;
      const pct = r.tax_id ? Number(taxPct.get(r.tax_id) ?? 0) : 0;
      const taxAmount = afterDiscount * (pct / 100);
      const total = afterDiscount + taxAmount;

      grandTotal += total;

      const createData: any = {
        // relations — MUST use connect (Prisma nested create expects relation fields)
        item: { connect: { id: r.item_id } },
        ...(r.item_type_id
          ? { itemType: { connect: { id: r.item_type_id } } }
          : {}),
        ...(r.tax_id ? { tax: { connect: { id: r.tax_id } } } : {}),
        ...(r.itemCategoryId
          ? { itemCategory: { connect: { id: r.itemCategoryId } } }
          : {}),
        ...(r.unit_id ? { unit: { connect: { id: r.unit_id } } } : {}),
        quantity: r.quantity,
        purchase_price: r.price,
        discount: r.discount,
        total: total,
        description: r.description ?? undefined,
        name: r.name ?? undefined,
        sku: r.sku ?? undefined,
        unit_price: r.price,
        total_price: total,
        owner_id: ownerId,
        workspace: { connect: { id: workspaceId } },
        ...(userId ? { user: { connect: { id: userId } } } : {}),
      };

      return createData;
    });

    return { lineCreates, grandTotal };
  }

  // ------- CREATE -------
  async create(
    dto: CreatePurchaseDto, // snake_case payload
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    if (!dto.items?.length) {
      throw new BadRequestException('At least one item is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const { lineCreates, grandTotal } = await this.resolveLinesAndCompute(
        tx,
        dto.items,
        ownerId,
        workspaceId,
        userId,
      );

      const purchaseNo = await this.nextPurchaseNo(tx, workspaceId);

      const data: any = {
        purchase_no: purchaseNo,
        purchase_date: dto.purchase_date
          ? new Date(dto.purchase_date)
          : undefined,

        // header relations
        ...(dto.account_type_id
          ? { AccountType: { connect: { id: dto.account_type_id } } }
          : {}),
        ...(dto.vendor_id
          ? { Vendor: { connect: { id: dto.vendor_id } } }
          : {}),
        ...(dto.billing_type_id
          ? { BillingType: { connect: { id: dto.billing_type_id } } }
          : {}),
        ...(dto.category_id
          ? { Category: { connect: { id: dto.category_id } } }
          : {}),

        // scope on header
        owner_id: ownerId || userId,
        workspace: { connect: { id: workspaceId } },
        ...(userId ? { user: { connect: { id: userId } } } : {}),

        // nested
        purchaseItems: { create: lineCreates },
        due: grandTotal,
      };

      const purchase = await tx.purchase.create({
        data,
        include: {
          purchaseItems: true,
        },
      });

      return {
        ...purchase,
        _summary: {
          grand_total: Number(grandTotal.toFixed(2)),
          lines_count: lineCreates.length,
        },
      };
    });
  }

  // ------- LIST -------
  async findAll(ownerId: string, workspaceId: string, userId?: string) {
    const rows = await this.prisma.purchase.findMany({
      where: {
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        purchase_no: true,
        purchase_date: true,
        deleted_at: true,
        status: true,
        Vendor: { select: { name: true } }, // PascalCase
        AccountType: { select: { name: true } }, // PascalCase
        BillingType: { select: { name: true } }, // PascalCase
        Category: { select: { name: true } }, // PascalCase
      },
    });

    return rows.map((r) => ({
      id: r.id,
      purchase_no: r.purchase_no,
      vendor_name: r.Vendor?.name ?? null,
      account_type_name: r.AccountType?.name ?? null,
      billing_type_name: r.BillingType?.name ?? null,
      category_name: r.Category?.name ?? null,
      purchase_date: r.purchase_date ?? null,
      status: r.status,
    }));
  }

  // ------- SINGLE -------
  async findOne(
    id: string,
    ownerId: string,
    workspaceId: string,
    userId?: string,
  ) {
    const row = await this.prisma.purchase.findFirst({
      where: {
        id,
        deleted_at: null,
        owner_id: ownerId || userId,
        workspace: { id: workspaceId },
      },
      include: {
        purchaseItems: {
          where: { deleted_at: null },
        },
      },
    });

    if (!row) throw new NotFoundException('Purchase not found');

    // Calculate the updated summary
    const _summary = {
      total_quantity: row.purchaseItems.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
      total_rate: row.purchaseItems.reduce(
        (total, item) => total + item.purchase_price,
        0,
      ),
      total_discount: row.purchaseItems.reduce(
        (total, item) => total + item.discount,
        0,
      ),
      total_tax: row.purchaseItems.reduce(
        (total, item) =>
          total + (item.total - item.purchase_price - item.discount),
        0,
      ),
      total_price: row.purchaseItems.reduce(
        (total, item) => total + item.total,
        0,
      ),
    };

    return {
      ...row,
      _summary,
    };
  }

  // ------- UPDATE (header patch + replace lines if provided) -------
  async update(
    id: string,
    dto: UpdatePurchaseDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch the purchase with active purchaseItems (deleted_at = null)
      const existing = await tx.purchase.findFirst({
        where: {
          id,
          deleted_at: null,
          owner_id: ownerId,
          workspace: { id: workspaceId },
        },
        include: {
          purchaseItems: { where: { deleted_at: null } }, // Only show active items
        },
      });

      if (!existing) throw new NotFoundException('Purchase not found');

      const existingLineIds = new Set(existing.purchaseItems.map((l) => l.id));

      // 2️⃣ Update the purchase header (relations and fields)
      const headerData: any = {};
      const rel: [keyof UpdatePurchaseDto, string][] = [
        ['account_type_id', 'AccountType'],
        ['vendor_id', 'Vendor'],
        ['billing_type_id', 'BillingType'],
        ['category_id', 'Category'],
      ];

      for (const [field, relation] of rel) {
        if (dto[field] === undefined) continue;
        if (dto[field] === null) headerData[relation] = { disconnect: true };
        else headerData[relation] = { connect: { id: dto[field] as string } };
      }

      if (dto.purchase_date !== undefined) {
        headerData.purchase_date = dto.purchase_date
          ? new Date(dto.purchase_date)
          : null;
      }

      if (Object.keys(headerData).length) {
        await tx.purchase.update({
          where: { id },
          data: {
            ...headerData,
            owner_id: ownerId,
            workspace: { connect: { id: workspaceId } },
            ...(userId ? { user: { connect: { id: userId } } } : {}),
          },
        });
      }

      // 3️⃣ Soft-delete lines (set deleted_at) if requested
      if (dto.delete_line_ids?.length) {
        // validate ownership
        const invalid = dto.delete_line_ids.filter(
          (lid) => !existingLineIds.has(lid),
        );
        if (invalid.length) {
          throw new BadRequestException(
            `Some line_ids do not belong to this purchase: ${invalid.join(', ')}`,
          );
        }

        await tx.purchaseItems.updateMany({
          where: { id: { in: dto.delete_line_ids } },
          data: { deleted_at: new Date() },
        });
      }

      // 4️⃣ Create or update purchaseItems
      if (dto.items?.length) {
        const requestedItemIds = [...new Set(dto.items.map((i) => i.item_id))];

        // Preload base Items for reference
        const baseItems = await tx.items.findMany({
          where: {
            id: { in: requestedItemIds },
            owner_id: ownerId,
            workspace_id: workspaceId,
            deleted_at: null,
          },
        });
        const baseMap = new Map(baseItems.map((b) => [b.id, b]));

        const updatePromises: Promise<any>[] = [];
        const creates: any[] = [];

        for (const raw of dto.items) {
          const base = baseMap.get(raw.item_id);
          if (!base)
            throw new BadRequestException(`Item not found: ${raw.item_id}`);

          const lineData: any = {
            item: { connect: { id: raw.item_id } },
            name: raw.name ?? base.name,
            sku: raw.sku ?? base.sku,
            description: raw.description ?? base.description,
            quantity: raw.quantity ?? 1,
            unit_price: raw.unit_price ?? base.purchase_price ?? 0,
            purchase_price: raw.purchase_price ?? base.purchase_price ?? 0,
            discount: raw.discount ?? 0,
            total_price:
              (raw.quantity ?? 1) *
                // @ts-ignore
                (raw.unit_price ?? base.purchase_price ?? 0) -
              (raw.discount ?? 0),
            owner_id: ownerId,
            workspace: { connect: { id: workspaceId } },
            ...(userId ? { user: { connect: { id: userId } } } : {}),
          };

          if (raw.line_id) {
            if (!existingLineIds.has(raw.line_id)) {
              throw new BadRequestException(
                `line_id ${raw.line_id} does not belong to this purchase`,
              );
            }
            updatePromises.push(
              tx.purchaseItems.update({
                where: { id: raw.line_id },
                data: lineData,
              }),
            );
          } else {
            creates.push(lineData);
          }
        }

        if (updatePromises.length) await Promise.all(updatePromises);

        if (creates.length) {
          await tx.purchase.update({
            where: { id },
            data: { purchaseItems: { create: creates } },
          });
        }
      }

      // 5️⃣ Permanently delete previously soft-deleted purchaseItems
      await tx.purchaseItems.deleteMany({
        where: { purchase_id: id, deleted_at: { not: null } },
      });

      // 6️⃣ Return updated purchase with active items
      return tx.purchase.findFirst({
        where: { id },
        include: { purchaseItems: { where: { deleted_at: null } } },
      });
    });
  }

  // ------- Purchase send status -------
  async updateStatus(
    id: string,
    status: Status,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    // Find the purchase by ID and ensure it exists
    const purchase = await this.prisma.purchase.findUnique({
      where: {
        id,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Update only the status field
    const updatedPurchase = await this.prisma.purchase.update({
      where: { id },
      data: { status },
    });

    return updatedPurchase;
  }

  // ------- DELETE PURCHASE ITEMS -------
  async deletePurchaseItems(
    purchaseId: string,
    itemId: string,
    ownerId: string,
    workspaceId: string,
    userId?: string,
  ) {
    // Verify the purchase exists
    const purchase = await this.prisma.purchase.findUnique({
      where: {
        id: purchaseId,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
      },
    });

    if (!purchase) {
      throw new BadRequestException('Purchase not found');
    }

    // Fetch the items to see if they exist before updating
    const existingItems = await this.prisma.purchaseItems.findMany({
      where: {
        id: itemId,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
      },
    });

    console.log('Found items for update:', existingItems);

    if (existingItems.length === 0) {
      throw new BadRequestException('No matching purchase items found');
    }

    // Update only the deleted_at field with the current date
    const updatedItems = await this.prisma.purchaseItems.updateMany({
      where: {
        purchase_id: purchaseId,
        id: itemId,
        owner_id: ownerId,
        workspace_id: workspaceId,
      },
      data: { deleted_at: new Date() },
    });

    // Return the response with success message and updated data
    return {
      success: true,
      message: `Deleted ${updatedItems.count} purchase item(s) successfully.`,
      updatedFields: updatedItems,
    };
  }

  // ------- SOFT DELETE -------
  async softDelete(
    id: string,
    ownerId: string,
    workspaceId: string,
    userId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.purchase.findFirst({
        where: {
          id,
          deleted_at: null,
          owner_id: ownerId || userId,
          workspace: { id: workspaceId },
        },
        include: { purchaseItems: { select: { id: true } } },
      });
      if (!existing) throw new NotFoundException('Purchase not found');

      const now = new Date();

      await tx.purchase.update({
        where: { id },
        data: { deleted_at: now },
      });

      const ids = existing.purchaseItems.map((l) => l.id);
      if (ids.length) {
        await tx.purchaseItems.updateMany({
          where: { id: { in: ids } },
          data: { deleted_at: now },
        });
      }

      return { success: true };
    });
  }

  // ------- PURCHASE REPORT -------

  async getPurchaseReport(startDate: string, endDate: string, vendor: string, ownerId: string, workspaceId: string, userId: string) {
    const start = new Date(startDate).toISOString();
    const end = new Date(endDate).toISOString();

    const purchases = await this.prisma.purchase.findMany({
      where: {
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
        purchase_date: {
          gte: start,
          lte: end,
        },

        vendor_id: vendor !== 'all_vendor' ? vendor : undefined, 
        
      },
      select: {
        purchase_date: true,
        // due: true,
      },
    });
    const dailyReport = this.aggregateDailyReport(purchases);
    return dailyReport;
  }

  private aggregateDailyReport(purchases: any[]) {
    const dailyReport = {};

    purchases.forEach((purchase) => {
      const date = purchase.purchase_date.toISOString().split('T')[0];
      const dueAmount = typeof purchase.due === 'number' ? purchase.due : 0;

      if (!dailyReport[date]) {
        dailyReport[date] = 0;
      }

      dailyReport[date] += dueAmount;
    });

    return dailyReport;
  }
}
