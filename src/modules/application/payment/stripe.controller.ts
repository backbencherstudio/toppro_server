import { Controller, Get, Param } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(private stripe: StripeService) { }

    @Get('checkout-session/:id')
    async getSession(@Param('id') id: string) {
        return this.stripe.stripe.checkout.sessions.retrieve(id);
    }
}
