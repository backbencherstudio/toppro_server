import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-helpdesk-ticket.dto';

export class UpdateHelpdeskTicketDto extends PartialType(CreateTicketDto) {}
