import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateStripePaymentDto {
  @IsEmail()
  senderEmail: string;

  @IsEmail()
  receiverEmail: string;

  @IsNumber()
  amount: number;

  @IsNotEmpty()
  paymentMethodId: string;
}
