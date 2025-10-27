import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateReceiptSummaryDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  bank_account_id?: string;

  @IsString()
  @IsOptional()
  invoice_id?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  file?: string;

  @IsOptional()
  ordered?: string;
}