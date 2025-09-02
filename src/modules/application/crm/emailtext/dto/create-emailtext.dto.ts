import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmailTextDto {
  @IsString()
  @IsNotEmpty()
  lead_id: string;

  @IsString()
  @IsNotEmpty()
  mail_to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  description?: string;
}
