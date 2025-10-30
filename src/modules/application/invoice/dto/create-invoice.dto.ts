import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @IsString()
  invoice_number: string;

  @Type(() => Date)
  @IsDate()
  issueAt: Date;

  @Type(() => Date)
  @IsDate()
  dueAt: Date;

  @IsOptional()
  @IsString()
  account_type_id?: string;

  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @IsString()
  billing_type_id?: string;

  @IsOptional()
  @IsString()
  invoice_category_id?: string;

  @IsOptional()
  @IsString()
  item_category_id?: string;

@Type(() => CreateInvoiceItemDto)
@IsOptional()
items?: CreateInvoiceItemDto[];


  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDiscount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalTax?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
