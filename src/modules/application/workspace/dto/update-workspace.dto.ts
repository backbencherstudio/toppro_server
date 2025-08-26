import { IsOptional, IsString } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  super_id?: string;

  @IsOptional()
  @IsString()
  owner_id?: string;
}
