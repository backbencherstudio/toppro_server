import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {} // inject PrismaService

  async create(
    createPurchaseDto: CreatePurchaseDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const {
      item_id,
      quantity,
      unit_price,
      discount = 0,
      tax_id,
      accountType_id,
      billingCategory_id,
      itemCategory_id,
      purchase_no,
    } = createPurchaseDto;

    // 1️⃣ Validate item exists
    const item = await this.prisma.items.findUnique({
      where: { id: item_id },
    });
    if (!item) throw new BadRequestException('Item not found');

    // 2️⃣ Validate foreign keys exist (optional but recommended)
    // if (itemCategory_id) {
    //   const category = await this.prisma.itemCategory.findUnique({
    //     where: { id: itemCategory_id },
    //   });
    //   if (!category) throw new BadRequestException('Item category not found');
    // }

    if (tax_id) {
      const tax = await this.prisma.tax.findUnique({ where: { id: tax_id } });
      if (!tax) throw new BadRequestException('Tax not found');
    }

    if (accountType_id) {
      const accountType = await this.prisma.accountType.findUnique({
        where: { id: accountType_id },
      });
      if (!accountType) throw new BadRequestException('Account type not found');
    }

    if (billingCategory_id) {
      const billingCategory = await this.prisma.billCategory.findUnique({
        where: { id: billingCategory_id },
      });
      if (!billingCategory)
        throw new BadRequestException('Billing category not found');
    }

    // 3️⃣ Calculate total price
    const total_price = (unit_price || 0) * (quantity || 1) - (discount || 0);

    // 4️⃣ Create purchase
    const purchase = await this.prisma.purchase.create({
      data: {
        ...createPurchaseDto,
        owner_id: ownerId,
        workspace_id: workspaceId,
        user_id: userId,
        total_price,
      },
    });

    return {
      success: true,
      message: 'Purchase created successfully',
      data: purchase,
    };
  }

  // Get all purchases for a user/workspace/owner
  async findAll(ownerId: string, workspaceId: string, userId?: string) {
    const purchases = await this.prisma.purchase.findMany({
      where: {
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
      },
      // include: {
      //   item: true,
      //   vendor: true,
      //   tax: true,
      //   billing_category: true,
      //   itemCategory: true,
      //   AccountType: true,
      //   workspace: true,
      //   user: true,
      // },
      // orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      message: 'Purchases fetched successfully',
      data: purchases,
    };
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
