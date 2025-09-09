import { PartialType } from '@nestjs/swagger';
import { CreateLeadProductDto } from './create-lead-product.dto';

export class UpdateLeadProductDto extends PartialType(CreateLeadProductDto) {}
