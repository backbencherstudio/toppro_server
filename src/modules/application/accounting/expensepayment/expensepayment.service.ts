import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExpensePaymentDto } from './dto/create-expensepayment.dto';

@Injectable()
export class ExpensePaymentService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a Payment and perform calculations
  async createExpensePayment(
    dto: CreateExpensePaymentDto,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    try {
      // Fetch the Bill using the Bill ID
      const bill = await this.prisma.bill.findUnique({
        where: { id: dto.bill_id },
        include: { expensePayments: true }, // Include expense payments to track updates
      });

      // If Bill is not found, throw an error
      if (!bill) {
        throw new NotFoundException('Bill not found');
      }

      // Log the fetched bill data for debugging
      console.log('Fetched Bill:', bill);

      // Handle the Payment Record creation with optional category_id and bank_account_id
      const payment = await this.prisma.expensePayment.create({
        data: {
          amount: dto.amount,
          date: new Date(dto.date),
          bill_id: dto.bill_id,
          bank_account_id: dto.bank_account_id ? dto.bank_account_id : null, // If null, leave it as null
          vendor_id: dto.vendor_id ? dto.vendor_id : null,
          description: dto.description,
          reference: dto.reference,
          workspace_id: workspace_id,
          owner_id: owner_id || user_id,
          user_id: user_id || owner_id,
          category_id: dto.category_id ? dto.category_id : null, // If null, leave it as null
        },
      });

      // Log the payment creation for debugging
      console.log('Created Expense Payment:', payment);

      // Calculate the updated Paid and Due amounts for the Bill
      const updatedPaidAmount = bill.paid + dto.amount;
      const updatedDueAmount = bill.due - dto.amount;

      // Log the new totals for debugging
      console.log('Updated Paid Amount:', updatedPaidAmount);
      console.log('Updated Due Amount:', updatedDueAmount);

      // Update the Bill with the new paid and due amounts
      const updatedBill = await this.prisma.bill.update({
        where: { id: dto.bill_id },
        data: {
          paid: updatedPaidAmount,
          due: updatedDueAmount,
          // Update the Bill's status based on the updated paid amount
          status: updatedPaidAmount >= bill.total ? 'PAID' : 'PARTIALLY_PAID',
        },
      });

      // Log the updated Bill
      console.log('Updated Bill:', updatedBill);

      return {
        success: true,
        message: 'Expense payment created and bill updated successfully',
        data: updatedBill,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new BadRequestException('Failed to create expense payment');
    }
  }

// READ ALL: Get all Expense Payments with Pagination
async findAllPayment(
  owner_id: string,
  workspace_id: string,
  user_id: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    const skip = (page - 1) * limit;

    const whereCondition = {
      workspace_id,
      OR: [
        { owner_id },
        { owner_id: user_id },
        { user_id },
        { user_id: owner_id },
      ],
    };

    // Count total payments
    const totalCount = await this.prisma.expensePayment.count({
      where: whereCondition,
    });

    // Fetch paginated payments
    const payments = await this.prisma.expensePayment.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      message: 'Expense payments retrieved successfully',
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
      data: payments,
    };
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new BadRequestException('Failed to retrieve expense payments');
  }
}

  async findAllPayments(
    billId: string,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    try {
      const payments = await this.prisma.expensePayment.findMany({
        where: {
          bill_id: billId,
          workspace_id: workspace_id,
          owner_id: owner_id || user_id,
          user_id: user_id || owner_id,
        },
      });

      if (!payments) {
        throw new NotFoundException('No payments found for this Bill');
      }

      return {
        success: true,
        message: 'Expense payments retrieved successfully',
        data: payments,
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw new BadRequestException('Failed to retrieve expense payments');
    }
  }

  // READ SINGLE: Get a single Expense Payment by ID
  async findOnePayment(id: string) {
    try {
      const payment = await this.prisma.expensePayment.findUnique({
        where: { id },
      });

      if (!payment) {
        throw new NotFoundException('Expense payment not found');
      }

      return {
        success: true,
        message: 'Expense payment retrieved successfully',
        data: payment,
      };
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new BadRequestException('Failed to retrieve expense payment');
    }
  }

  // UPDATE: Update an existing Expense Payment
  async updateExpensePayment(id: string, dto: CreateExpensePaymentDto) {
    try {
      const existingPayment = await this.prisma.expensePayment.findUnique({
        where: { id },
      });

      if (!existingPayment) {
        throw new NotFoundException('Expense payment not found');
      }

      const updatedPayment = await this.prisma.expensePayment.update({
        where: { id },
        data: {
          amount: dto.amount,
          date: new Date(dto.date),
          bank_account_id: dto.bank_account_id,
          vendor_id: dto.vendor_id,
          description: dto.description,
          reference: dto.reference,
          category_id: dto.category_id || null,
        },
      });

      return {
        success: true,
        message: 'Expense payment updated successfully',
        data: updatedPayment,
      };
    } catch (error) {
      console.error('Error updating payment:', error);
      throw new BadRequestException('Failed to update expense payment');
    }
  }

  // DELETE: Delete an Expense Payment by ID
  async deleteExpensePayment(id: string) {
    try {
      const existingPayment = await this.prisma.expensePayment.findUnique({
        where: { id },
      });

      if (!existingPayment) {
        throw new NotFoundException('Expense payment not found');
      }

      // Remove the payment
      await this.prisma.expensePayment.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Expense payment deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw new BadRequestException('Failed to delete expense payment');
    }
  }
}
