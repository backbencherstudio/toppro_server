import { Controller, Post, Body, Inject } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: { userId: string; subscriptionId: string; paymentMethodId: string }) {
    return await this.stripeService.createCheckoutSession(body.userId, body.subscriptionId, body.paymentMethodId);
  }

  // Handle Stripe Webhook (to confirm payment completion)
  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    return await this.stripeService.handleWebhook(payload);
  }
}
