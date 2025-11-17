import { Controller, Post, Headers, Req } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { PackageStatus } from '@prisma/client';

@Controller('stripe')
export class WebhookController {
  constructor(private prisma: PrismaService) { }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: any
  ) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('❌ Invalid Stripe signature:', err.message);
      return { error: 'Invalid signature' };
    }

    // -------------------------------------------------------
    //  MAIN EVENT: checkout.session.completed
    // -------------------------------------------------------

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType;
      const billingPeriod = session.metadata?.billingPeriod;

      if (!paymentId || !userId) {
        console.error('❌ Missing metadata fields in session');
        return { error: 'Missing metadata' };
      }

      // -------------------------------------------------------
      // Get Payment Intent → charge ID
      // -------------------------------------------------------
      const intentId = session.payment_intent as string;
      const intent = await stripe.paymentIntents.retrieve(intentId, {
        expand: ['charges'],
      });

      const chargeId = (intent as any).charges?.data?.[0]?.id ?? null;

      // -------------------------------------------------------
      // Update Payment Record
      // -------------------------------------------------------
      const payment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentStatus: 'succeeded',
          stripePaymentIntentId: intentId,
          stripeChargeId: chargeId,
          paymentDate: new Date(),
        },
      });

      // -------------------------------------------------------
      // Update User (Subscription Status)
      // -------------------------------------------------------
      const newStatus =
        billingPeriod === 'monthly'
          ? PackageStatus.PREMIUM_MONTHLY
          : PackageStatus.PREMIUM_YEARLY;

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          package_status: newStatus,
          subscription_status: 'active',
          current_period_start: new Date(),
          current_period_end: payment.expirationDate,
        },
      });

      // -------------------------------------------------------
      // Create User Subscription (Prevent Unique Error)
      // -------------------------------------------------------
      const uniqueSubId = `one-time-${paymentId}`;

      await this.prisma.userSubscription.create({
        data: {
          user_id: userId,
          plan_type: planType,
          plan_id: payment.basicPackageId ?? payment.comboPlanId,

          billing_cycle: billingPeriod,
          status: 'active',

          base_price: Number(payment.amount),
          subtotal: Number(payment.amount),
          total_amount: Number(payment.finalAmount),

          user_count: 1,
          workspace_count: 1,
          selected_modules: [],
          coupon_code: payment.couponCode ?? null,

          current_period_start: new Date(),
          current_period_end: payment.expirationDate,
          next_billing_date: payment.expirationDate,

          stripe_subscription_id: uniqueSubId, // <-- FIXED
          stripe_customer_id: payment.stripeCustomerId || 'none',
        },
      });

      console.log('🎉 Subscription created successfully for user:', userId);
    }

    return { success: true };
  }
}
