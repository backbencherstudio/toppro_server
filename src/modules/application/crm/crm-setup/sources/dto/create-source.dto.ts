import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSourceDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  workspace_id: string;

  @IsString() @IsNotEmpty()
  owner_id: string;
}
