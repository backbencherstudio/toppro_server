import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeSubscriptionService } from './stripe-subscription.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  public stripe: Stripe;

  constructor(
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-09-30.clover',
    });
  }

  // Create a checkout session (legacy method - use dynamic subscriptions instead)
  async createCheckoutSession(userId: string, subscriptionId: string, paymentMethodId: string) {
    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email!,
        name: user.name!,
        metadata: { user_id: userId }
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripe_customer_id: stripeCustomerId }
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: await this.createOrGetProduct('basic', 'monthly'),
            unit_amount: 5000, // $50.00 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        user_id: userId,
        subscription_id: subscriptionId,
      },
    });

    // Save payment transaction in the database
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        user_id: userId,
        subscription_id: subscriptionId,
        amount: 50.00, // $50.00
        status: 'pending',
        provider: 'stripe',
        reference_number: session.id,
      },
    });

    return {
      url: session.url,
      session_id: session.id,
      transaction_id: transaction.id
    };
  }

  // Handle the webhook from Stripe
  async handleWebhook(payload: any, signature: string) {
    try {
      // Verify webhook signature
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed':
          // These subscription events are handled separately
          console.log(`Subscription event: ${event.type}`);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid signature');
    }
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    // Update payment transaction status
    await this.prisma.paymentTransaction.updateMany({
      where: { reference_number: paymentIntent.id },
      data: { status: 'succeeded' }
    });
  }

  private async handlePaymentFailure(paymentIntent: any) {
    // Update payment transaction status
    await this.prisma.paymentTransaction.updateMany({
      where: { reference_number: paymentIntent.id },
      data: { status: 'failed' }
    });
  }

  // Create or get Stripe product
  private async createOrGetProduct(planType: string, billingCycle: string): Promise<string> {
    const productName = `${planType === 'basic' ? 'Basic Plan' : 'Combo Plan'} - ${billingCycle}`;

    // Try to find existing product
    const products = await this.stripe.products.list({
      limit: 100,
    });

    const existingProduct = products.data.find(p => p.name === productName);
    if (existingProduct) {
      return existingProduct.id;
    }

    // Create new product if not found
    const product = await this.stripe.products.create({
      name: productName,
      description: `Dynamic subscription for ${planType} plan with ${billingCycle} billing`,
      type: 'service',
    });

    return product.id;
  }

  // Create payment intent for one-time payments
  async createPaymentIntent(amount: number, currency: string, customerId: string, metadata?: any) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  }

  // Get customer details
  async getCustomer(customerId: string) {
    return await this.stripe.customers.retrieve(customerId);
  }

  // Create customer
  async createCustomer(email: string, name: string, metadata?: any) {
    return await this.stripe.customers.create({
      email,
      name,
      metadata: metadata || {},
    });
  }

  // Update customer
  async updateCustomer(customerId: string, data: any) {
    return await this.stripe.customers.update(customerId, data);
  }

  // Get payment methods for customer
  async getCustomerPaymentMethods(customerId: string) {
    return await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
  }

  // Attach payment method to customer
  async attachPaymentMethod(paymentMethodId: string, customerId: string) {
    return await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  // Detach payment method from customer
  async detachPaymentMethod(paymentMethodId: string) {
    return await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  // Set default payment method
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    return await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  // Create test payment method for testing
  async createTestPaymentMethod(userId: string) {
    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email!,
        name: user.name!,
        metadata: { user_id: userId }
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripe_customer_id: stripeCustomerId }
      });
    }

    // Use Stripe's test payment method tokens instead of raw card data
    const testPaymentMethods = [
      'pm_card_visa',           // Visa
      'pm_card_mastercard',     // Mastercard
      'pm_card_amex',           // American Express
      'pm_card_visa_debit',     // Visa Debit
    ];

    // Use the first test payment method
    const paymentMethodId = testPaymentMethods[0];

    // Attach to customer
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set as default
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return {
      paymentMethodId: paymentMethodId,
      customerId: stripeCustomerId,
      message: 'Test payment method attached successfully',
      availableTestMethods: testPaymentMethods
    };
  }

}