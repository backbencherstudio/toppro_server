import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  id: string;

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
  unit_price?: number;

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

