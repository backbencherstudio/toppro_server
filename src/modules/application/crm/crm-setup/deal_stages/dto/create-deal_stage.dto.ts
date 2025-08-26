// create-deal-stage.dto.ts
import { IsString } from 'class-validator';

export class CreateDealStageDto {
  @IsString()
  name: string;

  @IsString()
  pipelineName: string;  // This should be the pipeline to which the deal stage belongs
}
