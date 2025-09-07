import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePurchaseItemDto {
  @IsOptional()
  @IsString()
  purchase_id?: string;

  @IsOptional()
  @IsString()
  line_id?: string;

  @IsString()
  item_id: string;

  @IsOptional()
  @IsString()
  item_type_id?: string;

  @IsOptional()
  @IsString()
  unit_price?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  @IsOptional()
  @IsString()
  itemCategory_id?: string;

  @IsOptional()
  @IsString()
  unit_id?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  purchase_price: number;

  @Type(() => Number)
  @IsNumber()
  discount: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
