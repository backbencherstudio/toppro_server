// src/bank-account/bank-account.service.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BankType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bankaccount.dto';
import { UpdateBankAccountDto } from './dto/update-bankaccount.dto';

@Injectable()
export class BankAccountService {
  constructor(private prisma: PrismaService) {}

  // Create a bank account
  async create(
    createBankAccountDto: CreateBankAccountDto,
    ownerId: string,
    workspaceId: string,
    userId?: string,
  ) {
    if (!ownerId && !userId) {
      throw new HttpException(
        'Owner ID or User ID must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!workspaceId) {
      throw new HttpException(
        'Workspace ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const data: Prisma.BankAccountUncheckedCreateInput = {
        ...createBankAccountDto,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
        user_id: userId || ownerId,
        bank_type: createBankAccountDto.bank_type as BankType,
      };

      const bankAccount = await this.prisma.bankAccount.create({ data });

      if (bankAccount.chart_of_account_id) {
        const total = await this.prisma.bankAccount.aggregate({
          where: { chart_of_account_id: bankAccount.chart_of_account_id },
          _sum: { opening_balance: true },
        });

        await this.prisma.chartOfAccount.update({
          where: { id: bankAccount.chart_of_account_id },
          data: {
            balance: total._sum.opening_balance || 0,
          },
        });
      }

      return {
        success: true,
        message: 'Bank Account created successfully',
        data: bankAccount,
      };
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw new HttpException(
        'Failed to create bank account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, dto: UpdateBankAccountDto) {
    // Check if bank account exists
    const existing = await this.prisma.bankAccount.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) throw new NotFoundException('Bank account not found');

    // Clean undefined/null fields
    const cleanedData = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined && v !== null),
    );

    // Prepare Prisma UpdateInput
    const data: Prisma.BankAccountUpdateInput = {
      ...cleanedData,
      bank_type: cleanedData.bank_type
        ? { set: cleanedData.bank_type as BankType }
        : undefined,
      updated_at: new Date(),
    };

    const bankAccount = await this.prisma.bankAccount.update({
      where: { id },
      data,
    });

    return {
      success: true,
      message: 'Bank Account updated successfully',
      data: bankAccount,
    };
  }

  // Get a single bank account by ID
  async findOne(id: string) {
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id },
    });
    return {
      success: true,
      message: 'Bank Account found successfully',
      data: bankAccount,
    };
  }

  // Get a list of all bank accounts
  async findAll() {
    const bankAccounts = await this.prisma.bankAccount.findMany();
    return {
      success: true,
      message: 'All bank accounts found successfully',
      data: bankAccounts,
    };
  }

  // Delete a bank account
  async remove(id: string) {
    const bankAccount = await this.prisma.bankAccount.delete({
      where: { id },
    });
    return {
      success: true,
      message: 'Bank Account deleted successfully',
      data: bankAccount,
    };
  }
}
