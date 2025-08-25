import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string; 

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  owner_id?: string;

  @IsString()
  @IsNotEmpty()
  workspace_id?: string; 


  @IsArray()
  @IsOptional()
  permissions?: string[];


}
