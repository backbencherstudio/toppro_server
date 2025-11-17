import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  public stripe: Stripe;
  public currency: string;

  constructor(private config: ConfigService) {
    const secret = this.config.get<string>('stripe.secretKey');

    if (!secret) {
      throw new Error('❌ STRIPE_SECRET_KEY is missing!');
    }

    this.currency = this.config.get<string>('stripe.currency') || 'usd';

    this.stripe = new Stripe(secret);
  }

  createPaymentIntent(amount: number, metadata: Record<string, any>) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: this.currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  retrieveIntent(intentId: string) {
    return this.stripe.paymentIntents.retrieve(intentId, {
      expand: ['charges'],
    });
  }
}
