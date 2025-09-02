import { PartialType } from '@nestjs/swagger';
import { CreateEmailTextDto } from './create-emailtext.dto';


export class UpdateEmailTextDto extends PartialType(CreateEmailTextDto) {}
