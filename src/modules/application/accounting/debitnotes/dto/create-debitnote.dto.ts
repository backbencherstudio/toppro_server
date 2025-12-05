import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateDebitNoteDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  bill_id: string;  // Bill ID to which the debit note belongs

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  payment_id?: string;  // Optional payment id

  @IsString()
  vendor_id: string;  // Vendor to whom the debit note is issued

  @IsOptional()
  @IsString()
  category_id: string;  // Category to which the debit note belongs


}
