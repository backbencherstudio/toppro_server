// import { Controller, Post, Headers, Req } from '@nestjs/common';
// import Stripe from 'stripe';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { PackageStatus } from '@prisma/client';

// @Controller('stripe')
// export class WebhookController {
//   constructor(private prisma: PrismaService) { }

//   @Post('webhook')
//   async handleWebhook(
//     @Headers('stripe-signature') signature: string,
//     @Req() request: any
//   ) {
//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//     let event: Stripe.Event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         request.rawBody,
//         signature,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err: any) {
//       console.error('❌ Invalid Stripe signature:', err.message);
//       return { error: 'Invalid signature' };
//     }

//     // -------------------------------------------------------
//     //  MAIN EVENT: checkout.session.completed
//     // -------------------------------------------------------

//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object as Stripe.Checkout.Session;

//       const paymentId = session.metadata?.paymentId;
//       const userId = session.metadata?.userId;
//       const planType = session.metadata?.planType;
//       const billingPeriod = session.metadata?.billingPeriod;

//       if (!paymentId || !userId) {
//         console.error('❌ Missing metadata fields in session');
//         return { error: 'Missing metadata' };
//       }

//       // -------------------------------------------------------
//       // Get Payment Intent → charge ID
//       // -------------------------------------------------------
//       const intentId = session.payment_intent as string;
//       const intent = await stripe.paymentIntents.retrieve(intentId, {
//         expand: ['charges'],
//       });

//       const chargeId = (intent as any).charges?.data?.[0]?.id ?? null;

//       // -------------------------------------------------------
//       // Update Payment Record
//       // -------------------------------------------------------
//       const payment = await this.prisma.payment.update({
//         where: { id: paymentId },
//         data: {
//           paymentStatus: 'succeeded',
//           stripePaymentIntentId: intentId,
//           stripeChargeId: chargeId,
//           paymentDate: new Date(),
//         },
//       });

//       // -------------------------------------------------------
//       // Update User (Subscription Status)
//       // -------------------------------------------------------
//       const newStatus =
//         billingPeriod === 'monthly'
//           ? PackageStatus.PREMIUM_MONTHLY
//           : PackageStatus.PREMIUM_YEARLY;

//       await this.prisma.user.update({
//         where: { id: userId },
//         data: {
//           package_status: newStatus,
//           subscription_status: 'active',
//           current_period_start: new Date(),
//           current_period_end: payment.expirationDate,
//         },
//       });

//       // -------------------------------------------------------
//       // Create User Subscription (Prevent Unique Error)
//       // -------------------------------------------------------
//       const uniqueSubId = `one-time-${paymentId}`;

//       await this.prisma.userSubscription.create({
//         data: {
//           user_id: userId,
//           plan_type: planType,
//           plan_id: payment.basicPackageId ?? payment.comboPlanId,

//           billing_cycle: billingPeriod,
//           status: 'active',

//           // base_price: Number(payment.amount),
//           // subtotal: Number(payment.amount),
//           // total_amount: Number(payment.finalAmount),

//           base_price: Number(payment.amount),     // BEFORE discount
//           subtotal: Number(payment.amount),       // BEFORE discount
//           total_amount: Number(payment.finalAmount), // AFTER discount


//           user_count: 1,
//           workspace_count: 1,
//           selected_modules: [],
//           coupon_code: payment.couponCode ?? null,

//           current_period_start: new Date(),
//           current_period_end: payment.expirationDate,
//           next_billing_date: payment.expirationDate,

//           stripe_subscription_id: uniqueSubId, // <-- FIXED
//           stripe_customer_id: payment.stripeCustomerId || 'none',
//         },
//       });

//       console.log('🎉 Subscription created successfully for user:', userId);
//     }

//     return { success: true };
//   }
// }


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

    // ------------------------------------------------------------------
    //  MAIN EVENT: checkout.session.completed
    // ------------------------------------------------------------------

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType;
      const billingPeriod = session.metadata?.billingPeriod;

      if (!paymentId || !userId) {
        console.error('❌ Missing metadata in checkout session');
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
      // Fetch Payment (needed for amount values)
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
      // Update USER subscription status
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
      // Create User Subscription Record (use counts from payment.metadata)
      // -------------------------------------------------------
      const uniqueSubId = `one-time-${paymentId}`; // prevents unique error

      // Read counts/modules from payment.metadata (stored at payment creation)
      const meta: any = (payment.metadata as any) ?? {};
      const userCount = Number(meta.user_count ?? 1);
      const workspaceCount = Number(meta.workspace_count ?? 1);
      const selectedModuleIds = Array.isArray(meta.selected_modules) ? meta.selected_modules : [];

      // Fetch module details to check names
      const moduleDetails = selectedModuleIds.length > 0
        ? await this.prisma.modulePrice.findMany({
          where: { id: { in: selectedModuleIds } },
          select: { id: true, name: true },
        })
        : [];

      // Check if CRM or Accounting modules are included
      const moduleNames = moduleDetails.map(m => m.name.toLowerCase());
      const hasCrmModule = moduleNames.some(name => name.includes('crm'));
      const hasAccountingModule = moduleNames.some(name => name.includes('accounting'));

      await this.prisma.userSubscription.create({
        data: {
          user_id: userId,
          plan_type: planType,
          plan_id: payment.basicPackageId ?? payment.comboPlanId,

          billing_cycle: billingPeriod,
          status: 'active',

          // FINANCIALS (correct)
          base_price: Number(payment.amount),
          subtotal: Number(payment.amount),
          total_amount: Number(payment.finalAmount),

          user_count: userCount,
          workspace_count: workspaceCount,
          selected_modules: selectedModuleIds,

          // Set addon flags based on included modules
          Crm_for_addons: hasCrmModule,
          Accounting_for_addons: hasAccountingModule,

          coupon_code: payment.couponCode ?? null,

          current_period_start: new Date(),
          current_period_end: payment.expirationDate,
          next_billing_date: payment.expirationDate,

          stripe_subscription_id: uniqueSubId,
          stripe_customer_id: payment.stripeCustomerId || 'none',
        },
      });

      console.log('🎉 Subscription created for user:', userId, 'users:', userCount, 'workspaces:', workspaceCount);
    }

    return { success: true };
  }
}
