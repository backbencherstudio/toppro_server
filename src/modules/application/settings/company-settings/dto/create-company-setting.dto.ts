import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum, IsEmail } from 'class-validator';

export class CreateCompanySettingDto {
    // Company Information
    @ApiProperty({ required: false, description: 'Company name' })
    @IsOptional()
    @IsString()
    company_name?: string;

    @ApiProperty({ required: false, description: 'Company registration number' })
    @IsOptional()
    @IsString()
    company_registration_number?: string;

    // Address Information
    @ApiProperty({ required: false, description: 'Company address' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ required: false, description: 'City' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({ required: false, description: 'State' })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiProperty({ required: false, description: 'Country' })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiProperty({ required: false, description: 'Zip/Post code' })
    @IsOptional()
    @IsString()
    zip_code?: string;

    // Contact Information
    @ApiProperty({ required: false, description: 'Telephone number' })
    @IsOptional()
    @IsString()
    telephone?: string;

    @ApiProperty({ required: false, description: 'Email from name' })
    @IsOptional()
    @IsString()
    email_from_name?: string;

    @ApiProperty({ required: false, description: 'System email address' })
    @IsOptional()
    @IsEmail()
    system_email?: string;

    // Tax Information
    @ApiProperty({ required: false, default: false, description: 'Whether tax number is enabled' })
    @IsOptional()
    @IsBoolean()
    tax_number_enabled?: boolean;

    @ApiProperty({ required: false, enum: ['VAT', 'GST'], description: 'Type of tax number' })
    @IsOptional()
    @IsEnum(['VAT', 'GST'])
    tax_number_type?: string;

    @ApiProperty({ required: false, description: 'Tax number value' })
    @IsOptional()
    @IsString()
    tax_number_value?: string;

    // Multitenancy
    @ApiProperty({ required: false, description: 'Owner ID' })
    @IsOptional()
    @IsString()
    owner_id?: string;

    @ApiProperty({ required: false, description: 'Workspace ID' })
    @IsOptional()
    @IsString()
    workspace_id?: string;

    @ApiProperty({ required: false, description: 'User ID' })
    @IsOptional()
    @IsString()
    user_id?: string;
}
