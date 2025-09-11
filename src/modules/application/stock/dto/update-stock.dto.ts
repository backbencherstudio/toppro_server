import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateStockDto {
  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  item_id?: string;

  @IsOptional()
  owner_id?: string;

  @IsOptional()
  workspace_id?: string;
}
