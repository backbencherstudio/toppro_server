import { PartialType } from '@nestjs/swagger';
import { CreateDealStageDto } from './create-deal_stage.dto';

export class UpdateDealStageDto extends PartialType(CreateDealStageDto) {}
