import { Controller, Post, Body, Req, UseGuards, Get, Param, Delete, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/modules/auth/guards/admin.guard';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) { }

  @UseGuards(JwtAuthGuard)
  @Post('create-intent')
  async create(@Req() req, @Body() body: any) {
    const userId = req.user.id;
    return this.paymentService.initializePayment({
      ...body,
      userId,
    })
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('all')
  async getAllPayments(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return this.paymentService.getAllPayments({ page, limit, search });
  }

  //delete payment by id
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deletePayment(@Param('id') id: string) {
    return {
      message: 'Delete payment Info Successfully.',
      data: await this.paymentService.deletePayment(id)
    };
  }

}
