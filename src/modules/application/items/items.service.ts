// src/modules/items/items.service.ts
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import appConfig from 'src/config/app.config';
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
  file?: Express.Multer.File, // optional file
) {
  try {
    // -------------------------------
    // Step 0: Validate mandatory foreign keys
    // -------------------------------
    const user = await this.prisma.user.findUnique({ where: { id: user_id } });
    if (!user) throw new BadRequestException(`User with ID ${user_id} does not exist`);

    let workspace = null;
    if (workspace_id) {
      workspace = await this.prisma.workspace.findUnique({ where: { id: workspace_id } });
      if (!workspace) throw new BadRequestException(`Workspace with ID ${workspace_id} does not exist`);
    }

    // Optional relations: validate or set null
    const nullifyIfNotExist = async (model: any, id: string | undefined) => {
      if (!id) return null;
      const record = await model.findUnique({ where: { id } });
      return record ? id : null;
    };

    const validUnitId = await nullifyIfNotExist(this.prisma.unit, dto.unit_id);
    const validTaxId = await nullifyIfNotExist(this.prisma.tax, dto.tax_id);
    const validCategoryId = await nullifyIfNotExist(this.prisma.itemCategory, dto.itemCategory_id);
    const validItemTypeId = await nullifyIfNotExist(this.prisma.itemType, dto.itemType_id);
    const validInvoiceId = await nullifyIfNotExist(this.prisma.invoice, dto.invoice_id);

    // -------------------------------
    // Step 1: Clean DTO fields
    // -------------------------------
    const cleaned = {
      ...dto,
      user_id,
      owner_id: owner_id || user_id,
      workspace_id: workspace_id || null,
      unit_id: validUnitId,
      tax_id: validTaxId,
      itemCategory_id: validCategoryId,
      itemType_id: validItemTypeId,
      invoice_id: validInvoiceId,
    };

    // -------------------------------
    // Step 2: Handle file upload
    // -------------------------------
    if (file) {
      try {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}_${file.originalname}`;
        await SojebStorage.put(appConfig().storageUrl.avatar + fileName, file.buffer);
        cleaned.image = fileName;
      } catch (uploadError) {
        console.error('Item image upload error:', uploadError);
        throw new InternalServerErrorException('Failed to upload item image');
      }
    }

    // -------------------------------
    // Step 3: Create the Item
    // -------------------------------
    const item = await this.prisma.items.create({
      data: cleaned,
    });

    if (!item) throw new InternalServerErrorException('Item creation failed');

    // -------------------------------
    // Step 4: Create Stock
    // -------------------------------
    const stock = await this.prisma.stock.create({
      data: {
        item_id: item.id,
        quantity: dto.quantity || 0,
        deleted_at: null,
        product_name: item.name || 'Unnamed Item',
        sku: item.sku || 'N/A',
        image: item.image,
        owner_id: item.owner_id,
        workspace_id: item.workspace_id,
        user_id: item.user_id,
      },
    });

    if (!stock) throw new InternalServerErrorException('Stock creation failed');

    // -------------------------------
    // Step 5: Build response
    // -------------------------------
    return {
      success: true,
      message: 'Item created successfully!',
      data: {
        ...item,
        image_url: item.image ? SojebStorage.url(appConfig().storageUrl.avatar + item.image) : null,
      },
      stock,
    };
  } catch (error) {
    console.error('Error creating item:', error);

    return {
      success: false,
      message: error.message || 'An unexpected error occurred during item creation',
      code: error instanceof BadRequestException ? 400 : 500,
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    };
  }
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
  async findAllItemType(
    userId: string,
    ownerId: string,
    workspaceId: string,
    itemTypeId: string | null,
  ) {

    const items = await this.prisma.items.findMany({
      where: {
        workspace_id: workspaceId,
        owner_id: ownerId || userId,
        itemType_id: itemTypeId,
      },
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
  try {
    const item = await this.prisma.items.findFirst({
      where: { id, workspace_id },
      include: {
        tax: { select: { name: true, id: true } },
        unit: { select: { name: true, id: true } },
        stock: { select: { quantity: true, id: true } },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const responseData = {
      id: item.id,
      image: item.image,
      name: item.name,
      sku: item.sku,
      description: item.description,
      itemCategory_id: item.itemCategory_id || '',
      quantity: item.stock?.length > 0 ? item.stock[0].quantity : 0,
      tax_name: item.tax?.name || '',
      tax_id: item.tax?.id || '',
      vendor_id: item.vendor_id || '',
      itemType_id: item.itemType_id || '',
      purchase_price: item.purchase_price,
      unit_name: item.unit?.name || '',
      unit_id: item.unit?.id || '',
      sale_price: item.sale_price,
    };

    return {
      success: true,
      message: 'Item found successfully!',
      data: responseData,
    };
  } catch (error) {
    // Custom handling for specific Prisma or validation errors
    console.error('❌ Error in findOne:', error);

    if (error instanceof NotFoundException) {
      throw error; // rethrow to be handled by global filter
    }

    // Prisma client errors can be wrapped here
    if (error.code === 'P2023') {
      // invalid ID format, for example
      throw new BadRequestException('Invalid item ID format');
    }

    // fallback error response
    throw new InternalServerErrorException('Something went wrong while fetching the item');
  }
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
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Item not found');

    await this.prisma.items.delete({ where: { id } });
    return { success: true, message: 'Item deleted Successfully' };
  }
}
