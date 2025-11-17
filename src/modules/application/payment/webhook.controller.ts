
// import { Controller, Post, Headers, Req } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { StripeService } from './stripe.service';
// import Stripe from 'stripe';
// import { PackageStatus } from '@prisma/client';

// @Controller('stripe-webhook')
// export class WebhookController {
//   constructor(
//     private prisma: PrismaService,
//     private stripeService: StripeService,
//   ) {}

//   @Post()
//   async handleWebhook(
//     @Headers('stripe-signature') signature: string,
//     @Req() request: any
//   ) {
//     const stripe = this.stripeService.stripe;
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     let event: Stripe.Event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         request.rawBody,
//         signature,
//         webhookSecret
//       );
//     } catch (err: any) {
//       console.error('❌ Invalid Stripe Signature:', err.message);
//       return { error: 'Invalid signature' };
//     }

//     /**
//      * ------------------------------
//      *  PAYMENT SUCCESS HANDLER
//      * ------------------------------
//      */
//     if (event.type === 'payment_intent.succeeded') {
//       const rawIntent = event.data.object as Stripe.PaymentIntent;

//       // Stripe 2025 → retrieve() returns PaymentIntent directly (not Response<T>)
//       const intent: Stripe.PaymentIntent = await stripe.paymentIntents.retrieve(
//         rawIntent.id,
//         { expand: ['charges'] }
//       );

//       const payment = await this.prisma.payment.findUnique({
//         where: { stripePaymentIntentId: intent.id },
//       });

//       if (!payment) {
//         console.warn('⚠ Payment record not found for intent:', intent.id);
//         return { error: 'Payment not found' };
//       }

//       /**
//        * Stripe 2025 Types: PaymentIntent no longer includes "charges"
//        * But API returns it when expanded → so we safely cast using (intent as any)
//        */
//       const chargeId =
//         (intent as any).charges?.data?.[0]?.id ?? null;

//       // Update Payment Status
//       await this.prisma.payment.update({
//         where: { id: payment.id },
//         data: {
//           paymentStatus: 'succeeded',
//           stripeChargeId: chargeId,
//           paymentDate: new Date(),
//         },
//       });

//       // Activate user subscription
//       await this.activateSubscription(payment);
//     }

//     return { success: true };
//   }

//   /**
//    * ------------------------------
//    *  USER SUBSCRIPTION ACTIVATION
//    * ------------------------------
//    */
//   async activateSubscription(payment: any) {
//     const billingPeriod = payment.monthly ? 'monthly' : 'yearly';

//     const newStatus =
//       billingPeriod === 'monthly'
//         ? PackageStatus.PREMIUM_MONTHLY
//         : PackageStatus.PREMIUM_YEARLY;

//     // Update user's plan
//     await this.prisma.user.update({
//       where: { id: payment.userId },
//       data: {
//         package_status: newStatus,
//         current_period_start: new Date(),
//         current_period_end: payment.expirationDate,
//       },
//     });

//     console.log(`🎉 User upgraded to ${newStatus}: ${payment.userId}`);

//     // Numeric conversion for Prisma Decimal()
//     const basePrice = Number(payment.amount);
//     const totalAmount = Number(payment.finalAmount);

//     // Create new subscription record
//     await this.prisma.userSubscription.create({
//       data: {
//         user_id: payment.userId,
//         plan_type: payment.basicPackageId ? 'basic' : 'combo',
//         plan_id: payment.basicPackageId ?? payment.comboPlanId,

//         base_price: basePrice,
//         subtotal: basePrice,
//         total_amount: totalAmount,

//         user_count: 1,
//         workspace_count: 1,
//         selected_modules: [],
//         coupon_code: payment.couponCode ?? null,

//         // Stripe identifiers
//         stripe_subscription_id: payment.stripeSubscriptionId || 'one-time',
//         stripe_customer_id: payment.stripeCustomerId || 'unknown',
//         stripe_price_id: null,

//         billing_cycle: billingPeriod,
//         status: 'active',

//         current_period_start: new Date(),
//         current_period_end: payment.expirationDate,
//         next_billing_date: payment.expirationDate,

//         metadata: {},
//       },
//     });

//     console.log(`✅ Subscription activated for user: ${payment.userId}`);
//   }
// }

import { Controller, Post, Headers, Req } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { PackageStatus } from '@prisma/client';

@Controller('stripe')
export class WebhookController {
  constructor(private prisma: PrismaService) {}

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
    //  Handle CHECKOUT SESSION COMPLETED (Main Event)
    // -------------------------------------------------------
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType;
      const billingPeriod = session.metadata?.billingPeriod;

      if (!paymentId) {
        console.error('❌ No paymentId in metadata');
        return { error: 'Missing paymentId' };
      }

      // Fetch PaymentIntent (needed for chargeId)
      const intentId = session.payment_intent as string;
      const intent = await stripe.paymentIntents.retrieve(intentId, {
        expand: ['charges'],
      });

      const chargeId = (intent as any).charges?.data?.[0]?.id ?? null;

      // -------------------------------------------------------
      // Update payment record
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
      // Update USER subscription
      // -------------------------------------------------------
      const newStatus =
        billingPeriod === 'monthly'
          ? PackageStatus.PREMIUM_MONTHLY
          : PackageStatus.PREMIUM_YEARLY;

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          package_status: newStatus,
          current_period_start: new Date(),
          current_period_end: payment.expirationDate,
        },
      });

      // -------------------------------------------------------
      // Create user subscription record
      // -------------------------------------------------------
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
          current_period_start: new Date(),
          current_period_end: payment.expirationDate,
          next_billing_date: payment.expirationDate,
          stripe_subscription_id: 'one-time',
          stripe_customer_id: payment.stripeCustomerId || 'none',
        },
      });
    }

    return { success: true };
  }
}
