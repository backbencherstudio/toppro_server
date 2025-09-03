import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePurchaseItemDto {
  // required for connect
  @IsString() item_id: string;

  // optional connects
  @IsOptional() 
  @IsString() 
  name?: string;

  @IsOptional() 
  @IsString() 
  sku?: string;
  
  @IsOptional() 
  @IsString() 
  unit_id?: string;

  @IsOptional() 
  @IsString() 
  itemCategory_id?: string;

  @IsOptional() 
  @IsString() 
  item_type_id?: string;

  @IsOptional() 
  @IsString() 
  tax_id?: string;

  // numbers
  @Type(() => Number) 
  @IsInt() 
  @Min(1)
  quantity: number;

  @Type(() => Number) 
  @IsNumber()
  purchase_price: number;

  @Type(() => Number) 
  @IsNumber()
  discount: number;             // absolute amount (not %)

  // optional snapshot note
  @IsOptional() 
  @IsString()
  description?: string;
}
