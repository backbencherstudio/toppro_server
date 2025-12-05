import { PartialType } from '@nestjs/swagger';
import { CreateDebitnoteDto } from './create-debitnote.dto';

export class UpdateDebitnoteDto extends PartialType(CreateDebitnoteDto) {}
