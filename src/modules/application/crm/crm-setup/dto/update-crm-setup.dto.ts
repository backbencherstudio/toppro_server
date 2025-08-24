import { PartialType } from '@nestjs/swagger';
import { CreateCrmSetupDto } from './create-crm-setup.dto';

export class UpdateCrmSetupDto extends PartialType(CreateCrmSetupDto) {}
