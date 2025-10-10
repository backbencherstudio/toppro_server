import { Controller, Post, Body, Get, Patch, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeSubscriptionService } from './stripe-subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
  ) { }

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: { userId: string; subscriptionId: string; paymentMethodId: string }) {
    return await this.stripeService.createCheckoutSession(body.userId, body.subscriptionId, body.paymentMethodId);
  }

  // ==================== DYNAMIC SUBSCRIPTION ENDPOINTS ====================

  @ApiOperation({ summary: 'Create dynamic subscription' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('subscriptions/create')
  async createSubscription(@Req() req: any, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    const userId = req.user.id;
    return await this.stripeSubscriptionService.createSubscription(userId, createSubscriptionDto);
  }

  @ApiOperation({ summary: 'Pay for Basic Plan' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('pay/basic-plan')
  async payBasicPlan(
    @Req() req: any,
    @Body() body: {
      users: number;
      workspaces: number;
      billingPeriod: 'monthly' | 'yearly';
      moduleIds: string[];
      couponCode?: string;
      paymentMethodId: string;
    }
  ) {
    const userId = req.user.id;
    return await this.stripeSubscriptionService.payBasicPlan(userId, body);
  }

  @ApiOperation({ summary: 'Pay for Combo Plan' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('pay/combo-plan')
  async payComboPlan(
    @Req() req: any,
    @Body() body: {
      planId: string;
      billingPeriod: 'monthly' | 'yearly';
      couponCode?: string;
      paymentMethodId: string;
    }
  ) {
    const userId = req.user.id;
    return await this.stripeSubscriptionService.payComboPlan(userId, body);
  }

  @ApiOperation({ summary: 'Update subscription (add/remove modules, change user count)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('subscriptions/:id/update')
  async updateSubscription(
    @Param('id') subscriptionId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto
  ) {
    return await this.stripeSubscriptionService.updateSubscription(subscriptionId, updateSubscriptionDto);
  }

  @ApiOperation({ summary: 'Get subscription details' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/:id')
  async getSubscription(@Param('id') subscriptionId: string) {
    return await this.stripeSubscriptionService.getSubscription(subscriptionId);
  }

  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('subscriptions/:id')
  async cancelSubscription(
    @Param('id') subscriptionId: string,
    @Body() body: { cancelAtPeriodEnd?: boolean }
  ) {
    return await this.stripeSubscriptionService.cancelSubscription(
      subscriptionId,
      body.cancelAtPeriodEnd ?? true
    );
  }

  @ApiOperation({ summary: 'Get upcoming invoice' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/:id/upcoming-invoice')
  async getUpcomingInvoice(@Param('id') subscriptionId: string) {
    return await this.stripeSubscriptionService.getUpcomingInvoice(subscriptionId);
  }

  // ==================== CUSTOMER MANAGEMENT ENDPOINTS ====================

  @ApiOperation({ summary: 'Get customer payment methods' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('customers/:customerId/payment-methods')
  async getCustomerPaymentMethods(@Param('customerId') customerId: string) {
    return await this.stripeService.getCustomerPaymentMethods(customerId);
  }

  @ApiOperation({ summary: 'Attach payment method to customer' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('customers/:customerId/payment-methods/:paymentMethodId/attach')
  async attachPaymentMethod(
    @Param('customerId') customerId: string,
    @Param('paymentMethodId') paymentMethodId: string
  ) {
    return await this.stripeService.attachPaymentMethod(paymentMethodId, customerId);
  }

  @ApiOperation({ summary: 'Detach payment method from customer' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('payment-methods/:paymentMethodId/detach')
  async detachPaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
    return await this.stripeService.detachPaymentMethod(paymentMethodId);
  }

  @ApiOperation({ summary: 'Set default payment method' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('customers/:customerId/payment-methods/:paymentMethodId/default')
  async setDefaultPaymentMethod(
    @Param('customerId') customerId: string,
    @Param('paymentMethodId') paymentMethodId: string
  ) {
    return await this.stripeService.setDefaultPaymentMethod(customerId, paymentMethodId);
  }

  @ApiOperation({ summary: 'Create payment intent' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('payment-intents')
  async createPaymentIntent(
    @Body() body: { amount: number; currency: string; customerId: string; metadata?: any }
  ) {
    return await this.stripeService.createPaymentIntent(
      body.amount,
      body.currency,
      body.customerId,
      body.metadata
    );
  }

  @ApiOperation({ summary: 'Create test payment method for testing' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('test-payment-method')
  async createTestPaymentMethod(@Req() req: any) {
    const userId = req.user.id;
    return await this.stripeService.createTestPaymentMethod(userId);
  }

  // Handle Stripe Webhook (to confirm payment completion)
  @Post('webhook')
  async handleWebhook(@Body() payload: any, @Req() req: any) {
    const signature = req.headers['stripe-signature'];

    try {
      // Verify webhook signature
      const event = this.stripeService.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      // Handle subscription events with subscription service
      if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.payment_succeeded', 'invoice.payment_failed'].includes(event.type)) {
        return await this.stripeSubscriptionService.handleWebhook(event);
      }

      // Handle payment intent events with main service
      return await this.stripeService.handleWebhook(payload, signature);
    } catch (error) {
      console.error('Webhook error:', error);
      throw new Error('Webhook processing failed');
    }
  }
}
