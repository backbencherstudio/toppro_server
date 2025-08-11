import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category';


@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

//  create 
  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name:   dto.name,
        slug:   dto.slug,
        status: dto.status,
      },
    });
  }

  // all categories 
  async findAll() {
    return this.prisma.category.findMany({
      where: { deleted_at: null },
      include: { services: true, service_categories: true },
    });
  }
  
  //only one
  async findOne(id: string) {
    const cate = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!cate) throw new NotFoundException(`Category ${id} not found`);
    return cate;
  }

// Delete 
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        status:0,
      },
    });
  }
}
