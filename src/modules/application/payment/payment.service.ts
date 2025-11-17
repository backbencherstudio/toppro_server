import { Injectable, NotFoundException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BasicPlanService } from '../subscription plan/basic-plan/basic-plan.service';
import { ComboPlanService } from '../subscription plan/combo-plan/combo-plan.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
    private basicPlanService: BasicPlanService,
    private comboPlanService: ComboPlanService,
  ) { }


  async initializePayment(dto: any) {
    const {
      userId,
      planId,
      billingPeriod,
      users,
      workspaces,
      moduleIds,
      couponCode,
    } = dto;

    // 🔥 AUTO DETECT planType = basic | combo
    const { type: planType } = await this.detectPlanType(planId);

    let calculation;

    if (planType === 'basic') {
      calculation = await this.calculateBasicPlan(
        users,
        workspaces,
        billingPeriod,
        moduleIds,
        couponCode
      );
    } else {
      calculation = await this.calculateComboPlan(
        planId,
        billingPeriod,
        couponCode
      );
    }

    if (!calculation) {
      throw new Error('Price calculation failed');
    }

    const amount = calculation.summary.total;
    const email = await this.getUserEmail(userId);

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        email,
        monthly: billingPeriod === 'monthly',
        yearly: billingPeriod === 'yearly',
        amount,
        finalAmount: amount,
        currency: 'USD',
        basicPackageId: planType === 'basic' ? planId : null,
        comboPlanId: planType === 'combo' ? planId : null,
        expirationDate: this.getExpirationDate(billingPeriod),
        paymentStatus: 'pending',
        couponCode: couponCode ?? null,
      }
    });

    // 💳 Create Payment Intent
    const intent = await this.stripe.createPaymentIntent(amount, {
      paymentId: payment.id,
      userId,
      planType,
      billingPeriod,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { stripePaymentIntentId: intent.id }
    });

    // OPTIONAL: Checkout URL
    const session = await this.stripe.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${planType} plan` },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentId: payment.id,
        userId,
        planType,
        billingPeriod,
      },
      // success_url: 'https://lenses-anderson-weeks-surfing.trycloudflare.com/api/payment-success?session_id={CHECKOUT_SESSION_ID}',
      // cancel_url: 'https://lenses-anderson-weeks-surfing.trycloudflare.com/api/payment-cancelled',
      success_url: 'http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/payment-cancel',
    });

    return {
      clientSecret: intent.client_secret,
      checkoutUrl: session.url,
      paymentId: payment.id,
      amount,
    };
  }


  async detectPlanType(planId: string) {
    // Check Basic Package
    const basic = await this.prisma.basicPackage.findUnique({
      where: { id: planId },
      select: { id: true, type: true }
    });

    if (basic) {
      return { type: 'basic', plan: basic };
    }

    // Check Combo Plan
    const combo = await this.prisma.comboPlan.findUnique({
      where: { id: planId },
      select: { id: true, type: true }
    });

    if (combo) {
      return { type: 'combo', plan: combo };
    }

    throw new NotFoundException('Invalid planId — no plan found.');
  }

  /**
   * Fetch User Email
   */
  async getUserEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user.email;
  }

  /**
   * Generate Expiration Date
   */
  // getExpirationDate(period: 'monthly' | 'yearly') {
  //   const d = new Date();
  //   if (period === 'monthly') d.setDate(d.getDate() + 30);
  //   else d.setFullYear(d.getFullYear() + 1);
  //   return d;
  // }

  getExpirationDate(period: 'monthly' | 'yearly') {
    const now = new Date();

    if (period === 'monthly') {
      now.setUTCDate(now.getUTCDate() + 30);
    } else {
      now.setUTCFullYear(now.getUTCFullYear() + 1);
    }

    return new Date(now.toISOString());  // always UTC
  }


  /**
   * ---------------------------------------------------
   *  BASIC PLAN PRICE CALCULATION...................................
   * ---------------------------------------------------
   */
  async calculateBasicPlan(
    users: number,
    workspaces: number,
    billingPeriod: 'monthly' | 'yearly',
    moduleIds: string[],
    couponCode?: string
  ) {
    return this.basicPlanService.calculatePrice(
      users,
      workspaces,
      billingPeriod,
      moduleIds,
      couponCode
    );
  }

  /**
   * ---------------------------------------------------
   *  COMBO PLAN PRICE CALCULATION...........................................
   * ---------------------------------------------------
   */
  async calculateComboPlan(
    planId: string,
    billingPeriod: 'monthly' | 'yearly',
    couponCode?: string
  ) {
    return this.comboPlanService.calculatePrice(
      planId,
      billingPeriod,
      couponCode
    );
  }
}
