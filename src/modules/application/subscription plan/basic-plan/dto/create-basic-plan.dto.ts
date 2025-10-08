import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateBasicPlanDto {
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    monthlyBasicPrice: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    monthlyPricePerUser: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    monthlyPricePerWorkspace: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    yearlyBasicPrice: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    yearlyPricePerUser: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    yearlyPricePerWorkspace: number;
}
