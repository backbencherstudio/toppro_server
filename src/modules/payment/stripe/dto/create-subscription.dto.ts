import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateSubscriptionDto {
    @ApiProperty({
        description: 'Type of plan (basic or combo)',
        enum: ['basic', 'combo'],
        example: 'basic'
    })
    @IsEnum(['basic', 'combo'])
    planType: 'basic' | 'combo';

    @ApiProperty({
        description: 'ID of the selected plan',
        example: 'clx1234567890'
    })
    @IsString()
    planId: string;

    @ApiProperty({
        description: 'Number of users',
        example: 5,
        minimum: 1
    })
    @IsNumber()
    @Min(1)
    userCount: number;

    @ApiProperty({
        description: 'Number of workspaces',
        example: 2,
        minimum: 1
    })
    @IsNumber()
    @Min(1)
    workspaceCount: number;

    @ApiProperty({
        description: 'Array of selected module IDs',
        example: ['mod1', 'mod2', 'mod3'],
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    selectedModules: string[];

    @ApiProperty({
        description: 'Billing cycle',
        enum: ['monthly', 'yearly'],
        example: 'monthly'
    })
    @IsEnum(['monthly', 'yearly'])
    billingCycle: 'monthly' | 'yearly';

    @ApiProperty({
        description: 'Coupon code (optional)',
        example: 'SAVE20',
        required: false
    })
    @IsOptional()
    @IsString()
    couponCode?: string;

    @ApiProperty({
        description: 'Stripe payment method ID',
        example: 'pm_1234567890'
    })
    @IsString()
    paymentMethodId: string;
}
