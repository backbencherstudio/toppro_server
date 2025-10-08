import { PartialType } from '@nestjs/swagger';
import { CreateModulePriceDto } from './module-price.dto';



export class UpdateModulePriceDto extends PartialType(CreateModulePriceDto) { }
