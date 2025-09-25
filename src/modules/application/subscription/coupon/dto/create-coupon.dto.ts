import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsEnum(CouponType)
    type: CouponType;

    @IsNumber()
    discount: number;

    @IsOptional()
    @IsNumber()
    minimumSpend?: number;

    @IsOptional()
    @IsNumber()
    maximumSpend?: number;

    @IsOptional()
    @IsNumber()
    usageLimit?: number;

    @IsOptional()
    @IsNumber()
    usagePerUser?: number;

    @IsOptional()
    @IsDateString()
    expiryDate?: string;

    @IsOptional()
    @IsBoolean()
    isActive: boolean = true;
}
