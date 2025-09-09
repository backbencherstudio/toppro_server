// src/modules/application/invoice/invoice.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  // Helper function to calculate totals and resolve line items
  private async resolveLinesAndCompute(
    tx: Prisma.TransactionClient,
    items: Array<any>,
    ownerId: string,
    workspaceId: string,
    userId?: string,
  ): Promise<{ lineCreates: any[]; grandTotal: number }> {
    if (!items?.length) return { lineCreates: [], grandTotal: 0 };

    const requestedIds = [...new Set(items.map((i) => i.item_id))];

    const baseItems = await tx.items.findMany({
      where: {
        id: { in: requestedIds },
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
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
        customer: true,  // Select the customer relation instead of customer_id
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
        message: 'Some items are not found in this workspace/owner scope or are deleted.',
        missingIds: missing,
      });
    }

    const baseMap = new Map(baseItems.map((b) => [b.id, b]));

    const resolved = await Promise.all(
      items.map(async (raw) => {
        const base = baseMap.get(raw.item_id)!;
        console.log('base', base);

        const quantity = Number(raw.quantity ?? 1);
        const price = Number(raw.purchase_price ?? base.purchase_price ?? base.sale_price ?? 0);
        const discount = Number(raw.discount ?? 0);
        // const customer_id = raw.customer_id ?? base.customer?.id ?? null; // Access the customer relation correctly

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
          // customer_id,  // Ensure customer_id is captured correctly
          unit_id,
          name,
          sku,
          description,
        };
      }),
    );

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

    let grandTotal = 0;
    const lineCreates = resolved.map((r) => {
      const subtotal = r.quantity * r.price;
      const afterDiscount = subtotal - r.discount;
      const pct = r.tax_id ? Number(taxPct.get(r.tax_id) ?? 0) : 0;
      const taxAmount = afterDiscount * (pct / 100);
      const total = afterDiscount + taxAmount;

      grandTotal += total;

      return {
        Item: { connect: { id: r.item_id } }, // Corrected to `Item`
        ItemType: { connect: { id: r.item_type_id } }, // Corrected to `ItemType`
        Tax: { connect: { id: r.tax_id } }, // Corrected to `Tax`
        ItemCategory: { connect: { id: r.itemCategoryId } }, // Corrected to `ItemCategory`
        Unit: { connect: { id: r.unit_id } }, // Corrected to `Unit`
        quantity: r.quantity,
        purchase_price: r.price,
        discount: r.discount,
        total,
        description: r.description ?? undefined,
        name: r.name ?? undefined,
        sku: r.sku ?? undefined,
        // sale_price: r.sale_price ?? undefined,
        // Customer: { connect: { id: r.customer_id } },
        price: r.price ?? undefined,
        owner_id: ownerId || userId,
        Workspace: { connect: { id: workspaceId } },
        ...(userId ? { User: { connect: { id: userId } } } : {}),
      };
    });

    return { lineCreates, grandTotal };
  }

  // Function to create an invoice
  async create(
    dto: CreateInvoiceDto,
    ownerId: string,
    workspaceId: string,
    userId: string
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
        userId
      );

      const invoiceNo = await this.nextInvoiceNo(tx, workspaceId);

      const data: any = {
        invoice_number: dto.invoice_number ? dto.invoice_number : invoiceNo,
        issueAt: dto.issueAt ? new Date(dto.issueAt) : undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        owner_id: ownerId || userId,
        Workspace: { connect: { id: workspaceId } },
        User: { connect: { id: userId } },
        InvoiceItem: {
          create: lineCreates,
        },
        totalPrice: grandTotal,
        subTotal: grandTotal,
        totalDiscount: 0,
        totalTax: 0,
        status: 'DRAFT',
      };

      const invoice = await tx.invoice.create({
        data,
        include: {
          InvoiceItem: true,
        },
      });

      return {
        ...invoice,
        _summary: {
          grand_total: Number(grandTotal.toFixed(2)),
          lines_count: lineCreates.length,
        },
      };
    });
  }

  // Helper method to generate the next invoice number
  private async nextInvoiceNo(
    tx: Prisma.TransactionClient,
    workspaceId: string,
  ): Promise<string> {
    const lastInvoice = await tx.invoice.findFirst({
      where: { workspace_id: workspaceId },
      orderBy: { createdAt: 'desc' },
      select: { invoice_number: true },
    });
    const nextNumber = lastInvoice
      ? parseInt(lastInvoice.invoice_number) + 1
      : 1;
    return nextNumber.toString();
  }
}
