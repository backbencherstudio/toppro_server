import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BasicPlanService } from 'src/modules/application/subscription plan/basic-plan/basic-plan.service';
import { ComboPlanService } from 'src/modules/application/subscription plan/combo-plan/combo-plan.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import Stripe from 'stripe';

@Injectable()
export class StripeSubscriptionService {
    private stripe: Stripe;

    constructor(
        private prisma: PrismaService,
        private basicPlanService: BasicPlanService,
        private comboPlanService: ComboPlanService,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2025-09-30.clover',
        });
    }

    /**
     * Pay for Basic Plan - Use existing calculation
     */
    async payBasicPlan(userId: string, body: {
        users: number;
        workspaces: number;
        billingPeriod: 'monthly' | 'yearly';
        moduleIds: string[];
        couponCode?: string;
        paymentMethodId: string;
    }) {
        // Use your existing basic plan calculation
        const pricingData = await this.basicPlanService.calculatePrice(
            body.users,
            body.workspaces,
            body.billingPeriod,
            body.moduleIds,
            body.couponCode
        );

        const totalAmount = pricingData.summary.total;

        // Get or create Stripe customer
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        let stripeCustomerId = user.stripe_customer_id;
        if (!stripeCustomerId) {
            const customer = await this.stripe.customers.create({
                email: user.email!,
                name: user.name!,
                metadata: { user_id: userId }
            });
            stripeCustomerId = customer.id;
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripe_customer_id: stripeCustomerId }
            });
        }

        // Attach payment method (with error handling)
        try {
            await this.stripe.paymentMethods.attach(body.paymentMethodId, { customer: stripeCustomerId });
        } catch (error) {
            // If payment method is already attached to another customer or not attached, detach it first
            if (error.message.includes('already attached to another customer') ||
                error.message.includes('does not have a payment method with the ID')) {
                try {
                    await this.stripe.paymentMethods.detach(body.paymentMethodId);
                } catch (detachError) {
                    // Ignore detach errors if payment method is not attached
                }
                await this.stripe.paymentMethods.attach(body.paymentMethodId, { customer: stripeCustomerId });
            } else {
                throw error;
            }
        }

        await this.stripe.customers.update(stripeCustomerId, {
            invoice_settings: { default_payment_method: body.paymentMethodId }
        });

        // Create subscription
        const subscription = await this.stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{
                price_data: {
                    currency: 'usd',
                    product: await this.createOrGetProduct('basic', body.billingPeriod),
                    unit_amount: Math.round(totalAmount * 100),
                    recurring: { interval: body.billingPeriod === 'yearly' ? 'year' : 'month' },
                },
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        // Update user status
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                stripe_subscription_id: subscription.id,
                subscription_status: subscription.status,
                current_period_start: new Date((subscription as any).current_period_start * 1000),
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                package_status: body.billingPeriod === 'yearly' ? 'PREMIUM_YEARLY' : 'PREMIUM_MONTHLY',
            }
        });

        return {
            success: true,
            subscription_id: subscription.id,
            client_secret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
            amount: totalAmount,
            pricing: pricingData
        };
    }

    /**
     * Pay for Combo Plan - Use existing calculation
     */
    async payComboPlan(userId: string, body: {
        planId: string;
        billingPeriod: 'monthly' | 'yearly';
        couponCode?: string;
        paymentMethodId: string;
    }) {
        // Use your existing combo plan calculation
        const pricingData = await this.comboPlanService.calculatePrice(
            body.planId,
            body.billingPeriod,
            body.couponCode
        );

        const totalAmount = pricingData.summary.total;

        // Get or create Stripe customer
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        let stripeCustomerId = user.stripe_customer_id;
        if (!stripeCustomerId) {
            const customer = await this.stripe.customers.create({
                email: user.email!,
                name: user.name!,
                metadata: { user_id: userId }
            });
            stripeCustomerId = customer.id;
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripe_customer_id: stripeCustomerId }
            });
        }

        // Attach payment method (with error handling)
        try {
            await this.stripe.paymentMethods.attach(body.paymentMethodId, { customer: stripeCustomerId });
        } catch (error) {
            // If payment method is already attached to another customer or not attached, detach it first
            if (error.message.includes('already attached to another customer') ||
                error.message.includes('does not have a payment method with the ID')) {
                try {
                    await this.stripe.paymentMethods.detach(body.paymentMethodId);
                } catch (detachError) {
                    // Ignore detach errors if payment method is not attached
                }
                await this.stripe.paymentMethods.attach(body.paymentMethodId, { customer: stripeCustomerId });
            } else {
                throw error;
            }
        }

        await this.stripe.customers.update(stripeCustomerId, {
            invoice_settings: { default_payment_method: body.paymentMethodId }
        });

        // Create subscription
        const subscription = await this.stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{
                price_data: {
                    currency: 'usd',
                    product: await this.createOrGetProduct('combo', body.billingPeriod),
                    unit_amount: Math.round(totalAmount * 100),
                    recurring: { interval: body.billingPeriod === 'yearly' ? 'year' : 'month' },
                },
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        // Update user status
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                stripe_subscription_id: subscription.id,
                subscription_status: subscription.status,
                current_period_start: new Date((subscription as any).current_period_start * 1000),
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                package_status: body.billingPeriod === 'yearly' ? 'PREMIUM_YEARLY' : 'PREMIUM_MONTHLY',
            }
        });

        return {
            success: true,
            subscription_id: subscription.id,
            client_secret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
            amount: totalAmount,
            pricing: pricingData
        };
    }

    /**
     * Create subscription from calculation result (simplified approach)
     */
    async createSubscriptionFromCalculation(userId: string, body: {
        planType: string;
        planId: string;
        paymentMethodId: string;
        couponCode?: string;
        userCount?: number;
        workspaceCount?: number;
        selectedModules?: string[];
        billingCycle?: 'monthly' | 'yearly';
    }) {
        // Get user's current calculation parameters from database or use provided ones
        const userCount = body.userCount || 1;
        const workspaceCount = body.workspaceCount || 1;
        const selectedModules = body.selectedModules || [];
        const billingCycle = body.billingCycle || 'monthly';

        // Use your existing calculation logic
        let pricingData;
        if (body.planType === 'basic') {
            pricingData = await this.basicPlanService.calculatePrice(
                userCount,
                workspaceCount,
                billingCycle,
                selectedModules,
                body.couponCode
            );
        } else {
            pricingData = await this.comboPlanService.calculatePrice(
                body.planId,
                billingCycle,
                body.couponCode
            );
        }

        const totalAmount = pricingData.summary.total;
        const subtotal = pricingData.summary.subtotal || totalAmount;
        const discountAmount = pricingData.summary['Coupon Discount'] || 0;

        // Get or create Stripe customer
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        let stripeCustomerId = user.stripe_customer_id;
        if (!stripeCustomerId) {
            const customer = await this.stripe.customers.create({
                email: user.email!,
                name: user.name!,
                metadata: { user_id: userId }
            });
            stripeCustomerId = customer.id;

            await this.prisma.user.update({
                where: { id: userId },
                data: { stripe_customer_id: stripeCustomerId }
            });
        }

        // Attach payment method to customer (with error handling)
        try {
            await this.stripe.paymentMethods.attach(body.paymentMethodId, {
                customer: stripeCustomerId,
            });
        } catch (error) {
            // If payment method is already attached to another customer, detach it first
            if (error.message.includes('already attached to another customer')) {
                await this.stripe.paymentMethods.detach(body.paymentMethodId);
                await this.stripe.paymentMethods.attach(body.paymentMethodId, {
                    customer: stripeCustomerId,
                });
            } else {
                throw error;
            }
        }

        // Set as default payment method
        await this.stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
                default_payment_method: body.paymentMethodId,
            },
        });

        // Create dynamic subscription with calculated pricing
        const subscription = await this.stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{
                price_data: {
                    currency: 'usd',
                    product: await this.createOrGetProduct(body.planType, billingCycle),
                    unit_amount: Math.round(totalAmount * 100), // Convert to cents
                    recurring: {
                        interval: billingCycle === 'yearly' ? 'year' : 'month',
                    },
                },
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                user_id: userId,
                plan_type: body.planType,
                plan_id: body.planId,
                user_count: userCount.toString(),
                workspace_count: workspaceCount.toString(),
                selected_modules: JSON.stringify(selectedModules),
                coupon_code: body.couponCode || '',
                billing_cycle: billingCycle,
            },
        });

        // Save subscription to database
        const userSubscription = await this.prisma.userSubscription.create({
            data: {
                user_id: userId,
                plan_type: body.planType,
                plan_id: body.planId,
                base_price: subtotal,
                user_count: userCount,
                workspace_count: workspaceCount,
                selected_modules: selectedModules,
                coupon_code: body.couponCode,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: stripeCustomerId,
                status: subscription.status,
                billing_cycle: billingCycle,
                current_period_start: new Date((subscription as any).current_period_start * 1000),
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                next_billing_date: new Date((subscription as any).current_period_end * 1000),
                subtotal: subtotal,
                discount_amount: discountAmount,
                total_amount: totalAmount,
                metadata: pricingData,
            }
        });

        // Update user subscription status
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                stripe_subscription_id: subscription.id,
                subscription_status: subscription.status,
                current_period_start: new Date((subscription as any).current_period_start * 1000),
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                package_status: billingCycle === 'yearly' ? 'PREMIUM_YEARLY' : 'PREMIUM_MONTHLY',
            }
        });

        return {
            success: true,
            subscription: {
                id: userSubscription.id,
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                client_secret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                pricing: pricingData,
            }
        };
    }

    /**
     * Create a new dynamic subscription
     */
    async createSubscription(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
        const { planType, planId, userCount, workspaceCount, selectedModules, billingCycle, couponCode, paymentMethodId } = createSubscriptionDto;

        // Get user details
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user already has an active subscription
        const existingSubscription = await this.prisma.userSubscription.findFirst({
            where: {
                user_id: userId,
                status: { in: ['active', 'past_due', 'incomplete'] }
            }
        });

        if (existingSubscription) {
            throw new BadRequestException('User already has an active subscription');
        }

        // Calculate pricing based on plan type
        let pricingData;
        if (planType === 'basic') {
            pricingData = await this.basicPlanService.calculatePrice(
                userCount,
                workspaceCount,
                billingCycle,
                selectedModules,
                couponCode
            );
        } else {
            pricingData = await this.comboPlanService.calculatePrice(
                planId,
                billingCycle,
                couponCode
            );
        }

        const totalAmount = pricingData.summary.total;
        const subtotal = pricingData.summary.subtotal || totalAmount;
        const discountAmount = pricingData.summary['Coupon Discount'] || 0;

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

        // Attach payment method to customer
        await this.stripe.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomerId,
        });

        // Set as default payment method
        await this.stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Create dynamic subscription with custom pricing
        const subscription = await this.stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{
                price_data: {
                    currency: 'usd',
                    product: await this.createOrGetProduct(planType, billingCycle),
                    unit_amount: Math.round(totalAmount * 100), // Convert to cents
                    recurring: {
                        interval: billingCycle === 'yearly' ? 'year' : 'month',
                    },
                },
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                user_id: userId,
                plan_type: planType,
                plan_id: planId,
                user_count: userCount.toString(),
                workspace_count: workspaceCount.toString(),
                selected_modules: JSON.stringify(selectedModules),
                coupon_code: couponCode || '',
                billing_cycle: billingCycle,
            },
        });

        // Save subscription to database
        const userSubscription = await this.prisma.userSubscription.create({
            data: {
                user_id: userId,
                plan_type: planType,
                plan_id: planId,
                base_price: Math.round(subtotal * 100),
                user_count: userCount,
                workspace_count: workspaceCount,
                selected_modules: selectedModules,
                coupon_code: couponCode,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: stripeCustomerId,
                status: subscription.status,
                billing_cycle: billingCycle,
                current_period_start: new Date((subscription as any).current_period_start * 1000),
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                next_billing_date: new Date((subscription as any).current_period_end * 1000),
                subtotal: subtotal,
                discount_amount: discountAmount,
                total_amount: totalAmount,
                metadata: pricingData,
            }
        });

        // Update user subscription status
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                stripe_subscription_id: subscription.id,
                subscription_status: subscription.status,
                current_period_start: new Date((subscription as any).current_period_start * 1000),
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                package_status: billingCycle === 'yearly' ? 'PREMIUM_YEARLY' : 'PREMIUM_MONTHLY',
            }
        });

        return {
            success: true,
            subscription: {
                id: userSubscription.id,
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                client_secret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                pricing: pricingData,
            }
        };
    }

    /**
     * Update existing subscription (add/remove modules, change user count)
     */
    async updateSubscription(subscriptionId: string, updateSubscriptionDto: UpdateSubscriptionDto) {
        const userSubscription = await this.prisma.userSubscription.findUnique({
            where: { id: subscriptionId },
            include: { user: true }
        });

        if (!userSubscription) {
            throw new NotFoundException('Subscription not found');
        }

        if (userSubscription.status !== 'active') {
            throw new BadRequestException('Can only update active subscriptions');
        }

        // Get current values or use updated ones
        const userCount = updateSubscriptionDto.userCount ?? userSubscription.user_count;
        const workspaceCount = updateSubscriptionDto.workspaceCount ?? userSubscription.workspace_count;
        const selectedModules = updateSubscriptionDto.selectedModules ?? userSubscription.selected_modules;
        const couponCode = updateSubscriptionDto.couponCode ?? userSubscription.coupon_code;

        // Recalculate pricing
        let pricingData;
        if (userSubscription.plan_type === 'basic') {
            pricingData = await this.basicPlanService.calculatePrice(
                userCount,
                workspaceCount,
                userSubscription.billing_cycle as 'monthly' | 'yearly',
                selectedModules,
                couponCode
            );
        } else {
            pricingData = await this.comboPlanService.calculatePrice(
                userSubscription.plan_id!,
                userSubscription.billing_cycle as 'monthly' | 'yearly',
                couponCode
            );
        }

        const newTotalAmount = pricingData.summary.total;
        const newSubtotal = pricingData.summary.subtotal || newTotalAmount;
        const newDiscountAmount = pricingData.summary['Coupon Discount'] || 0;

        // Update Stripe subscription with new pricing
        const stripeSubscription = await this.stripe.subscriptions.retrieve(userSubscription.stripe_subscription_id);

        // Update the subscription item with new price
        await this.stripe.subscriptions.update(userSubscription.stripe_subscription_id, {
            items: [{
                id: stripeSubscription.items.data[0].id,
                price_data: {
                    currency: 'usd',
                    product: await this.createOrGetProduct(userSubscription.plan_type, userSubscription.billing_cycle),
                    unit_amount: Math.round(newTotalAmount * 100),
                    recurring: {
                        interval: userSubscription.billing_cycle === 'yearly' ? 'year' : 'month',
                    },
                },
            }],
            proration_behavior: 'create_prorations', // Automatically handle proration
            metadata: {
                user_id: userSubscription.user_id,
                plan_type: userSubscription.plan_type,
                plan_id: userSubscription.plan_id!,
                user_count: userCount.toString(),
                workspace_count: workspaceCount.toString(),
                selected_modules: JSON.stringify(selectedModules),
                coupon_code: couponCode || '',
                billing_cycle: userSubscription.billing_cycle,
            },
        });

        // Update database
        const updatedSubscription = await this.prisma.userSubscription.update({
            where: { id: subscriptionId },
            data: {
                user_count: userCount,
                workspace_count: workspaceCount,
                selected_modules: selectedModules,
                coupon_code: couponCode,
                base_price: Math.round(newSubtotal * 100),
                subtotal: newSubtotal,
                discount_amount: newDiscountAmount,
                total_amount: newTotalAmount,
                metadata: pricingData,
                updated_at: new Date(),
            }
        });

        return {
            success: true,
            subscription: updatedSubscription,
            pricing: pricingData,
            message: 'Subscription updated successfully. Proration will be applied to your next invoice.'
        };
    }

    /**
     * Get subscription details
     */
    async getSubscription(subscriptionId: string) {
        const userSubscription = await this.prisma.userSubscription.findUnique({
            where: { id: subscriptionId },
            include: { user: true }
        });

        if (!userSubscription) {
            throw new NotFoundException('Subscription not found');
        }

        // Get Stripe subscription details
        const stripeSubscription = await this.stripe.subscriptions.retrieve(userSubscription.stripe_subscription_id);

        return {
            success: true,
            subscription: {
                ...userSubscription,
                stripe_details: {
                    status: stripeSubscription.status,
                    current_period_start: new Date((stripeSubscription as any).current_period_start * 1000),
                    current_period_end: new Date((stripeSubscription as any).current_period_end * 1000),
                    cancel_at_period_end: (stripeSubscription as any).cancel_at_period_end,
                }
            }
        };
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
        const userSubscription = await this.prisma.userSubscription.findUnique({
            where: { id: subscriptionId }
        });

        if (!userSubscription) {
            throw new NotFoundException('Subscription not found');
        }

        // Cancel in Stripe
        const stripeSubscription = await this.stripe.subscriptions.update(userSubscription.stripe_subscription_id, {
            cancel_at_period_end: cancelAtPeriodEnd,
        });

        // Update database
        const updatedSubscription = await this.prisma.userSubscription.update({
            where: { id: subscriptionId },
            data: {
                status: cancelAtPeriodEnd ? 'canceled' : 'canceled',
                updated_at: new Date(),
            }
        });

        // Update user status
        await this.prisma.user.update({
            where: { id: userSubscription.user_id },
            data: {
                subscription_status: cancelAtPeriodEnd ? 'canceled' : 'canceled',
                cancel_at_period_end: cancelAtPeriodEnd,
                package_status: 'FREE',
            }
        });

        return {
            success: true,
            subscription: updatedSubscription,
            message: cancelAtPeriodEnd
                ? 'Subscription will be canceled at the end of the current billing period.'
                : 'Subscription has been canceled immediately.'
        };
    }

    /**
     * Get upcoming invoice
     */
    async getUpcomingInvoice(subscriptionId: string) {
        const userSubscription = await this.prisma.userSubscription.findUnique({
            where: { id: subscriptionId }
        });

        if (!userSubscription) {
            throw new NotFoundException('Subscription not found');
        }

        const upcomingInvoice = await (this.stripe.invoices as any).upcoming({
            subscription: userSubscription.stripe_subscription_id,
        });

        return {
            success: true,
            invoice: {
                amount_due: upcomingInvoice.amount_due / 100, // Convert from cents
                amount_paid: upcomingInvoice.amount_paid / 100,
                amount_remaining: upcomingInvoice.amount_remaining / 100,
                currency: upcomingInvoice.currency,
                period_start: new Date(upcomingInvoice.period_start * 1000),
                period_end: new Date(upcomingInvoice.period_end * 1000),
                subtotal: upcomingInvoice.subtotal / 100,
                total: upcomingInvoice.total / 100,
                lines: upcomingInvoice.lines.data.map(line => ({
                    description: line.description,
                    amount: line.amount / 100,
                    quantity: line.quantity,
                })),
            }
        };
    }

    /**
     * Handle Stripe webhooks for subscription events
     */
    async handleWebhook(event: Stripe.Event) {
        switch (event.type) {
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                await this.handleSubscriptionExpired(event.data.object as Stripe.Subscription);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;
            case 'invoice.payment_succeeded':
                await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;
        }
    }

    private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
        await this.prisma.userSubscription.updateMany({
            where: { stripe_subscription_id: subscription.id },
            data: {
                status: subscription.status,
                current_period_start: new Date((subscription as any).current_period_start * 1000),
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                updated_at: new Date(),
            }
        });

        await this.prisma.user.updateMany({
            where: { stripe_subscription_id: subscription.id },
            data: {
                subscription_status: subscription.status,
                current_period_start: new Date((subscription as any).current_period_start * 1000),
                current_period_end: new Date((subscription as any).current_period_end * 1000),
            }
        });
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        await this.prisma.userSubscription.updateMany({
            where: { stripe_subscription_id: subscription.id },
            data: {
                status: 'canceled',
                updated_at: new Date(),
            }
        });

        await this.prisma.user.updateMany({
            where: { stripe_subscription_id: subscription.id },
            data: {
                subscription_status: 'canceled',
                package_status: 'FREE',
            }
        });
    }

    private async handleSubscriptionExpired(subscription: Stripe.Subscription) {
        // Check if subscription is expired or canceled
        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            await this.prisma.user.updateMany({
                where: { stripe_subscription_id: subscription.id },
                data: {
                    subscription_status: subscription.status,
                    package_status: 'FREE',
                }
            });
        }
    }

    private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
        if ((invoice as any).subscription) {
            await this.prisma.userSubscription.updateMany({
                where: { stripe_subscription_id: (invoice as any).subscription as string },
                data: {
                    status: 'active',
                    updated_at: new Date(),
                }
            });

            await this.prisma.user.updateMany({
                where: { stripe_subscription_id: (invoice as any).subscription as string },
                data: {
                    subscription_status: 'active',
                }
            });
        }
    }

    private async handlePaymentFailed(invoice: Stripe.Invoice) {
        if ((invoice as any).subscription) {
            await this.prisma.userSubscription.updateMany({
                where: { stripe_subscription_id: (invoice as any).subscription as string },
                data: {
                    status: 'past_due',
                    updated_at: new Date(),
                }
            });

            await this.prisma.user.updateMany({
                where: { stripe_subscription_id: (invoice as any).subscription as string },
                data: {
                    subscription_status: 'past_due',
                }
            });
        }
    }

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

    private generateSubscriptionDescription(
        planType: string,
        planId: string,
        userCount: number,
        workspaceCount: number,
        selectedModules: string[]
    ): string {
        if (planType === 'basic') {
            return `Basic Plan - ${userCount} users, ${workspaceCount} workspaces, ${selectedModules.length} modules`;
        } else {
            return `Combo Plan - ${planId} with ${selectedModules.length} modules`;
        }
    }
}
