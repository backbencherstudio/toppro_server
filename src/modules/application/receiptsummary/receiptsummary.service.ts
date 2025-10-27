import { Injectable, NotFoundException } from '@nestjs/common';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateReceiptSummaryDto } from 'src/modules/application/receiptsummary/dto/create-receiptsummary.dto';
import { UpdateReceiptSummaryDto } from 'src/modules/application/receiptsummary/dto/update-receiptsummary.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReceiptSummaryService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateReceiptSummaryDto,
    owner_id: string,
    workspace_id: string,
    user_id: string,
    file: Express.Multer.File,
    invoice_id: string,
  ) {
    try {
      // Sanitize and normalize incoming data
      dto.amount = Number(dto.amount);
      if (isNaN(dto.amount) || dto.amount <= 0) {
        return {
          success: false,
          message: 'Amount must be a valid number greater than 0',
        };
      }

      if (dto.date) dto.date = new Date(dto.date).toISOString();

      if (dto.bank_account_id === 'null' || dto.bank_account_id === '') {
        dto.bank_account_id = null;
      }

      // Attach file name if uploaded
      if (file) {
        dto.file = file.filename;
      }

      // Invoice validation
      let invoice = null;
      if (invoice_id) {
        invoice = await this.prisma.invoice.findUnique({
          where: { id: invoice_id },
          include: { ReceiptSummary: true },
        });

        if (!invoice) {
          return { success: false, message: 'Invoice not found' };
        }

        const totalReceived = invoice.ReceiptSummary.reduce(
          (sum, r) => sum + (r.amount || 0),
          0,
        );

        if (totalReceived >= invoice.totalPrice || invoice.due <= 0) {
          if (invoice.status !== 'PAID') {
            await this.prisma.invoice.update({
              where: { id: invoice_id },
              data: { status: 'PAID', paid: invoice.totalPrice, due: 0 },
            });
          }
          return { success: false, message: 'Invoice already fully paid' };
        }

        if (totalReceived + dto.amount > invoice.totalPrice) {
          return {
            success: false,
            message: `Payment exceeds invoice total. Already received: ${totalReceived}, Total: ${invoice.totalPrice}`,
          };
        }
      }

      // Create the receipt record
      const receipt = await this.prisma.receiptSummary.create({
        data: {
          ...dto,
          owner_id: owner_id || user_id,
          workspace_id,
          user_id: user_id || owner_id,
          invoice_id: invoice_id || null,
        },
      });

      // Update the related invoice (if exists)
      if (invoice) {
        const newPaid = (invoice.paid || 0) + dto.amount;
        const newDue = invoice.totalPrice - newPaid;

        await this.prisma.invoice.update({
          where: { id: invoice_id },
          data: {
            paid: newPaid,
            due: newDue,
            status: newDue <= 0 ? 'PAID' : 'DRAFT',
          },
        });
      }

      return {
        success: true,
        message: 'Receipt summary created successfully',
        data: receipt,
      };
    } catch (error) {
      console.error('❌ Prisma Error:', error);
      return handlePrismaError(error);
    }
  }

  async findAll(
    invoice_id: string,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    try {
      const records = await this.prisma.receiptSummary.findMany({
        where: {
          // invoice_id,
          owner_id: owner_id || user_id,
          workspace_id,
          user_id: user_id || owner_id,
        },
        orderBy: { created_at: 'desc' },
      });
      return {
        success: true,
        message: 'Receipt summaries retrieved successfully',
        data: records,
      };
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const record = await this.prisma.receiptSummary.findUnique({
        where: { id },
      });
      if (!record) throw new NotFoundException('Receipt not found');
      return record;
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateReceiptSummaryDto) {
    await this.findOne(id);
    return this.prisma.receiptSummary.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.receiptSummary.delete({ where: { id } });
  }
}
