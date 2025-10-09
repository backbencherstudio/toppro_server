import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
// import { PrismaService } from 'src/prisma.service';   // Import your Prisma service

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    // this.stripe = new Stripe('your-stripe-secret-key', {
    //   apiVersion: '2025-03-31.basil', 
    // });
  }

  // Create a checkout session
  async createCheckoutSession(userId: string, subscriptionId: string, paymentMethodId: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Your Subscription Plan',
            },
            unit_amount: 1000 * 10, // Adjust price as needed
          },
          quantity: 1,
        },
      ],
      mode: 'subscription', // 'subscription' for recurring, 'payment' for one-time
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    // Save payment transaction in the database using Prisma
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        user_id: userId,
        subscription_id: subscriptionId,
        amount: 1000, // Example amount
        status: 'pending',
        provider: 'stripe',
        reference_number: session.id,
      },
    });

    return { url: session.url };
  }

  // Handle the webhook from Stripe
  async handleWebhook(payload: any) {
    const sig = payload.headers['stripe-signature'];

    // Construct the event from the webhook payload and signature
    const event = this.stripe.webhooks.constructEvent(payload.body, sig, 'your-webhook-secret');

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Retrieve the payment intent associated with the session
       //@ts-ignore
      const paymentIntent = await this.stripe.paymentIntents.retrieve(session.payment_intent);

      // Find the payment transaction in your database using the session ID
      const transaction = await this.prisma.paymentTransaction.findUnique({
        //@ts-ignore
        where: { reference_number: session.id },
      });

      if (transaction) {
        // Update the transaction status to 'completed' if it's found
        await this.prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: 'completed' },
        });

        // Handle the subscription process
        const subscription = await this.createOrUpdateSubscription(session, transaction);

        // Optional: Link any add-ons or channels if the subscription includes them
        await this.linkAddonsAndChannels(subscription, session);
      }

      // Further logic to handle user assignment, email notifications, etc.
    }

    return { received: true };
  }

  // Create or update the subscription in the database
  private async createOrUpdateSubscription(session: Stripe.Checkout.Session, transaction: any) {
    const userId = transaction.user_id;
    const serviceTierId = session.line_items[0].price_data.product_data.name; // Example, you can use actual service tier details

    // Check if the user already has a subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { user_id: userId, status: 1 }, // Active subscriptions
    });

    if (existingSubscription) {
      // Update the existing subscription if needed
      return await this.prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 1,  // Active
          end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Assuming a 30-day subscription
        },
      });
    } else {
      // Create a new subscription if none exists
      return await this.prisma.subscription.create({
        data: {
          user_id: userId,
          service_tier_id: serviceTierId,
          service_id: session.id,  // Can be mapped based on the service
          start_at: new Date(),
          end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Set end date
          status: 1,  // Active
        },
      });
    }
  }

  // Link add-ons and channels to the subscription (if applicable)
  private async linkAddonsAndChannels(subscription: any, session: Stripe.Checkout.Session) {
    // Assuming the session contains the required add-ons and channels for this subscription
    // You would check if the session has any add-ons or channels and associate them

    // Example for linking add-ons (if applicable)
    for (const addon of session.metadata.addons || []) {
      await this.prisma.subscriptionAddon.create({
         //@ts-ignore
        data: {
          subscription_id: subscription.id,
          // addon_id: addon.id,  // Assuming the addon ID is passed in metadata
          // quantity: addon.quantity,
        },
      });
    }

    // Example for linking channels (if applicable)
    for (const channel of session.metadata.channels || []) {
      await this.prisma.subscriptionChannel.create({
        //@ts-ignore
        data: {
          subscription_id: subscription.id,
          // channel_id: channel.id,  // Assuming the channel ID is passed in metadata
          // is_free: channel.is_free,
          // price: channel.price,
        },
      });
    }
  }
}
