import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) { }

  async create(createCouponDto: CreateCouponDto, userId: string) {
    return this.prisma.coupon.create({
      data: {
        ...createCouponDto,
        isActive: true, // Always set to true by default
        expiryDate: createCouponDto.expiryDate ? new Date(createCouponDto.expiryDate) : null,
        owner_id: userId
      }
    });
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id }
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    // Check if coupon exists
    await this.findOne(id);

    return this.prisma.coupon.update({
      where: { id },
      data: updateCouponDto
    });
  }

  async remove(id: string) {
    // Check if coupon exists
    await this.findOne(id);

    return this.prisma.coupon.delete({
      where: { id }
    });
  }

  async validateCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code }
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    if (!coupon.isActive) {
      throw new NotFoundException('This coupon is inactive');
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      throw new NotFoundException('This coupon has expired');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new NotFoundException('This coupon has reached its usage limit');
    }

    return coupon;
  }

  async toggleActive(id: string) {
    // Check if coupon exists and get current status
    const coupon = await this.findOne(id);

    // Toggle the isActive status
    return this.prisma.coupon.update({
      where: { id },
      data: {
        isActive: !coupon.isActive
      }
    });
  }
}
