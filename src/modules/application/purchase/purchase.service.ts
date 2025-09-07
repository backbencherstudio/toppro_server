import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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
        workspace: { id: workspaceId }, // relation scope
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
        purchase_price: true, // if exists on Items
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
    const resolved = items.map((raw) => {
      const base = baseMap.get(raw.item_id)!;

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
    });

    // 3) Fetch tax percents (by resolved tax_id)
    const taxIds = [
      ...new Set(resolved.map((r) => r.tax_id).filter(Boolean)),
    ] as string[];
    const taxPct = new Map<string, number>();
    if (taxIds.length) {
      const taxes = await tx.tax.findMany({
        where: { id: { in: taxIds } },
        select: { id: true, rate: true }, // adjust if your Tax uses another field
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

        // scalars on lines
        quantity: r.quantity,
        purchase_price: r.price,
        discount: r.discount,
        total: total,
        description: r.description ?? undefined,

        // optional snapshots (display)
        name: r.name ?? undefined,
        sku: r.sku ?? undefined,

        // keep your legacy numeric columns in sync
        unit_price: r.price,
        total_price: total,

        // scope on line — workspace & user as relations, owner_id as scalar
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

        // optional: header Items? relation (use itemsId, not item_id)
        ...(dto.item_id ? { Items: { connect: { id: dto.item_id } } } : {}),

        // scope on header
        owner_id: ownerId || userId,
        workspace: { connect: { id: workspaceId } },
        ...(userId ? { user: { connect: { id: userId } } } : {}),

        // nested
        purchaseItems: { create: lineCreates },
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
    return row;
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
      // 1) scope + existence check
      const existing = await tx.purchase.findFirst({
        where: {
          id,
          deleted_at: null,
          owner_id: ownerId,
          workspace: { id: workspaceId },
        },
        include: {
          purchaseItems: { where: { deleted_at: null }, select: { id: true } },
        },
      });
      if (!existing) throw new NotFoundException('Purchase not found');

      const existingLineIds = new Set(existing.purchaseItems.map((l) => l.id));

      // 2) header patches (relations connect/disconnect)
      const headerData: any = {};
      const rel = [
        ['account_type_id', 'AccountType'],
        ['vendor_id', 'Vendor'],
        ['billing_type_id', 'BillingType'],
        ['category_id', 'Category'],
      ] as const;

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

      // 3) DELETE specific lines (soft-delete), if requested
      if (dto.delete_line_ids?.length) {
        // guard: cannot both delete & update same line
        if (
          dto.items?.some(
            (it) => it.line_id && dto.delete_line_ids!.includes(it.line_id),
          )
        ) {
          throw new BadRequestException(
            'Same line_id cannot be in both items and delete_line_ids.',
          );
        }
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

      // 4) EDIT or ADD lines (merge-style)
      if (dto.items?.length) {
        // Preload base Items (for fallback snapshot + price)
        const requestedItemIds = [...new Set(dto.items.map((i) => i.item_id))];
        const baseItems = await tx.items.findMany({
          where: {
            id: { in: requestedItemIds },
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
        const baseMap = new Map(baseItems.map((b) => [b.id, b]));
        const missing = requestedItemIds.filter((i) => !baseMap.has(i));
        if (missing.length) {
          throw new BadRequestException({
            code: 'ITEM_NOT_FOUND_IN_SCOPE',
            missingIds: missing,
          });
        }

        // tax percents (resolved)
        const resolvedTaxIds = [
          ...new Set(
            dto.items
              .map((r) => r.tax_id ?? baseMap.get(r.item_id)?.tax_id)
              .filter(Boolean),
          ),
        ] as string[];
        const taxPct = new Map<string, number>();
        if (resolvedTaxIds.length) {
          const taxes = await tx.tax.findMany({
            where: { id: { in: resolvedTaxIds } },
            select: { id: true, rate: true },
          });
          taxes.forEach((t) => taxPct.set(t.id, Number(t.rate ?? 0)));
        }

        const updatePromises: Promise<any>[] = [];
        const creates: any[] = [];

        for (const raw of dto.items) {
          const base = baseMap.get(raw.item_id)!;

          // resolve values
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

          // totals
          const pct = tax_id ? Number(taxPct.get(tax_id) ?? 0) : 0;
          const subtotal = quantity * price;
          const afterDiscount = subtotal - discount;
          const taxAmount = afterDiscount * (pct / 100);
          const total = afterDiscount + taxAmount;

          const lineData: any = {
            // numbers
            quantity,
            purchase_price: price,
            discount,
            total,
            unit_price: price,
            total_price: total,

            // snapshots
            name: name ?? undefined,
            sku: sku ?? undefined,
            description: description ?? undefined,

            // relations
            item: { connect: { id: raw.item_id } },
            ...(item_type_id
              ? { itemType: { connect: { id: item_type_id } } }
              : { itemType: { disconnect: true } }),
            ...(tax_id
              ? { tax: { connect: { id: tax_id } } }
              : { tax: { disconnect: true } }),
            ...(itemCategoryId
              ? { itemCategory: { connect: { id: itemCategoryId } } }
              : {}),
            ...(unit_id ? { unit: { connect: { id: unit_id } } } : {}),

            // scope
            owner_id: ownerId,
            workspace: { connect: { id: workspaceId } },
            ...(userId ? { user: { connect: { id: userId } } } : {}),
          };

          if (raw.line_id) {
            // validate belongs-to
            if (!existingLineIds.has(raw.line_id)) {
              throw new BadRequestException(
                `line_id ${raw.line_id} does not belong to this purchase`,
              );
            }
            // update in-place
            updatePromises.push(
              tx.purchaseItems.update({
                where: { id: raw.line_id },
                data: lineData,
              }),
            );
          } else {
            // create new line, do not delete any existing
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

      // 5) return fresh snapshot
      return tx.purchase.findFirst({
        where: { id },
        include: {
          AccountType: true,
          Vendor: true,
          BillingType: true,
          Category: true,
          purchaseItems: { where: { deleted_at: null } },
        },
      });
    });
  }

  // ------- DELETE PURCHASE ITEMS -------
  async deletePurchaseItems(purchaseId: string) {
    // Verify the purchase exists
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new BadRequestException('Purchase not found');
    }

    // Delete all related PurchaseItems
    const deletedCount = await this.prisma.purchaseItems.deleteMany({
      where: { purchase_id: purchaseId },
    });

    return {
      success: true,
      message: `Deleted ${deletedCount.count} purchase item(s) successfully.`,
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

  
}
