import { PartialType } from '@nestjs/swagger';
import { CreateLeadStageDto } from './create-lead_stage.dto';

export class UpdateLeadStageDto extends PartialType(CreateLeadStageDto) {}
