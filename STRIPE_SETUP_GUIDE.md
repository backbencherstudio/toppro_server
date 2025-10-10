# 🚀 Stripe Dynamic Subscription Setup Guide

## 📋 Overview

This guide will help you set up Stripe dynamic subscriptions for your NestJS application with the following features:

- **Dynamic Pricing**: Each user pays exactly what they selected (base plan + add-ons)
- **Flexible Plans**: Support for both Basic Plans (per-user/workspace) and Combo Plans (fixed pricing)
- **Automatic Proration**: Stripe handles mid-cycle changes automatically
- **Coupon Support**: Percentage and fixed amount discounts
- **Webhook Integration**: Real-time subscription status updates

## 🔧 Environment Setup

### 1. Install Dependencies

```bash
npm install stripe @nestjs/swagger
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook endpoint secret
STRIPE_CURRENCY=usd
STRIPE_API_VERSION=2023-10-16

# Frontend URLs
FRONTEND_URL=http://localhost:3000
```

### 3. Database Migration

Run the migration to add Stripe fields:

```bash
npx prisma migrate dev --name add_stripe_subscription_fields
npx prisma generate
```

## 🎯 Stripe Dashboard Setup

### 1. Create Webhook Endpoint

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL: `https://yourdomain.com/stripe/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 2. Get Webhook Secret

After creating the webhook, copy the "Signing secret" and add it to your `.env` file.

## 📚 API Endpoints

### Create Dynamic Subscription

```http
POST /stripe/subscriptions/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "planType": "basic", // or "combo"
  "planId": "clx1234567890",
  "userCount": 5,
  "workspaceCount": 2,
  "selectedModules": ["mod1", "mod2", "mod3"],
  "billingCycle": "monthly", // or "yearly"
  "couponCode": "SAVE20", // optional
  "paymentMethodId": "pm_1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "subscription": {
    "id": "sub_1234567890",
    "stripe_subscription_id": "sub_stripe_123",
    "status": "incomplete",
    "client_secret": "pi_1234567890_secret_...",
    "current_period_end": "2024-02-01T00:00:00.000Z",
    "pricing": {
      "calculation": { ... },
      "summary": { ... }
    }
  }
}
```

### Update Subscription

```http
PATCH /stripe/subscriptions/:id/update
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userCount": 10,
  "workspaceCount": 3,
  "selectedModules": ["mod1", "mod4", "mod5"],
  "couponCode": "SAVE30"
}
```

### Get Subscription Details

```http
GET /stripe/subscriptions/:id
Authorization: Bearer <jwt_token>
```

### Cancel Subscription

```http
DELETE /stripe/subscriptions/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "cancelAtPeriodEnd": true // or false for immediate cancellation
}
```

### Get Upcoming Invoice

```http
GET /stripe/subscriptions/:id/upcoming-invoice
Authorization: Bearer <jwt_token>
```

## 🧪 Testing with Insomnia

### 1. Setup Environment

Create a new environment in Insomnia with these variables:

```json
{
  "base_url": "http://localhost:4080",
  "jwt_token": "your_jwt_token_here",
  "payment_method_id": "pm_test_1234567890"
}
```

### 2. Test Basic Plan Subscription

**Request:**

```http
POST {{base_url}}/stripe/subscriptions/create
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "planType": "basic",
  "planId": "basic_plan_id",
  "userCount": 3,
  "workspaceCount": 1,
  "selectedModules": ["module1", "module2"],
  "billingCycle": "monthly",
  "couponCode": "SAVE20",
  "paymentMethodId": "{{payment_method_id}}"
}
```

### 3. Test Combo Plan Subscription

**Request:**

```http
POST {{base_url}}/stripe/subscriptions/create
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "planType": "combo",
  "planId": "combo_plan_id",
  "userCount": 1, // Ignored for combo plans
  "workspaceCount": 1, // Ignored for combo plans
  "selectedModules": [], // Ignored for combo plans
  "billingCycle": "yearly",
  "couponCode": "SAVE30",
  "paymentMethodId": "{{payment_method_id}}"
}
```

### 4. Test Subscription Update

**Request:**

```http
PATCH {{base_url}}/stripe/subscriptions/{{subscription_id}}/update
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "userCount": 5,
  "selectedModules": ["module1", "module3", "module4"]
}
```

## 💳 Frontend Integration

### 1. Install Stripe.js

```bash
npm install @stripe/stripe-js
```

### 2. Create Payment Method

```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe('pk_test_...');

// Create payment method
const { error, paymentMethod } = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement,
  billing_details: {
    name: 'Customer Name',
    email: 'customer@example.com',
  },
});

if (error) {
  console.error('Error creating payment method:', error);
} else {
  // Use paymentMethod.id in your subscription request
  console.log('Payment method created:', paymentMethod.id);
}
```

### 3. Handle Subscription Response

```javascript
// After creating subscription
const response = await fetch('/stripe/subscriptions/create', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${jwt_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(subscriptionData),
});

const { subscription } = await response.json();

if (subscription.client_secret) {
  // Confirm payment
  const { error } = await stripe.confirmCardPayment(subscription.client_secret);

  if (error) {
    console.error('Payment failed:', error);
  } else {
    console.log('Subscription created successfully!');
  }
}
```

## 🔄 Subscription Lifecycle

### 1. Creation Flow

1. User selects plan and add-ons
2. Backend calculates dynamic pricing
3. Stripe subscription created with custom pricing
4. Payment method attached and confirmed
5. Subscription activated

### 2. Update Flow

1. User modifies plan (add/remove modules, change user count)
2. Backend recalculates pricing
3. Stripe subscription updated with new pricing
4. Proration automatically applied
5. Next invoice reflects changes

### 3. Cancellation Flow

1. User cancels subscription
2. Can cancel immediately or at period end
3. Webhook updates database status
4. User access maintained until period end (if applicable)

## 🚨 Error Handling

### Common Errors and Solutions

1. **"User already has an active subscription"**

   - Check if user has existing active subscription
   - Cancel or update existing subscription first

2. **"Invalid coupon code"**

   - Verify coupon exists and is active
   - Check expiry date and usage limits

3. **"Payment method failed"**

   - Ensure payment method is valid
   - Check card details and billing address

4. **"Webhook signature verification failed"**
   - Verify webhook secret in environment
   - Check webhook endpoint URL

## 📊 Monitoring and Analytics

### 1. Stripe Dashboard

- Monitor subscription metrics
- Track failed payments
- View customer details

### 2. Database Queries

```sql
-- Active subscriptions
SELECT * FROM user_subscriptions WHERE status = 'active';

-- Revenue by plan type
SELECT plan_type, SUM(total_amount) as revenue
FROM user_subscriptions
WHERE status = 'active'
GROUP BY plan_type;

-- Failed payments
SELECT * FROM user_subscriptions WHERE status = 'past_due';
```

## 🔒 Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Always verify webhook signatures**
3. **Use HTTPS** for all webhook endpoints
4. **Validate all input data** before processing
5. **Implement rate limiting** on API endpoints
6. **Log all payment events** for audit trails

## 🆘 Troubleshooting

### 1. Subscription Not Creating

- Check Stripe API keys
- Verify payment method is valid
- Ensure user doesn't have existing subscription

### 2. Webhook Not Working

- Verify webhook URL is accessible
- Check webhook secret matches
- Ensure webhook events are selected

### 3. Pricing Calculation Issues

- Verify plan and module IDs exist
- Check coupon validity
- Ensure user/workspace counts are positive

## 📞 Support

For issues with this implementation:

1. Check Stripe Dashboard for error details
2. Review application logs
3. Verify database schema matches Prisma models
4. Test with Stripe test cards

---

**🎉 You're all set! Your dynamic subscription system is ready to handle flexible pricing for both Basic and Combo plans with automatic proration and coupon support.**
