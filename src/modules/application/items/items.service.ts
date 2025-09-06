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

    console.log('Creating item...', dto, user_id, owner_id, workspace_id);
    // Clean up "null" strings → real nulls, so relations don’t break
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

    return { success: true, message: 'Item created successfully!', item };
  }

  async findAll(workspace_id: string) {
    const items = await this.prisma.items.findMany({
      where: { workspace_id },
      orderBy: { created_at: 'desc' },
    });
    return { success: true, data: items };
  }

  async findOne(id: string, workspace_id: string) {
    const item = await this.prisma.items.findFirst({
      where: { id, workspace_id },
    });
    if (!item) throw new NotFoundException('Item not found');
    return { success: true, data: item };
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
