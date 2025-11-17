import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { WebhookController } from './webhook.controller';
import { StripeService } from './stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BasicPlanService } from '../subscription plan/basic-plan/basic-plan.service';
import { ComboPlanService } from '../subscription plan/combo-plan/combo-plan.service';
import { StripeController } from './stripe.controller';


@Module({
  controllers: [PaymentController, WebhookController,StripeController],
  providers: [PaymentService, StripeService, PrismaService,BasicPlanService,
    ComboPlanService,],
})
export class PaymentModule {}
