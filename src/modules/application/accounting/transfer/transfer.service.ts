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
    try {
      const transfer = await this.prisma.transfer.create({
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
        message: 'Transfer created successfully',
        data: transfer,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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

  async update(id: string, dto: UpdateTransferDto) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer not found');

    const updated = await this.prisma.transfer.update({
      where: { id },
      data: { ...dto },
    });

    return {
      success: true,
      message: 'Transfer updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer not found');

    await this.prisma.transfer.delete({ where: { id } });
    return { success: true, message: 'Transfer deleted successfully' };
  }
}
