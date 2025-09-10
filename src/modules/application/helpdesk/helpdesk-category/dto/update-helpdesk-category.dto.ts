import { PartialType } from '@nestjs/swagger';
import { CreateHelpdeskCategoryDto } from './create-helpdesk-category.dto';

export class UpdateHelpdeskCategoryDto extends PartialType(CreateHelpdeskCategoryDto) {}
