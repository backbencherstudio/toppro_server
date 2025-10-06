import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRevenueDto {
    @IsDateString()
    date: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    account?: string; // BankAccount id

    @IsOptional()
    @IsString()
    customer?: string; // Customer id

    @IsOptional()
    @IsString()
    category?: string; // InvoiceCategory id

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
