import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateBillDto } from 'src/modules/application/accounting/bill/dto/update-bill.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBillDto } from './dto/create-bill.dto';

@Injectable()
export class BillService {
  constructor(private prisma: PrismaService) {}

  private async resolveBillItemsAndCompute(
    tx: Prisma.TransactionClient,
    items: Array<any>,
    ownerId: string,
    workspaceId: string,
    userId?: string,
    vendorId?: string,
  ): Promise<{
    billItemCreates: any[];
    grandTotal: number;
    subTotal: number;
    totalDiscount: number;
    totalTax: number;
  }> {
    if (!items?.length) {
      return {
        billItemCreates: [],
        grandTotal: 0,
        subTotal: 0,
        totalDiscount: 0,
        totalTax: 0,
      };
    }

    const requestedIds = [...new Set(items.map((i) => i.item_id))];

    const baseItems = await tx.items.findMany({
      where: {
        id: { in: requestedIds },
        owner_id: ownerId || userId,
        user_id: userId || ownerId,
        workspace_id: workspaceId,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        unit_id: true,
        tax_id: true,
        itemCategory_id: true,
        sale_price: true,
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

    let grandTotal = 0;
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    const billItemCreates = [];

    for (const raw of items) {
      const base = baseMap.get(raw.item_id)!;

      const quantity = Number(raw.quantity ?? 1);
      let price = Number(raw.price ?? base.sale_price);
      if (price < 0) price = 0;

      const discount = Number(raw.discount ?? 0);
      const taxId = raw.tax_id ?? base.tax_id; // Fallback to the item's tax_id if not provided
      const description = raw.description ?? base.description;
      const unitId = raw.unit_id ?? base.unit_id;

      // Handle subtotal and discount
      const subtotal = quantity * price;
      const afterDiscount = subtotal - discount;

      // Look up tax percentage if taxId is present
      const taxPct = taxId
        ? Number((await tx.tax.findUnique({ where: { id: taxId } }))?.rate ?? 0)
        : 0;
      const taxAmount = afterDiscount * (taxPct / 100);
      const total = afterDiscount + taxAmount;

      // Accumulate totals
      grandTotal += total;
      subTotal += subtotal;
      totalDiscount += discount;
      totalTax += taxAmount;

      // Create BillItem entries
      billItemCreates.push({
        item_id: raw.item_id,
        quantity,
        price,
        discount,
        total_price: total,
        description,
        tax_id: taxId,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
        ...(vendorId ? { Vendor: { connect: { id: vendorId } } } : {}),
      });
    }

    return {
      billItemCreates,
      grandTotal,
      subTotal,
      totalDiscount,
      totalTax,
    };
  }

  async createBill(
    dto: CreateBillDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
    vendorId: string,
  ) {
    console.log('CreateBillDto received:', dto);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Resolving BillItems and calculating totals
        const {
          billItemCreates,
          grandTotal,
          subTotal,
          totalDiscount,
          totalTax,
        } = await this.resolveBillItemsAndCompute(
          tx,
          dto.billItems,
          ownerId,
          workspaceId,
          userId,
          vendorId,
        );

        // Creating the Bill record
        const bill = await tx.bill.create({
          data: {
            bill_no: dto.bill_no,
            issued_at: dto.issued_at ? new Date(dto.issued_at) : undefined,
            due_at: dto.due_at ? new Date(dto.due_at) : undefined,
            vendor_id: vendorId,
            workspace_id: workspaceId,
            user_id: userId,
            subTotal,
            total: grandTotal,
            paid: 0,
            due: grandTotal,
            status: 'DRAFT', // You can change the default status if needed

            owner_id: ownerId,
            billItems: {
              create: billItemCreates,
            },
          },
          include: {
            billItems: true,
          },
        });

        // Handle stock updates if needed
        for (const item of bill.billItems) {
          const stock = await tx.stock.findUnique({
            where: { item_id: item.item_id },
          });
          if (stock) {
            await tx.stock.update({
              where: { id: stock.id },
              data: { quantity: stock.quantity - item.quantity },
            });
          }
        }

        return {
          ...bill,
          _summary: {
            grand_total: Number(grandTotal.toFixed(2)),
            lines_count: billItemCreates.length,
          },
        };
      });

      return {
        success: true,
        message: 'Bill created successfully',
        data: result,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to create bill');
    }
  }

  //update bill
  async updateBill(
    id: string,
    dto: UpdateBillDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: { expensePayments: true, billItems: true }, // Include existing items and payments
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Resolving BillItems and recalculating totals
        const {
          billItemCreates,
          grandTotal,
          subTotal,
          totalDiscount,
          totalTax,
        } = await this.resolveBillItemsAndCompute(
          tx,
          dto.billItems,
          ownerId,
          workspaceId,
          userId,
          bill.vendor_id,
        );

        const paid = bill.expensePayments.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        );
        const due = grandTotal - paid;

        // Determine the status based on paid and due amounts
        const status =
          paid >= grandTotal ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'DRAFT';

        // Update Bill and BillItems in the transaction
        const updatedBill = await tx.bill.update({
          where: { id },
          data: {
            issued_at: dto.issued_at ? new Date(dto.issued_at) : undefined,
            due_at: dto.due_at ? new Date(dto.due_at) : undefined,
            bill_no: dto.bill_no,
            vendor_id: bill.vendor_id, // Keeping the existing vendor_id
            workspace_id: workspaceId,
            user_id: userId,
            subTotal,
            total: grandTotal,
            paid,
            due,
            status,
            owner_id: ownerId,
            billItems: {
              deleteMany: {}, // Remove all existing BillItems
              create: billItemCreates, // Add the updated BillItems
            },
          },
          include: {
            billItems: true,
          },
        });

        // Handle stock updates (optional)
        for (const item of updatedBill.billItems) {
          const stock = await tx.stock.findUnique({
            where: { item_id: item.item_id },
          });
          if (stock) {
            await tx.stock.update({
              where: { id: stock.id },
              data: { quantity: stock.quantity - item.quantity },
            });
          }
        }

        return updatedBill;
      });

      return {
        success: true,
        message: 'Bill updated successfully',
        data: result,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to update bill');
    }
  }

  // Get all bills
async findAll(
  ownerId: string,
  workspaceId: string,
  userId: string,
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string,
  vendorId?: string,
) {
  try {
    const skip = (page - 1) * limit;

    // Base where condition
    const where: any = {
      OR: [
        { owner_id: ownerId },
        { owner_id: userId },
        { user_id: userId },
        { user_id: ownerId },
      ],
      workspace_id: workspaceId,
    };

    // Date filter
    if (startDate || endDate) {
      where.created_at = {};

      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate);
      }
    }

    // Vendor filter (all_vendor হলে vendor filter লাগবে না)
    if (vendorId && vendorId !== 'all_vendor') {
      where.vendor_id = vendorId;
    }

    // Count total
    const totalCount = await this.prisma.bill.count({
      where,
    });

    // Fetch bills
    const bills = await this.prisma.bill.findMany({
      where,
      include: {
        billItems: true,
        vendor: true,
      },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    // No bills found
    if (!bills.length) {
      return {
        success: false,
        message: 'No bills found',
        pagination: {
          totalCount,
          totalPages: 0,
          currentPage: page,
          limit,
          hasNextPage: false,
          hasPrevPage: page > 1,
        },
        data: [],
      };
    }

    // Filtered response formatting
    const filteredBills = bills.map((bill) => ({
      id: bill.id,
      created_at: bill.created_at,
      updated_at: bill.updated_at,
      deleted_at: bill.deleted_at,
      issued_at: bill.issued_at,
      due_at: bill.due_at,
      bill_no: bill.bill_no,
      subTotal: bill.subTotal,
      total: bill.total,
      paid: bill.paid,
      due: bill.due,
      vendor_id: bill.vendor_id,
      vendor_name: bill.vendor?.name ?? null,
      status: bill.status,
    }));

    return {
      success: true,
      message: 'Bills retrieved successfully',
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
      data: filteredBills,
    };
  } catch (error) {
    console.log(error);
    throw new BadRequestException('Failed to retrieve bills');
  }
}




  // Get a single bill by ID
  async findOne(id: string) {
    try {
      // Attempt to fetch the bill from the database
      const bill = await this.prisma.bill.findUnique({
        where: { id },
        include: {
          billItems: true, // Include associated BillItems
        },
      });

      // If the bill is not found, throw a NotFoundException
      if (!bill) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }

      // Return the found bill
      return {
        success: true,
        message: 'Bill retrieved successfully',
        data: bill,
      };
    } catch (error) {
      // Log the error to help with debugging (optional)
      console.error(error);

      // Check for specific errors and rethrow or provide more detailed responses
      if (error instanceof NotFoundException) {
        throw error; // If it's a NotFoundException, just rethrow it
      } else {
        // For other errors, throw a general BadRequestException
        throw new BadRequestException(
          'Failed to retrieve the bill. Please try again later.',
        );
      }
    }
  }

  // bill delete with bill items deletion
  async deleteBill(id: string) {
    try {
      // Check if the bill exists
      const bill = await this.prisma.bill.findUnique({
        where: { id },
        include: {
          billItems: true, // Include BillItems to verify if the Bill has related items
        },
      });

      if (!bill) {
        throw new NotFoundException('Bill not found');
      }

      // Delete related BillItems first (if not using cascading delete in database)
      await this.prisma.billItem.deleteMany({
        where: { bill_id: id },
      });

      // Now delete the Bill itself
      const deletedBill = await this.prisma.bill.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Bill and its associated BillItems deleted successfully',
        data: deletedBill, // Return the deleted Bill data
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to delete bill');
    }
  }
}
