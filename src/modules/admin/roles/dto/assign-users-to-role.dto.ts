import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignUsersToRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  user_ids: string[];
}
