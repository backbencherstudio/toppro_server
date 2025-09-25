import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/modules/auth/guards/admin.guard';

@Controller('coupon')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) { }

  @Post()
  create(@Body() createCouponDto: CreateCouponDto, @Req() req: any) {
    return this.couponService.create(createCouponDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }

  @Post('validate')
  validateCoupon(@Body('code') code: string) {
    return this.couponService.validateCoupon(code);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.couponService.toggleActive(id);
  }
}
