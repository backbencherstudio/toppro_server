import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDebitNoteDto } from './dto/create-debitnote.dto';

@Injectable()
export class DebitNoteService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE: Create a Debit Note and update the Bill accordingly
  async createDebitNote(
    dto: CreateDebitNoteDto,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    try {
      // Fetch the Bill using the Bill ID
      const bill = await this.prisma.bill.findUnique({
        where: { id: dto.bill_id },
        include: { debitNotes: true }, // Include associated Debit Notes
      });

      if (!bill) {
        throw new NotFoundException('Bill not found');
      }

      // Create the Debit Note Record
      const debitNote = await this.prisma.debitNote.create({
        data: {
          amount: dto.amount,
          date: new Date(dto.date),
          bill_id: dto.bill_id,
          vendor_id: dto.vendor_id,
          description: dto.description,
          payment_id: dto.payment_id,
          workspace_id: workspace_id,
          owner_id: owner_id || user_id,
          user_id: user_id || owner_id,
        },
      });

      // Log the Debit Note creation for debugging
      console.log('Created Debit Note:', debitNote);

      // Calculate the new Paid and Due amounts for the Bill
      const updatedPaidAmount = bill.paid - dto.amount; // Debit Note reduces the amount paid
      const updatedDueAmount = bill.due + dto.amount; // Debit Note increases the due amount

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
        message: 'Debit note created and bill updated successfully',
        data: updatedBill,
      };
    } catch (error) {
      console.error('Error creating debit note:', error);
      throw new BadRequestException('Failed to create debit note');
    }
  }

  // READ ALL: Get all Debit Notes for a Bill
async findAllDebit(
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

    // Count total debit notes
    const totalCount = await this.prisma.debitNote.count({
      where: whereCondition,
    });

    // Fetch paginated debit notes
    const debitNotes = await this.prisma.debitNote.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      message: 'Debit notes retrieved successfully',
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
      data: debitNotes,
    };
  } catch (error) {
    console.error('Error fetching debit notes:', error);
    throw new BadRequestException('Failed to retrieve debit notes');
  }
}

  // READ ALL: Get all Debit Notes for a Bill
  async findAllDebitNotes(billId: string) {
    try {
      const debitNotes = await this.prisma.debitNote.findMany({
        where: { bill_id: billId },
      });

      if (!debitNotes) {
        throw new NotFoundException('No debit notes found for this Bill');
      }

      return {
        success: true,
        message: 'Debit notes retrieved successfully',
        data: debitNotes,
      };
    } catch (error) {
      console.error('Error fetching debit notes:', error);
      throw new BadRequestException('Failed to retrieve debit notes');
    }
  }

  // READ SINGLE: Get a single Debit Note by ID
  async findOneDebitNote(id: string) {
    try {
      const debitNote = await this.prisma.debitNote.findUnique({
        where: { id },
      });

      if (!debitNote) {
        throw new NotFoundException('Debit note not found');
      }

      return {
        success: true,
        message: 'Debit note retrieved successfully',
        data: debitNote,
      };
    } catch (error) {
      console.error('Error fetching debit note:', error);
      throw new BadRequestException('Failed to retrieve debit note');
    }
  }

  // UPDATE: Update an existing Debit Note
  async updateDebitNote(id: string, dto: CreateDebitNoteDto) {
    try {
      const existingDebitNote = await this.prisma.debitNote.findUnique({
        where: { id },
      });

      if (!existingDebitNote) {
        throw new NotFoundException('Debit note not found');
      }

      const updatedDebitNote = await this.prisma.debitNote.update({
        where: { id },
        data: {
          amount: dto.amount,
          date: new Date(dto.date),
          vendor_id: dto.vendor_id,
          description: dto.description,
          payment_id: dto.payment_id,
          category_id: dto.category_id,
        },
      });

      return {
        success: true,
        message: 'Debit note updated successfully',
        data: updatedDebitNote,
      };
    } catch (error) {
      console.error('Error updating debit note:', error);
      throw new BadRequestException('Failed to update debit note');
    }
  }

  // DELETE: Delete a Debit Note by ID
  async deleteDebitNote(id: string) {
    try {
      const existingDebitNote = await this.prisma.debitNote.findUnique({
        where: { id },
      });

      if (!existingDebitNote) {
        throw new NotFoundException('Debit note not found');
      }

      // Remove the debit note
      await this.prisma.debitNote.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Debit note deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting debit note:', error);
      throw new BadRequestException('Failed to delete debit note');
    }
  }
}
