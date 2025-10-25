import { IsEnum, IsOptional, IsString, IsDecimal, IsBoolean } from 'class-validator';
import { ParentAccountType, ChildAccountType } from '@prisma/client';

export class CreateChartOfAccountDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ParentAccountType)
  account_category: ParentAccountType;

  @IsOptional()
  @IsEnum(ChildAccountType)
  child_account_type?: ChildAccountType;

  @IsOptional()
  @IsString()
  parent_account_name?: string;

  @IsOptional()
  @IsDecimal()
  balance?: any;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  workspace_id?: string;

  @IsOptional()
  @IsString()
  owner_id?: string;
}
