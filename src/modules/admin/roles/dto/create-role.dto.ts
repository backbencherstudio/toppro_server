import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  title: string;  // Role title (e.g., "admin", "user")

  @IsString()
  @IsOptional()
  description?: string;  // Optional description for the role

  @IsArray()
  @IsOptional()
  permissions?: string[];  // Optional permissions array to assign during role creation
}
