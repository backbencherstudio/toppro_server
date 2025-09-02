import { IsString } from 'class-validator';

export class AssignUserToRoleDto {
  @IsString()
  user_id: string;
}
