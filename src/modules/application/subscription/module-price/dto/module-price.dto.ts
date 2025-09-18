import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateModulePriceDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    priceMonth: number;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    priceYear: number;

    @IsOptional()
    logo?: string;
}

export class UpdateModulePriceDto {
    @IsString()
    @IsOptional()
    name?: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    priceMonth?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    priceYear?: number;

    @IsOptional()
    logo?: string;
}
