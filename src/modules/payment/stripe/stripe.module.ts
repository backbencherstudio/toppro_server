import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeSubscriptionService } from './stripe-subscription.service';
import { StripeController } from './stripe.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { BasicPlanService } from '../../application/subscription plan/basic-plan/basic-plan.service';
import { ComboPlanService } from '../../application/subscription plan/combo-plan/combo-plan.service';

@Module({
  controllers: [StripeController],
  providers: [
    PrismaService,
    BasicPlanService,
    ComboPlanService,
    StripeSubscriptionService,
    StripeService,
  ],
  exports: [StripeService, StripeSubscriptionService],
})
export class StripeModule { }