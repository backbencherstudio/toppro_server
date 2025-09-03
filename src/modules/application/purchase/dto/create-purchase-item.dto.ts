import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePurchaseItemDto {
  @IsString() itemId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  itemCategoryId?: string;

  @IsOptional()
  @IsString()
  itemTypeId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  taxPercent: number;
}
