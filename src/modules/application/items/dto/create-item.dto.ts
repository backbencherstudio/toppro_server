
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional() @IsString()
  sku?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  tax_id?: string;

  @IsOptional() @IsString()
  itemCategory_id?: string;

  @IsOptional() @IsString()
  unit_id?: string;

  @IsOptional() @IsString()
  image?: string;

  @IsOptional() @IsString()
  vendor_id?: string;

  @IsOptional() @IsString()
  itemType_id?: string;

  @IsOptional() @IsString()
  invoice_id?: string;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  sale_price?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  purchase_price?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  unit_price?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  quantity?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  discount?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  total?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  total_price?: number;


}
