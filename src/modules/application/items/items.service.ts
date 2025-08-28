import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateItemDto) {
    return this.prisma.items.create({
      data: dto,
    });
  }

  // Get all items for a specific owner and workspace
  async findAll(owner_id: string, workspace_id: string) {
    return this.prisma.items.findMany({
      where: {
        owner_id: owner_id,
        workspace_id: workspace_id,
        deleted_at: null, // optional: only fetch non-deleted items
      },
    });
  }

  // Get single item by id
  async findOne(id: string) {
    const item = await this.prisma.items.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  // Update an item by id
  async update(id: string, dto: UpdateItemDto) {
    const item = await this.prisma.items.update({
      where: { id },
      data: dto,
    });

    return {
      success: true,
      message: 'Item updated successfully!',
      item,
    };
  }

  // Delete an item by id
  async remove(id: string) {
    const item = await this.prisma.items.delete({ where: { id } });

    return {
      success: true,
      message: 'Item deleted successfully!',
      item,
    };
  }
}
