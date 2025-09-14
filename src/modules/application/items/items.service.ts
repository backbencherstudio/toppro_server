// src/modules/items/items.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

function nullify(v?: string | null) {
  return v === undefined || v === null || v === '' || v === 'null' ? null : v;
}

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateItemDto,
    user_id: string,
    owner_id: string,
    workspace_id: string,
  ) {
    const cleaned = {
      ...dto,
      tax_id: nullify(dto.tax_id),
      itemCategory_id: nullify(dto.itemCategory_id),
      unit_id: nullify(dto.unit_id),
      image: nullify(dto.image),
      vendor_id: nullify(dto.vendor_id),
      itemType_id: nullify(dto.itemType_id),
      invoice_id: nullify(dto.invoice_id || null),
    };

    const item = await this.prisma.items.create({
      data: {
        ...cleaned,
        user_id: user_id || null,
        owner_id: owner_id === null ? user_id : owner_id,
        workspace_id: workspace_id,
      },
    });

    const stock = await this.prisma.stock.create({
      data: {
        item_id: item.id, // Link the stock to the newly created item
        quantity: dto.quantity || 0, // Use provided quantity or default to 0
        deleted_at: null, // Ensure it is not marked as deleted
        product_name: item.name, // Use the product name from the item
        sku: item.sku, // Use the SKU from the item
        image: item.image, // Use the image from the item
        owner_id: owner_id || user_id,
        workspace_id: workspace_id,
        user_id: user_id,
      },
    });

    return {
      success: true,
      message: 'Item created successfully!',
      data: item,
      stock: stock,
    };
  }

  async findAll(
    userId: string,
    ownerId: string,
    workspaceId: string,
    itemTypeId: string | null,
    itemCategoryId: string | null,
    searchTerm: string | null,
  ) {
    const whereCondition: any = {
      workspace_id: workspaceId,
      owner_id: ownerId || userId,
    };

    if (itemTypeId) {
      whereCondition.itemType_id = itemTypeId;
    }

    if (itemCategoryId) {
      whereCondition.itemCategory_id = itemCategoryId;
    }

    if (searchTerm) {
      whereCondition.name = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }

    const items = await this.prisma.items.findMany({
      where: whereCondition,
      orderBy: { created_at: 'desc' },
      include: {
        tax: { select: { name: true } },
        unit: { select: { name: true } },
        itemType: { select: { name: true } },
        stock: { select: { quantity: true } },
      },
    });

    const formatted = items.map((item) => ({
      id: item.id,
      image: item.image,
      name: item.name,
      sku: item.sku,
      sale_price: item.sale_price,
      purchase_price: item.purchase_price,
      tax_name: item.tax?.name || null,
      unit_name: item.unit?.name || null,
      quantity: item.stock.length > 0 ? item.stock[0].quantity : 0,
      item_type: item.itemType?.name || null,
    }));

    return { success: true, message: 'All Items found successfully!', data: formatted };
  }

async findOne(id: string, workspace_id: string) {
  const item = await this.prisma.items.findFirst({
    where: { id, workspace_id },
    include: {
      tax: { select: { name: true } },
      unit: { select: { name: true } },
      stock: { select: { quantity: true } },
    },
  });

  if (!item) throw new NotFoundException('Item not found');

  return {
    success: true,
    message: 'Item found successfully!',
    data: {
      id: item.id,
      image: item.image,
      name: item.name,
      sku: item.sku,
      description: item.description,
      quantity: item.stock?.length > 0 ? item.stock[0].quantity : 0, // Quantity from stock
      tax_name: item.tax?.name || null, // Tax name
      purchase_price: item.purchase_price,
      unit_name: item.unit?.name || null, // Unit name
      sale_price: item.sale_price,
    },
  };
}

  async update(dto: UpdateItemDto, workspace_id: string) {
    const { id, ...rest } = dto;

    const exists = await this.prisma.items.findFirst({
      where: { id, workspace_id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Item not found');

    const cleaned = {
      ...rest,
      tax_id: nullify(rest.tax_id),
      itemCategory_id: nullify(rest.itemCategory_id),
      unit_id: nullify(rest.unit_id),
      image: nullify(rest.image),
      vendor_id: nullify(rest.vendor_id),
      itemType_id: nullify(rest.itemType_id),
      invoice_id: nullify(rest.invoice_id),
    };

    const item = await this.prisma.items.update({
      where: { id },
      data: cleaned,
    });

    // Now, update the stock associated with the item
    const stock = await this.prisma.stock.findUnique({
      where: { item_id: id }, // Link to the item using its ID
    });

    // If stock exists, update its information as well
    if (stock) {
      await this.prisma.stock.update({
        where: { item_id: id },
        data: {
          product_name: item.name, // Update product name in stock
          sku: item.sku, // Update SKU in stock
          image: item.image, // Update image in stock
          quantity: item.quantity, // Update quantity in stock (or whatever you wish to update)
        },
      });
    }

    return { success: true, message: 'Item updated', item };
  }

  async remove(id: string, workspace_id: string) {
    const exists = await this.prisma.items.findFirst({
      where: { id, workspace_id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Item not found');

    await this.prisma.items.delete({ where: { id } });
    return { success: true, message: 'Item deleted' };
  }
}
