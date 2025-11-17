// import { Controller, Post, Body } from '@nestjs/common';
// import { PaymentService } from './payment.service';

// @Controller('payment')
// export class PaymentController {
//   constructor(private paymentService: PaymentService) {}

//   @Post('create-intent')
//   async createIntent(@Body() body: any) {
//     return this.paymentService.initializePayment(body);
//   }
// }


import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

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
}
