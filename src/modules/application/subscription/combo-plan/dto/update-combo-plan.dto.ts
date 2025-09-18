import { PlanType } from '@prisma/client';
import { IsOptional, IsString, IsEnum, IsInt, IsBoolean, IsArray } from 'class-validator';

export class UpdateComboPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PlanType)
  planType?: PlanType;

  @IsOptional()
  @IsInt()
  numberOfUsers?: number;

  @IsOptional()
  @IsInt()
  numberOfWorkspaces?: number;

  @IsOptional()
  @IsInt()
  pricePerMonth?: number;

  @IsOptional()
  @IsInt()
  pricePerYear?: number;

  @IsOptional()
  @IsBoolean()
  trialEnabled?: boolean;

  @IsOptional()
  @IsInt()
  trialDays?: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  moduleIds?: string[];

}
