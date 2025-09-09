import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInvoiceItemDto {

  @IsString() 
  item_id: string;


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

  @IsInt() 
  @Min(1) 
  quantity: number; 

  @IsNumber() 
  purchase_price: number; 

  @IsNumber() 
  discount: number; 


  @IsOptional() 
  @IsString() 
  description?: string; 
}
