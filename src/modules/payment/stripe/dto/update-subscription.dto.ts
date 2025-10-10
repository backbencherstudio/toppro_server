import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSubscriptionDto {
    @ApiProperty({
        description: 'Number of users',
        example: 10,
        minimum: 1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    userCount?: number;

    @ApiProperty({
        description: 'Number of workspaces',
        example: 3,
        minimum: 1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    workspaceCount?: number;

    @ApiProperty({
        description: 'Array of selected module IDs',
        example: ['mod1', 'mod4', 'mod5'],
        type: [String],
        required: false
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    selectedModules?: string[];

    @ApiProperty({
        description: 'Coupon code (optional)',
        example: 'SAVE30',
        required: false
    })
    @IsOptional()
    @IsString()
    couponCode?: string;
}
