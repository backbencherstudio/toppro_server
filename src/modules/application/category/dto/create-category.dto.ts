import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  // Common fields
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  account?: string;

  @IsOptional()
  @IsNumber()
  rate?: number;

  @IsOptional()
  @IsString()
  description?: string;

  // Relations
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
