import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  item_id: string; // selected item

  @IsOptional()
  @IsString()
  vendor_id?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  unit_price?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  total_price?: number;

  @IsOptional()
  @IsString()
  accountType_id?: string;

  @IsOptional()
  @IsString()
  itemCategory_id?: string;

  @IsOptional()
  @IsString()
  billingCategory_id?: string;

  @IsOptional()
  @IsString()
  purchase_no?: string;
}
