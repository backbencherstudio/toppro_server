import Stripe from 'stripe';

// If you're on a recent Stripe version, this is fine.
// If you get an error with apiVersion, remove it or update the Stripe lib.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const StripePayment = {
  createCustomer: async ({
    user_id,
    name,
    email,
  }: {
    user_id: string;
    name: string;
    email: string;
  }) => {
    return await stripe.customers.create({
      email,
      name,
      metadata: { user_id },
    });
  },

  createPaymentIntent: async ({
    amount,
    currency,
    customer_id,
    metadata,
  }: {
    amount: number;
    currency: string;
    customer_id: string;
    metadata?: Record<string, string>;
  }) => {
    return await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects smallest currency unit
      currency,
      customer: customer_id,
      confirm: true,
      payment_method: metadata?.payment_method_id,
      metadata,
      // ✅ Prevents redirect-based payment methods like iDEAL, SEPA, etc.
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
  },

  handleWebhook: async (
    rawBody: string,
    sig: string | string[]
  ): Promise<Stripe.Event> => {
    return stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  },
};