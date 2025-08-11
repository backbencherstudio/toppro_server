import { IsOptional, IsBoolean, IsArray, IsString } from 'class-validator';

export class UpdateUserAndRoleManagementDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean; 
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[]; 
}
