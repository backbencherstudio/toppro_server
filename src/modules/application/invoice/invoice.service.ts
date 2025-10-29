// src/modules/application/invoice/invoice.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { UpdateInvoiceDto } from 'src/modules/application/invoice/dto/update-invoice.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  private async resolveLinesAndCompute(
    tx: Prisma.TransactionClient,
    items: Array<any>,
    ownerId: string,
    workspaceId: string,
    userId?: string,
    customerId?: string,
  ): Promise<{
    lineCreates: any[];
    grandTotal: number;
    subTotal: number; // done
    totalDiscount: number;
    totalTax: number;
  }> {
    if (!items?.length)
      return {
        lineCreates: [],
        grandTotal: 0,
        subTotal: 0,
        totalDiscount: 0,
        totalTax: 0,
      };

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
        itemType_id: true,
        sale_price: true,
        purchase_price: true,
      },
    });

    // console.log('baseItems', baseItems);

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

    let grandTotal = 0;
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    const lineCreates = [];

    for (const raw of items) {
      const base = baseMap.get(raw.item_id)!;

      const quantity = Number(raw.quantity ?? 1);
      let price = Number(raw.price ? raw.price : base.sale_price);
      if (price < 0) price = 0;

      const discount = Number(raw.discount ?? 0);
      const sale_price = Number(raw.sale_price ?? base.sale_price ?? 0);
      const purchase_price = Number(
        raw.purchase_price ?? base.purchase_price ?? 0,
      );

      const item_type_id = raw.item_type_id ?? base.itemType_id ?? null;
      const tax_id = raw.tax_id ?? base.tax_id ?? null;
      const itemCategoryId =
        raw.itemCategory_id ?? base.itemCategory_id ?? null;
      const unit_id = raw.unit_id ?? base.unit_id ?? null;

      const name = raw.name ?? base.name ?? null;
      const sku = raw.sku ?? base.sku ?? null;
      const description = raw.description ?? base.description ?? null;

      // If line_id exists, update the existing item
      if (raw.line_id) {
        await tx.invoiceItem.update({
          where: { id: raw.line_id },
          data: {
            quantity,
            price,
            discount,
            total: quantity * price - discount, // Recalculate total
            description,
            name,
            sku,
          },
        });
      } else {
        // If no line_id, create a new invoice item
        const newLine: any = {
          Item: { connect: { id: raw.item_id } },
          ItemType: { connect: { id: item_type_id } },
          quantity,
          price: raw.price ?? 0,
          Tax: { connect: { id: tax_id } },
          Unit: { connect: { id: unit_id } },
          discount,
          purchase_price,
          sale_price,
          description,
          name,
          sku,
          Customer: { connect: { id: customerId } },
          owner_id: ownerId || userId,
          Workspace: { connect: { id: workspaceId } },
          ...(userId ? { User: { connect: { id: userId } } } : {}),
        };

        // Only connect ItemCategory if it is not undefined
        if (itemCategoryId) {
          newLine.ItemCategory = { connect: { id: itemCategoryId } };
        }

        lineCreates.push(newLine);
      }

      const subtotal = quantity * price;
      const afterDiscount = subtotal - discount;
      const taxPct = Number(
        (await tx.tax.findUnique({ where: { id: tax_id } }))?.rate ?? 0,
      );
      const taxAmount = afterDiscount * (taxPct / 100);
      const total = afterDiscount + taxAmount;

      // Accumulate grand totals, subTotal, discount, and tax
      grandTotal += total;
      subTotal += subtotal;
      totalDiscount += discount;
      totalTax += taxAmount;

      // console.log(
      //   'calculation::>>',
      //   quantity,
      //   price,
      //   discount,
      //   subtotal,
      //   afterDiscount,
      //   taxPct,
      //   taxAmount,
      //   total,
      // );
    }

    return { lineCreates, grandTotal, subTotal, totalDiscount, totalTax };
  }

  // ------- CREATE -------
  async create(
    dto: CreateInvoiceDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    // if (!dto.items?.length) {
    //   throw new BadRequestException('At least one item is required');
    // }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const { lineCreates, grandTotal, subTotal, totalDiscount, totalTax } =
          await this.resolveLinesAndCompute(
            tx,
            dto.items,
            ownerId,
            workspaceId,
            userId,
            dto.customer_id,
            // dto.item_category_id
          );

        // console.log('dto.item_category_id:>>', dto.item_category_id);

        const data: any = {
          invoice_number: dto.invoice_number ? dto.invoice_number : undefined,
          issueAt: dto.issueAt ? new Date(dto.issueAt) : undefined,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
          Billing_category: { connect: { id: dto.billing_type_id } },
          Item_category: { connect: { id: dto.item_category_id } },
          Invoice_category: { connect: { id: dto.invoice_category_id } },
          // Account_type: { connect: { id: dto.account_type_id } },
          Customer: { connect: { id: dto.customer_id } },
          owner_id: ownerId || userId,
          Workspace: { connect: { id: workspaceId } },
          User: { connect: { id: userId } },
          InvoiceItem: {
            create: lineCreates,
          },
          totalPrice: grandTotal,
          subTotal: subTotal,
          totalDiscount: totalDiscount,
          totalTax: totalTax,
          due: grandTotal,
          paid: 0,
          status: 'DRAFT',
        };

        const invoice = await tx.invoice.create({
          data,
          include: {
            InvoiceItem: true,
          },
        });

        // Update stock quantity (-) mainus
        for (const item of invoice.InvoiceItem) {
          const stock = await tx.stock.findUnique({
            where: { item_id: item.item_id },
          });

          if (stock) {
            await tx.stock.update({
              where: { id: stock.id },
              data: {
                quantity: stock.quantity - item.quantity,
              },
            });

            await tx.invoiceItem.update({
              where: { id: item.id },
              data: {
                stock_id: stock.id,
              },
            });
          } else {
            throw new BadRequestException(
              'Stock not found for item: ' + item.item_id,
            );
          }
        }

        return {
          ...invoice,
          _summary: {
            grand_total: Number(grandTotal.toFixed(2)),
            lines_count: lineCreates.length,
          },
        };
      });

      return {
        success: true,
        message: 'Invoice created successfully',
        data: result,
      };
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async findAll(
    ownerId: string,
    workspaceId: string,
    userId: string,
    issueDate?: string,
    customer?: string,
    status?: string,
    accountType?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      // Build the filters
      const filters: any = {
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
        deleted_at: null,
      };

      if (issueDate) {
        filters.issueAt = new Date(issueDate);
      }

      if (customer) {
        filters.customer_id = customer;
      }

      if (status) {
        filters.status = status;
      }

      if (accountType) {
        filters.account_type_id = accountType;
      }

      // Fetch invoices with pagination and filters
      const invoices = await this.prisma.invoice.findMany({
        where: filters,
        include: {
          Account_type: {
            select: { name: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Count total records for pagination
      const totalRecords = await this.prisma.invoice.count({
        where: filters,
      });

      const formatted = invoices.map((invoice) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer: invoice.customer_id,
        item_category: invoice.item_category_id,
        issueAt: invoice.issueAt,
        dueAt: invoice.dueAt,
        account_type: invoice.Account_type?.name,
        account_type_id: invoice.account_type_id,
        billing_type_id: invoice.billing_type_id,
        invoice_category_id: invoice.invoice_category_id,
        totalPrice: invoice.totalPrice,
        paid: invoice.paid,
        due: invoice.due,
        status: invoice.status,
      }));

      return {
        success: true,
        message: 'Invoices fetched successfully',
        data: formatted,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRecords / limit),
          totalRecords,
        },
      };
    } catch (error) {
      return handlePrismaError(error);
    }
  }
  async findAllPaidInvoices(
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try {
      // Fetch invoices with pagination and filters
      const invoices = await this.prisma.invoice.findMany({
        where: {
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
          status: 'PAID',
          deleted_at: null,
        },
      });

      const formatted = invoices.map((invoice) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer: invoice.customer_id,
        issueAt: invoice.issueAt,
        dueAt: invoice.dueAt,
        totalPrice: invoice.totalPrice,
        paid: invoice.paid,
        due: invoice.due,
        status: invoice.status,
      }));

      return {
        success: true,
        message: 'All Paid Invoices fetched successfully',
        data: formatted,
      };
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  // ------- FIND ONE -------
  async findOne(
    invoiceId: string,
    ownerId: string,
    workspaceId: string,
    userId?: string,
  ) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
        deleted_at: null,
      },
      include: {
        InvoiceItem: {
          include: {
            // Account_type: { select: { id: true, name: true } },
            Tax: { select: { name: true, rate: true } },
            ItemType: { select: { name: true } },
          },
        },
        Account_type: { select: { name: true } },
        Customer: {
          select: {
            name: true,
            email: true,
            taxNumber: true,
            contact: true,
            billingName: true,
            billingPhone: true,
            billingAddress: true,
            billingCity: true,
            billingState: true,
            billingCountry: true,
            billingZip: true,
            shippingName: true,
            shippingPhone: true,
            shippingAddress: true,
            shippingCity: true,
            shippingState: true,
            shippingCountry: true,
            shippingZip: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // --- Totals ---
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let grandTotal = 0;

    const items = [];

    for (const [index, item] of invoice.InvoiceItem.entries()) {
      const quantity = item.quantity ?? 0;
      const rate = item.price ?? 0;
      const discount = item.discount ?? 0;

      const subtotal = quantity * rate;
      const afterDiscount = subtotal - discount;

      const taxRate = item.Tax?.rate ?? 0;
      const taxAmount = afterDiscount * (taxRate / 100);

      const total = afterDiscount + taxAmount;

      subTotal += subtotal;
      totalDiscount += discount;
      totalTax += taxAmount;
      grandTotal += total;

      items.push({
        id: item.id,
        no: index + 1,
        itemType: item.ItemType?.name ?? null,
        itemType_id: item.item_type_id,
        item: item.name,
        quantity,
        rate,
        discount,
        taxAmount: Number(taxAmount.toFixed(2)),
        description: item.description,
        price: Number(total.toFixed(2)), // after discount + tax
      });
    }

    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      issueAt: invoice.issueAt,
      dueAt: invoice.dueAt,
      status: invoice.status,
      account_type: invoice.Account_type?.name,
      account_type_id: invoice.account_type_id,
      customer_id: invoice.customer_id,
      billing_type_id: invoice.billing_type_id,
      invoice_category_id: invoice.invoice_category_id,
      item_category_id: invoice.item_category_id,
      invoice_category: invoice.invoice_category_id,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,

      billedTo: {
        name: invoice.Customer?.billingName ?? invoice.Customer?.name,
        phone: invoice.Customer?.billingPhone ?? invoice.Customer?.contact,
        address: invoice.Customer?.billingAddress,
        city: invoice.Customer?.billingCity,
        state: invoice.Customer?.billingState,
        country: invoice.Customer?.billingCountry,
        zip: invoice.Customer?.billingZip,
        taxNumber: invoice.Customer?.taxNumber,
      },

      shippedTo: {
        name: invoice.Customer?.shippingName ?? invoice.Customer?.name,
        phone: invoice.Customer?.shippingPhone ?? invoice.Customer?.contact,
        address: invoice.Customer?.shippingAddress,
        city: invoice.Customer?.shippingCity,
        state: invoice.Customer?.shippingState,
        country: invoice.Customer?.shippingCountry,
        zip: invoice.Customer?.shippingZip,
        taxNumber: invoice.Customer?.taxNumber,
      },

      items,
      summary: {
        subTotal: Number(subTotal.toFixed(2)),
        totalDiscount: Number(totalDiscount.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
        paid: invoice.paid,
        due: invoice.due,
      },
    };
  }

  // --------- UPDATE ------------

  async update(
    id: string,
    dto: UpdateInvoiceDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch the invoice with active invoiceItems (deleted_at = null)
      const existing = await tx.invoice.findFirst({
        where: {
          id,
          deleted_at: null,
          owner_id: ownerId || userId,
          Workspace: { id: workspaceId },
        },
        include: {
          InvoiceItem: { where: { deleted_at: null } },
        },
      });

      if (!existing) throw new NotFoundException('Invoice not found');

      const existingLineIds = new Set(existing.InvoiceItem.map((l) => l.id));

      // 2️⃣ Update the invoice header (relations and fields)
      const headerData: any = {};
      const rel: [keyof UpdateInvoiceDto, string][] = [
        ['account_type_id', 'Account_type'],
        ['customer_id', 'Customer'],
        ['billing_type_id', 'Billing_category'],
        ['invoice_category_id', 'Invoice_category'],
        ['item_category_id', 'Item_category'],
        ['status', 'InvoiceStatus'],
      ];

      for (const [field, relation] of rel) {
        if (dto[field] === undefined) continue;
        if (dto[field] === null) headerData[relation] = { disconnect: true };
        else headerData[relation] = { connect: { id: dto[field] as string } };
      }

      if (dto.issueAt !== undefined) {
        headerData.issueAt = dto.issueAt ? new Date(dto.issueAt) : null;
      }

      if (dto.dueAt !== undefined) {
        headerData.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
      }

      if (Object.keys(headerData).length) {
        await tx.invoice.update({
          where: { id },
          data: {
            ...headerData,
            owner_id: ownerId || userId,
            Workspace: { connect: { id: workspaceId } },
            ...(userId ? { User: { connect: { id: userId } } } : {}),
          },
        });
      }

      // 3️⃣ Soft-delete lines (set deleted_at) if requested
      if (dto.delete_line_ids?.length) {
        const invalid = dto.delete_line_ids.filter(
          (lid) => !existingLineIds.has(lid),
        );
        if (invalid.length) {
          throw new BadRequestException(
            `Some line_ids do not belong to this invoice: ${invalid.join(', ')}`,
          );
        }

        // Decrease stock for the deleted invoice items
        for (const lineId of dto.delete_line_ids) {
          const itemToDelete = existing.InvoiceItem.find(
            (item) => item.id === lineId,
          );
          if (itemToDelete) {
            const stock = await tx.stock.findUnique({
              where: { item_id: itemToDelete.item_id },
            });
            if (stock) {
              await tx.stock.update({
                where: { id: stock.id },
                data: {
                  quantity: stock.quantity + itemToDelete.quantity, // Revert the quantity
                },
              });
            }
          }
        }

        // Mark invoice items as deleted
        await tx.invoiceItem.updateMany({
          where: { id: { in: dto.delete_line_ids } },
          data: { deleted_at: new Date() },
        });
      }

      // 4️⃣ Create or update invoiceItems using resolveLinesAndCompute
      const { lineCreates, grandTotal } = await this.resolveLinesAndCompute(
        tx,
        dto.items ?? [],
        ownerId,
        workspaceId,
        userId,
        dto.customer_id,
      );

      // 5️⃣ Permanently delete previously soft-deleted invoiceItems
      await tx.invoiceItem.deleteMany({
        where: { invoice_id: id, deleted_at: { not: null } },
      });

      // 6️⃣ Update stock for new or updated invoice items
      for (const line of lineCreates) {
        const stock = await tx.stock.findUnique({
          where: { item_id: line.Item.connect.id },
        });
        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantity: stock.quantity - line.quantity, // Deduct the quantity
            },
          });
        }
      }

      // 7️⃣ Return success message
      return {
        success: true,
        message: 'Invoice updated successfully',
      };
    });
  }

  // Helper method to resolve lines and compute total

  async updateStatus(
    id: string,
    status: Status,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      // Only allow valid transitions
      if (invoice.status === 'PAID') {
        throw new BadRequestException('Invoice already paid');
      }

      if (invoice.status === 'SENT' && status !== 'PAID') {
        throw new BadRequestException(
          'Cannot change SENT invoice to this status',
        );
      }

      if (invoice.status === 'DRAFT' && status !== 'SENT') {
        throw new BadRequestException('Draft invoice can only be sent');
      }

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id },
        data: { status },
      });

      return {
        success: true,
        message: `Invoice status updated to ${status}`,
        data: updatedInvoice,
      };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        return {
          success: false,
          message: error.message,
          error: error.getStatus ? error.getStatus() : 'Bad Request',
          statusCode: error.getStatus ? error.getStatus() : 400,
        };
      }
      return {
        success: false,
        message: error.message || 'Internal Server Error',
        error: error.name || 'InternalServerError',
        statusCode: 500,
      };
    }
  }

  async deleteInvoiceItems(
    invoiceId: string,
    itemId: string,
    ownerId: string,
    workspaceId: string,
    userId?: string,
  ) {
    // Verify the invoice exists
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id: invoiceId, // Ensure you are using the `id` field here
      },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    // Fetch the items to see if they exist before updating
    const existingItems = await this.prisma.invoiceItem.findMany({
      where: {
        id: itemId,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
      },
    });

    if (existingItems.length === 0) {
      throw new BadRequestException('No matching invoice items found');
    }

    // Get the quantity of the item being deleted
    const itemToDelete = existingItems[0];
    const quantityToDelete = itemToDelete.quantity;

    // Update only the deleted_at field with the current date
    const updatedItems = await this.prisma.invoiceItem.updateMany({
      where: {
        id: itemId,
        owner_id: ownerId,
        workspace_id: workspaceId,
      },
      data: { deleted_at: new Date() },
    });

    // Update stock: Increase the quantity by the quantity of the deleted item
    const stock = await this.prisma.stock.findUnique({
      where: { item_id: itemToDelete.item_id },
    });

    if (stock) {
      // Increase the stock quantity by the quantity of the deleted invoice item
      await this.prisma.stock.update({
        where: { id: stock.id },
        data: {
          quantity: stock.quantity + quantityToDelete,
        },
      });
    } else {
      throw new BadRequestException('Stock not found for this item');
    }

    // Return the response with success message and updated data
    return {
      success: true,
      message: `Deleted ${updatedItems.count} invoice item(s) successfully and updated stock quantity.`,
      updatedFields: updatedItems,
    };
  }

  async softDelete(
    id: string,
    ownerId: string,
    workspaceId: string,
    userId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1️ Fetch the invoice with its active invoiceItems (deleted_at = null)
      const existing = await tx.invoice.findFirst({
        where: {
          id,
          deleted_at: null,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
        },
        include: {
          InvoiceItem: {
            select: { id: true, item_id: true, quantity: true }, // Including item_id and quantity for stock update
          },
        },
      });

      if (!existing) throw new NotFoundException('Invoice not found');

      const now = new Date();

      // 2️⃣ Mark the invoice as deleted
      await tx.invoice.update({
        where: { id },
        data: { deleted_at: now },
      });

      // 3️⃣ Process each invoice item and update stock quantity
      for (const invoiceItem of existing.InvoiceItem) {
        // Fetch the stock related to the item
        const stock = await tx.stock.findUnique({
          where: { item_id: invoiceItem.item_id },
        });

        if (stock) {
          // Increase the stock quantity by the quantity of the deleted invoice item
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantity: stock.quantity + invoiceItem.quantity, // Adding back the quantity
            },
          });
        } else {
          throw new BadRequestException('Stock not found for this item');
        }

        // Mark the invoice item as deleted
        await tx.invoiceItem.updateMany({
          where: { id: invoiceItem.id },
          data: { deleted_at: now },
        });
      }

      return {
        success: true,
        message:
          'Invoice and associated items have been soft deleted and stock updated.',
      };
    });
  }

  async hardDelete(id: string) {
    try {
      // Permanently delete the invoice
      const deleted = await this.prisma.invoice.delete({
        where: {
          id,
        },
      });

      return {
        success: true,
        message: 'Invoice permanently deleted',
        data: deleted,
      };
    } catch (error) {
      return handlePrismaError(error);
    }
  }
}
