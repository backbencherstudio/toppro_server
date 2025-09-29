import { IsString, IsBoolean, IsOptional, IsEnum, IsEmail, MaxLength } from 'class-validator';
import { TaxNumberType } from '@prisma/client'; // Importing the enum from Prisma

export class UpdateCompanySettingDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  company_name?: string;

  @IsString()
  @IsOptional()
  company_registration_number?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  zip_code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  telephone?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email_from_name?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  system_email?: string;

  @IsBoolean()
  @IsOptional()
  tax_number_enabled?: boolean;

  @IsEnum(TaxNumberType)
  @IsOptional()
  tax_number_type?: TaxNumberType; // VAT or GST

  @IsString()
  @IsOptional()
  tax_number_value?: string;
}
