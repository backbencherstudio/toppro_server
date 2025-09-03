import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreatePurchaseItemDto } from './create-purchase-item.dto';

export class CreatePurchaseDto {
  // header (must-haves)
  @IsOptional() 
  @IsString() 
  account_type_id?: string;

  @IsOptional() 
  @IsString() 
  item_id?: string;

  @IsOptional() 
  @IsString() 
  vendor_id?: string;

  @IsOptional() 
  @IsString() 
  billing_type_id?: string;

  @IsOptional() 
  @IsString() 
  category_id?: string;

  // purchase date (header). You said “purchaseba create_at”; using purchase_date
  @IsOptional() 
  @IsDateString() 
  purchase_date?: string;

  // will be auto-generated like PUR0000001
  @IsOptional() 
  @IsString() 
  purchase_no?: string;

  // lines
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
