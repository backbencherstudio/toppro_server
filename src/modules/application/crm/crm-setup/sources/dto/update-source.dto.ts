import { IsOptional, IsString } from 'class-validator';

export class UpdateSourceDto {
  @IsOptional() @IsString()
  name?: string;
}
