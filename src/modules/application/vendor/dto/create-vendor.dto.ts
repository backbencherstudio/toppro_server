import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsString()
  contact: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

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

  
    @IsNotEmpty()
    @IsString()
    owner_id: string;
  
    @IsNotEmpty()
    @IsString()
    workspace_id: string;
}
