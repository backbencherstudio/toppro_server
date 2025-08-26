import { IsString } from 'class-validator';

export class CreateDealStageDto {
  @IsString()
  name: string;

  // client sends pipeline name, we resolve pipelineId
  @IsString()
  pipelineName: string;

  // for CREATE: these come in the body
  @IsString()
  workspace_id: string;

  @IsString()
  owner_id: string;
}