import { IsString } from 'class-validator';

export class CreatePipelineDto {
  @IsString()
  name: string;

  @IsString()
  workspace_id: string;

  @IsString()
  owner_id: string;
}
