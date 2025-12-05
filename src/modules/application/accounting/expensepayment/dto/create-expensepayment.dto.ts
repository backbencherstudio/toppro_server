import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpensePaymentDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  bill_id: string;

  @IsOptional()
  @IsString()
  bank_account_id?: string;

  @IsOptional()
  @IsString()
  vendor_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;


  @IsOptional()
  @IsString()
  category_id?: string;
}
