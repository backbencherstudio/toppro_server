import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateStockDto {
  @IsString()
  @IsOptional()
  product_name: string;

  @IsString()
  @IsOptional()
  sku: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @IsString()
  image: string ;

  @IsOptional()
  item_id: string ;

  @IsOptional()
  owner_id?: string;

  @IsOptional()
  workspace_id?: string;
}
