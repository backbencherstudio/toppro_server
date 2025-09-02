import { PartialType } from '@nestjs/swagger';
import { CreateLeaduserDto } from './create-leaduser.dto';

export class UpdateLeaduserDto extends PartialType(CreateLeaduserDto) {}
