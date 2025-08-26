import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLeadStageDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  pipelineName: string;

  @IsString() @IsNotEmpty()
  workspace_id: string;

  @IsString() @IsNotEmpty()
  owner_id: string;
}
