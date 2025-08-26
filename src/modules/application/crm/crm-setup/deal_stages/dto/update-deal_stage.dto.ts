import { IsOptional, IsString } from 'class-validator';

export class UpdateDealStageDto {
  @IsOptional()
  @IsString()
  name?: string;

  // allow changing stage to another pipeline by name (within same workspace)
  @IsOptional()
  @IsString()
  pipelineName?: string;
}