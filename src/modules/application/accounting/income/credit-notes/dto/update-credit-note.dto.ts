import { PartialType } from '@nestjs/swagger';
import { CreateCreditNoteDto } from './create-credit-note.dto';
import { IsOptional, IsIn } from 'class-validator';

const ALLOWED_STATUSES = ['PENDING', 'PARTIAL_USED', 'FULLY_USED'] as const;

export class UpdateCreditNoteDto extends PartialType(CreateCreditNoteDto) {
    @IsOptional()
    @IsIn(ALLOWED_STATUSES)
    status?: typeof ALLOWED_STATUSES[number];
}
