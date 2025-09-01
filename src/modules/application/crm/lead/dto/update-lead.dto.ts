import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  followup_at?: string;

  @IsString()
  @IsOptional()
  pipeline_id?: string;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsArray()
  @IsOptional()
  sources?: string[];

  @IsArray()
  @IsOptional()
  products?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
