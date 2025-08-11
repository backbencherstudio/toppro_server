import { PartialType } from '@nestjs/swagger';
import { CreateStripePaymentDto } from './create-stripe.dto';

export class UpdateStripePaymentDto extends PartialType(CreateStripePaymentDto) {
  // You can add extra fields if needed for update scenarios
  status?: string;
}
