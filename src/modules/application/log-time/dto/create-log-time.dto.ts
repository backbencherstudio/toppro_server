import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateLogTimeDto {
  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  user_id: string;

  @IsString()
  workspace_id: string;

  @IsString()
  item_id: string;
}
