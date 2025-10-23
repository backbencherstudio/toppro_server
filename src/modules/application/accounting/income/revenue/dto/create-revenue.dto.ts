import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRevenueDto {
    @IsDateString()
    date: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    bank_account_id?: string;

    @IsOptional()
    @IsString()
    customer_id?: string;

    @IsOptional()
    @IsString()
    invoice_category_id?: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    files?: string; // Store as JSON string or comma-separated file paths
}
