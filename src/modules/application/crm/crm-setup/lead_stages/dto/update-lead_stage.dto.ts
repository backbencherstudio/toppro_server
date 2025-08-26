import { IsOptional, IsString } from 'class-validator';

export class UpdateLeadStageDto {
  @IsOptional() @IsString()
  name?: string;

  // Optional: move to another pipeline (within same workspace/owner)
  @IsOptional() @IsString()
  pipelineName?: string;
}
