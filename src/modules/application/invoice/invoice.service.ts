import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateInvoiceDto } from 'src/modules/application/invoice/dto/create-invoice.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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

    // 1) Load base items inside scope
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
        message: 'Some items are not found in this workspace/owner scope or are deleted.',
        missingIds: missing,
      });
    }

    const baseMap = new Map(baseItems.map((b) => [b.id, b]));

    // 2) Resolve nulls from base snapshot
    const resolved = await Promise.all(
      items.map(async (raw) => {
        const base = baseMap.get(raw.item_id)!;

        const quantity = Number(raw.quantity ?? 1);
        const price = Number(
          raw.purchase_price ?? base.purchase_price ?? base.sale_price ?? 0,
        );
        const discount = Number(raw.discount ?? 0);

        const item_type_id = raw.item_type_id ?? base.itemType_id ?? null;
        const tax_id = raw.tax_id ?? base.tax_id ?? null;
        const itemCategoryId = raw.itemCategory_id ?? base.itemCategory_id ?? null;
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

    // 3) Fetch tax percentages (by resolved tax_id)
    const taxIds = [...new Set(resolved.map((r) => r.tax_id).filter(Boolean))] as string[];
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

      return {
        item: { connect: { id: r.item_id } },
        ...(r.item_type_id ? { itemType: { connect: { id: r.item_type_id } } } : {}),
        ...(r.tax_id ? { tax: { connect: { id: r.tax_id } } } : {}),
        ...(r.itemCategoryId ? { itemCategory: { connect: { id: r.itemCategoryId } } } : {}),
        ...(r.unit_id ? { unit: { connect: { id: r.unit_id } } } : {}),
        quantity: r.quantity,
        purchase_price: r.price,
        discount: r.discount,
        total,
        description: r.description ?? undefined,
        name: r.name ?? undefined,
        sku: r.sku ?? undefined,
        unit_price: r.price,
        total_price: total,
        owner_id: ownerId,
        workspace: { connect: { id: workspaceId } },
        ...(userId ? { user: { connect: { id: userId } } } : {}),
      };
    });

    return { lineCreates, grandTotal };
  }

  // Function to create an invoice
  async create(
    dto: CreateInvoiceDto, // Input data for creating invoice
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

      const invoiceNo = await this.nextInvoiceNo(tx, workspaceId);

      const data: any = {
        invoice_number: invoiceNo,
        issueAt: dto.issueAt ? new Date(dto.issueAt) : undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        // Relations
        ...(dto.account_type_id
          ? { AccountType: { connect: { id: dto.account_type_id } } }
          : {}),
        ...(dto.customer_id
          ? { Customer: { connect: { id: dto.customer_id } } }
          : {}),
        ...(dto.billing_type_id
          ? { BillingCategory: { connect: { id: dto.billing_type_id } } }
          : {}),
        ...(dto.invoice_category_id
          ? { InvoiceCategory: { connect: { id: dto.invoice_category_id } } }
          : {}),

        owner_id: ownerId || userId,
        workspace: { connect: { id: workspaceId } },
        ...(userId ? { user: { connect: { id: userId } } } : {}),
        InvoiceItem: { create: lineCreates }, // Adjusted to match your model's relation
        totalPrice: grandTotal,
        subTotal: grandTotal,
        totalDiscount: 0, // Adjust based on your logic
        totalTax: 0, // Adjust based on your logic
        status: 'PENDING',
      };

      const invoice = await tx.invoice.create({
        data,
        include: {
          InvoiceItem: true, // Adjusted to the correct relation name
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
  private async nextInvoiceNo(tx: Prisma.TransactionClient, workspaceId: string): Promise<string> {
    const lastInvoice = await tx.invoice.findFirst({
      where: { workspace_id: workspaceId },
      orderBy: { createdAt: 'desc' }, // Adjusted field name for created_at
      select: { invoice_number: true }, // Corrected the field name here
    });

    const nextNumber = lastInvoice ? parseInt(lastInvoice.invoice_number) + 1 : 1;
    return nextNumber.toString();
  }
}
