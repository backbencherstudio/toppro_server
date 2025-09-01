import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {} // inject PrismaService

async create(
  dto: CreatePurchaseDto,
  ownerId: string,
  workspaceId: string,
  userId: string
) {
  try {
    // Validate all items exist
    const itemIds = dto.item.map(i => i.id);
    const existingItems = await this.prisma.items.findMany({
      where: { id: { in: itemIds } },
    });

    if (existingItems.length !== itemIds.length) {
      throw new BadRequestException('One or more items do not exist');
    }

    // Calculate total price dynamically
    const totalPrice = dto.item.reduce(
      (sum, i) => sum + i.quantity * i.unit_price,
      0
    );

    // Create purchase
    const purchase = await this.prisma.purchase.create({
      data: {
        purchase_no: dto.purchase_no,
        tax_id: dto.tax_id,
        accountType_id: dto.accountType_id,
        billingCategory_id: dto.billingCategory_id,
        itemCategory_id: dto.itemCategory_id,
        owner_id: ownerId,
        workspace_id: workspaceId,
        user_id: userId,
        discount: dto.discount ?? 0,
        total_price: totalPrice,
        item: {
          connect: dto.item.map(i => ({ id: i.id })),
        },
      },
    });

    return {
      success: true,
      message: 'Purchase created successfully',
      purchase,
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}


  // Get all purchases for an owner/workspace
  async findAll(ownerId: string, workspaceId: string, userId: string) {
    return this.prisma.purchase.findMany({
      where: { owner_id: ownerId, workspace_id: workspaceId },
      include: { item: true },
      orderBy: { created_at: 'desc' }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} purchase`;
  }

  update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    return `This action updates a #${id} purchase`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchase`;
  }
}
