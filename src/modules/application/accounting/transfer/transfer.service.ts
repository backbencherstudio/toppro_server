import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';

@Injectable()
export class TransferService {
  constructor(private prisma: PrismaService) {}

async create(
  dto: CreateTransferDto,
  user_id: string,
  workspace_id: string,
  owner_id: string,
) {
  const { from_account, to_account, amount } = dto;

  // 1. Start a transaction
  return await this.prisma.$transaction(async (prisma) => {
    // 2. Fetch the fromAccount and toAccount
    const fromAccount = await prisma.bankAccount.findUnique({
      where: { id: from_account },
    });

    if (!fromAccount) throw new NotFoundException("From account not found");

    const toAccount = await prisma.bankAccount.findUnique({
      where: { id: to_account },
    });

    if (!toAccount) throw new NotFoundException("To account not found");

    // 3. Check if fromAccount has enough balance
    if ((fromAccount.opening_balance || 0) < amount) {
      throw new BadRequestException("Insufficient balance in the source account");
    }

    // 4. Update balances
    await prisma.bankAccount.update({
      where: { id: from_account },
      data: { opening_balance: (fromAccount.opening_balance || 0) - amount },
    });

    await prisma.bankAccount.update({
      where: { id: to_account },
      data: { opening_balance: (toAccount.opening_balance || 0) + amount },
    });

    // 5. Create transfer record
    const transfer = await prisma.transfer.create({
      data: {
        ...dto,
        user_id: user_id || owner_id,
        workspace_id,
        owner_id: owner_id || user_id,
        date: new Date(),
      },
    });

    return {
      success: true,
      message: "Transfer created successfully",
      data: transfer,
    };
  });
}



  async findAll(owner_id?: string, workspace_id?: string, user_id?: string) {
    const transfers = await this.prisma.transfer.findMany({
      where: {
        owner_id: owner_id || user_id,
        workspace_id,
        user_id: user_id || owner_id,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!transfers || transfers.length === 0) {
      throw new NotFoundException('No transfers found');
    }

    return {
      success: true,
      message: 'Transfers retrieved successfully',
      data: transfers,
    };
  }

  async findOne(id: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id },
      // include: { BankAccount: true },
    });
    if (!transfer) throw new NotFoundException('Transfer not found');
    return {
      success: true,
      message: 'Transfer retrieved successfully',
      data: transfer,
    };
  }

async update(
  id: string,
  dto: UpdateTransferDto,
) {
  return await this.prisma.$transaction(async (prisma) => {
    const existing = await prisma.transfer.findUnique({
      where: { id },
      include: { fromBank: true, toBank: true },
    });
    if (!existing) throw new NotFoundException("Transfer not found");

    // Revert previous balances
    await prisma.bankAccount.update({
      where: { id: existing.from_account },
      data: { opening_balance: (existing.fromBank?.opening_balance || 0) + existing.amount },
    });

    await prisma.bankAccount.update({
      where: { id: existing.to_account },
      data: { opening_balance: (existing.toBank?.opening_balance || 0) - existing.amount },
    });

    // Check if new from_account has enough balance
    const fromAccount = await prisma.bankAccount.findUnique({ where: { id: dto.from_account } });
    if ((fromAccount?.opening_balance || 0) < dto.amount) {
      throw new BadRequestException("Insufficient balance for updated transfer");
    }

    // Apply new balances
    await prisma.bankAccount.update({
      where: { id: dto.from_account },
      data: { opening_balance: (fromAccount?.opening_balance || 0) - dto.amount },
    });

    const toAccount = await prisma.bankAccount.findUnique({ where: { id: dto.to_account } });
    await prisma.bankAccount.update({
      where: { id: dto.to_account },
      data: { opening_balance: (toAccount?.opening_balance || 0) + dto.amount },
    });

    // Update transfer record
    const transfer = await prisma.transfer.update({
      where: { id },
      data: dto,
    });

    return { success: true, message: "Transfer updated successfully", data: transfer };
  });
}


  async remove(id: string) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer not found');

    await this.prisma.transfer.delete({ where: { id } });
    return { success: true, message: 'Transfer deleted successfully' };
  }
}
