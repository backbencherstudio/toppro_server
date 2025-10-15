import { Float } from 'aws-sdk/clients/batch';
import { IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  contact: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  customer_no: string;


  @IsOptional()
  balance: Float;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  // Billing Address
  @IsOptional()
  @IsString()
  billingName?: string;

  @IsOptional()
  @IsString()
  billingPhone?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsString()
  billingCity?: string;

  @IsOptional()
  @IsString()
  billingState?: string;

  @IsOptional()
  @IsString()
  billingCountry?: string;

  @IsOptional()
  @IsString()
  billingZip?: string;

  // Shipping Address
  @IsOptional()
  @IsString()
  shippingName?: string;

  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  shippingCity?: string;

  @IsOptional()
  @IsString()
  shippingState?: string;

  @IsOptional()
  @IsString()
  shippingCountry?: string;

  @IsOptional()
  @IsString()
  shippingZip?: string;

  @IsOptional()
  @IsString()
  owner_id: string;

  @IsOptional()
  @IsString()
  workspace_id: string;
}
