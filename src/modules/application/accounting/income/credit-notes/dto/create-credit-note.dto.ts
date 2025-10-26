import { IsOptional, IsString, IsNumber, IsDateString, IsIn } from 'class-validator';

// Keep in sync with Prisma schema enum CreditNoteStatus
const ALLOWED_STATUSES = ['PENDING', 'PARTIAL_USED', 'FULLY_USED'] as const;

export class CreateCreditNoteDto {
    @IsOptional()
    @IsString()
    invoice_id?: string;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsString()
    bank_account_id?: string;

    @IsOptional()
    @IsString()
    customer_id?: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsIn(ALLOWED_STATUSES)
    status?: typeof ALLOWED_STATUSES[number];
}
