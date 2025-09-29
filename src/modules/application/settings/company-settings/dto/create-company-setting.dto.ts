import { IsString, IsBoolean, IsOptional, IsEnum, IsEmail, MaxLength } from 'class-validator';
import { TaxNumberType } from '@prisma/client'; // Importing the enum from Prisma

export class CreateCompanySettingDto {
  @IsString()
  @MaxLength(100)
  company_name: string;

  @IsString()
  company_registration_number: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  zip_code: string;

  @IsString()
  @MaxLength(15)
  telephone: string;

  @IsString()
  @IsEmail()
  email_from_name: string;

  @IsString()
  @IsEmail()
  system_email: string;

  @IsBoolean()
  tax_number_enabled: boolean;

  @IsEnum(TaxNumberType)
  @IsOptional()
  tax_number_type?: TaxNumberType; // VAT or GST

  @IsString()
  @IsOptional()
  tax_number_value?: string;
}
