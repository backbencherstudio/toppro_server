import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sale_price?: number;

  @IsOptional()
  @IsNumber()
  purchase_price?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  workspace_id: string;

  @IsOptional()
  @IsString()
  owner_id: string;

  @IsOptional()
  @IsString()
  user_id: string;
}

