import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BasicPlanService } from '../subscription plan/basic-plan/basic-plan.service';
import { ComboPlanService } from '../subscription plan/combo-plan/combo-plan.service';
import { StripeService } from './stripe.service';

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
      billingPeriod,     // 'monthly' | 'yearly'
      users,
      workspaces,
      moduleIds,
      couponCode,
    } = dto;

    //  Auto detect planType = 'basic' | 'combo'
    const { type: planType } = await this.detectPlanType(planId);

    let calculation: any;

    if (planType === 'basic') {
      calculation = await this.calculateBasicPlan(
        users,
        workspaces,
        billingPeriod,
        moduleIds,
        couponCode,
      );
    } else {
      calculation = await this.calculateComboPlan(
        planId,
        billingPeriod,
        couponCode,
      );
    }

    if (!calculation || !calculation.summary) {
      throw new Error('Price calculation failed');
    }

    
    //  Correct subtotal + total handling
    let subtotal: number;

    if (planType === 'basic') {
      // from BasicPlanService.calculatePrice()
      subtotal = calculation.summary.subtotal;
    } else {
      // from ComboPlanService.calculatePrice()
      subtotal = calculation.summary['Plan Price'];
    }

    const total: number = calculation.summary.total;

    if (subtotal == null || total == null) {
      throw new Error('Subtotal/Total missing from calculation summary');
    }

    const email = await this.getUserEmail(userId);

    // CREATE PAYMENT IN DATABASE
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        email,
        monthly: billingPeriod === 'monthly',
        yearly: billingPeriod === 'yearly',

        // amount before coupon, finalAmount after coupon
        amount: subtotal,        // BEFORE discount
        finalAmount: total,      // AFTER discount

        currency: 'USD',
        basicPackageId: planType === 'basic' ? planId : null,
        comboPlanId: planType === 'combo' ? planId : null,
        expirationDate: this.getExpirationDate(billingPeriod),
        paymentStatus: 'pending',
        couponCode: couponCode ?? null,
      },
    });

   
    // CREATE STRIPE PAYMENT INTENT
    // Using FINAL amount (after coupon)
 
    const intent = await this.stripe.createPaymentIntent(total, {
      paymentId: payment.id,
      userId,
      planType,
      billingPeriod,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { stripePaymentIntentId: intent.id },
    });

    const session = await this.stripe.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${planType} plan` },
            unit_amount: total * 100, // cents
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
      success_url: 'http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/payment-cancel',
    });

    return {
      clientSecret: intent.client_secret,
      checkoutUrl: session.url,
      paymentId: payment.id,
      originalPrice: subtotal,
      finalAmount: total,
    };
  }


  async getAllPayments(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim() || '';

    
    const searchIsNumber = !isNaN(Number(search));
    const where: any = search
      ? {
        OR: [
          { id: { contains: search, mode: 'insensitive' } }, // paymentId / orderId
          { email: { contains: search, mode: 'insensitive' } },
          { paymentStatus: { contains: search, mode: 'insensitive' } },
          { couponCode: { contains: search, mode: 'insensitive' } },
          {
            user: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
          // 🔥 SEARCH PLANTYPE = basic
          ...(search.toLowerCase() === 'basic'
            ? [{ basicPackageId: { not: null } }]
            : []),

          // 🔥 SEARCH PLANTYPE = combo
          ...(search.toLowerCase() === 'combo'
            ? [{ comboPlanId: { not: null } }]
            : []),

          // 🔥 SEARCH VARIANT (monthly)
          ...(search.toLowerCase() === 'monthly'
            ? [{ monthly: true }]
            : []),

          // 🔥 SEARCH VARIANT (yearly)
          ...(search.toLowerCase() === 'yearly'
            ? [{ yearly: true }]
            : []),

          // 🔥 search amount or finalAmount
          ...(searchIsNumber
            ? [
              { amount: { equals: Number(search) } },
              { finalAmount: { equals: Number(search) } },
            ]
            : []),

        ],
      }
      : {};


    // Fetch payments with pagination + filters
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          basicPackage: {
            select: { id: true, type: true },
          },
          comboPlan: {
            select: { id: true, name: true, type: true },
          },
        },
      }),

      this.prisma.payment.count({ where }),
    ]);


    // Map Response
    const formattedData = payments.map(payment => {
      const planId = payment.basicPackageId ?? payment.comboPlanId ?? null;
      const planType =
        payment.basicPackage?.type ||
        payment.comboPlan?.type ||
        'Unknown Plan';

      const variant = payment.monthly ? 'monthly' : 'yearly';

      return {
        orderId: payment.id,
        date: payment.paymentDate,
        userId: payment.user.id,
        userName: payment.user.name,
        email: payment.user.email,
        planId,
        planType,
        amount: Number(payment.amount),
        finalAmount: Number(payment.finalAmount),
        paymentStatus: payment.paymentStatus,
        coupon: payment.couponCode ?? 'No coupon',
        variant,
        expirationDate: payment.expirationDate,
      };
    });

    return {
      Pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      data: formattedData,
    };
  }



  // PLAN TYPE DETECTION
  async detectPlanType(planId: string) {
    // Check Basic Package
    const basic = await this.prisma.basicPackage.findUnique({
      where: { id: planId },
      select: { id: true, type: true },
    });

    if (basic) {
      return { type: 'basic', plan: basic };
    }

    // Check Combo Plan
    const combo = await this.prisma.comboPlan.findUnique({
      where: { id: planId },
      select: { id: true, type: true },
    });

    if (combo) {
      return { type: 'combo', plan: combo };
    }

    throw new NotFoundException('Invalid planId — no plan found.');
  }

  // USER EMAIL FETCH
  async getUserEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user.email;
  }

  // EXPIRATION DATE
  getExpirationDate(period: 'monthly' | 'yearly') {
    const now = new Date();

    if (period === 'monthly') {
      now.setUTCDate(now.getUTCDate() + 30);
    } else {
      now.setUTCFullYear(now.getUTCFullYear() + 1);
    }

    return new Date(now.toISOString()); // always UTC
  }


  // BASIC PLAN PRICE CALCULATION
  async calculateBasicPlan(
    users: number,
    workspaces: number,
    billingPeriod: 'monthly' | 'yearly',
    moduleIds: string[],
    couponCode?: string,
  ) {
    return this.basicPlanService.calculatePrice(
      users,
      workspaces,
      billingPeriod,
      moduleIds,
      couponCode,
    );
  }

  // COMBO PLAN PRICE CALCULATION
  async calculateComboPlan(
    planId: string,
    billingPeriod: 'monthly' | 'yearly',
    couponCode?: string,
  ) {
    return this.comboPlanService.calculatePrice(
      planId,
      billingPeriod,
      couponCode,
    );
  }

  //Delete Payment Record
  async deletePayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.prisma.payment.delete({ where: { id: paymentId } });
  }
}
