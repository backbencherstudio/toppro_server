import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLogTimeDto {
  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  workspace_id?: string;

  @IsString()
  @IsOptional()
  item_id?: string;

  @IsString()
  @IsOptional()
  owner_id?: string;
}
