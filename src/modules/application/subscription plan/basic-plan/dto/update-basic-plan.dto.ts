import { PartialType } from '@nestjs/swagger';
import { CreateBasicPlanDto } from './create-basic-plan.dto';

export class UpdateBasicPlanDto extends PartialType(CreateBasicPlanDto) {}
