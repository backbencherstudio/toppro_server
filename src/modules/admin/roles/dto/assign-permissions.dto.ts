import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class AssignPermissionsDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;  // Role ID to assign permissions to

  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];  // Array of permission IDs to be assigned to the role
}
