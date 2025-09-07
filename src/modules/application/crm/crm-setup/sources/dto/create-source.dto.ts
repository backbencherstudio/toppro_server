import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSourceDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() 
  @IsNotEmpty()
  @IsOptional()
  workspace_id: string;

  @IsString() 
  @IsNotEmpty()
  @IsOptional()
  owner_id: string;
}
