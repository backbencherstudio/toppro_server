import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PlanType } from '@prisma/client';

export class CreateComboPlanDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(PlanType)
    @IsNotEmpty()
    planType: PlanType;

    @IsInt()
    @IsNotEmpty()
    numberOfUsers: number;

    @IsInt()
    @IsNotEmpty()
    pricePerMonth: number;

    @IsInt()
    @IsNotEmpty()
    pricePerYear: number;

    @IsInt()
    @IsNotEmpty()
    numberOfWorkspaces: number;

    @IsBoolean()
    @IsOptional()
    trialEnabled?: boolean;

    @IsInt()
    @IsOptional()
    trialDays?: number;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    moduleIds: string[];
}
