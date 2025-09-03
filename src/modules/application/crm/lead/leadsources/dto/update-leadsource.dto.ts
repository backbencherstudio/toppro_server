import { PartialType } from '@nestjs/swagger';
import { CreateLeadsourceDto } from './create-leadsource.dto';

export class UpdateLeadsourceDto extends PartialType(CreateLeadsourceDto) {}
