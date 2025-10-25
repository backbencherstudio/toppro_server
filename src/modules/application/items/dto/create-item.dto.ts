import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateItemDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'cmgt8u9fs0001vg88k7x5zxvd', required: false })
  id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Laptop', required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'LT-1001', required: false })
  sku?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '15-inch MacBook Pro 2025 model', required: false })
  description?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  @IsOptional()
  @IsString()
  itemCategory_id?: string;

  @IsOptional()
  @IsString()
  unit_id?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  vendor_id?: string;

  @IsOptional()
  @IsString()
  itemType_id?: string;

  @IsOptional()
  @IsString()
  invoice_id?: string;

  // 💰 Numeric fields — automatically convert string ➜ number
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'sale_price must not be less than 0' })
  @ApiProperty({ example: 2000, required: false })
  sale_price?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'purchase_price must not be less than 0' })
  @ApiProperty({ example: 1500, required: false })
  purchase_price?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'unit_price must not be less than 0' })
  @ApiProperty({ example: 2000, required: false })
  unit_price?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 10, required: false })
  quantity?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 5, required: false })
  discount?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 10000, required: false })
  total?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'total_price must not be less than 0' })
  @ApiProperty({ example: 9500, required: false })
  total_price?: number = 0;
}
