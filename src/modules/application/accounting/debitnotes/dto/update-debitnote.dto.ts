import { PartialType } from '@nestjs/swagger';
import { CreateDebitNoteDto } from './create-debitnote.dto';

export class UpdateDebitnoteDto extends PartialType(CreateDebitNoteDto) {}
