// src/modules/application/invoice/dto/update-invoice.dto.ts

import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateInvoiceItemDto } from './update-invoice-item.dto';

export class UpdateInvoiceDto {
  @IsOptional() @IsString() account_type_id?: string | null;
  @IsOptional() @IsString() customer_id?: string | null;
  @IsOptional() @IsString() billing_type_id?: string | null;
  @IsOptional() @IsString() invoice_category_id?: string | null;
  @IsOptional() @IsString() status?: string | null;

  @IsOptional()
  @IsDateString()
  issueAt?: string | null;

  @IsOptional()
  @IsDateString()
  dueAt?: string | null;

  @IsOptional()
  @IsString()
  item_category_id?: string | null;

  @IsOptional()
  @IsNumber()
  subTotal?: number;

  @IsOptional()
  @IsNumber()
  totalDiscount?: number;

  @IsOptional()
  @IsNumber()
  totalTax?: number;

  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInvoiceItemDto)
  items?: UpdateInvoiceItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delete_line_ids?: string[];
}
