import { ApiProperty } from '@nestjs/swagger';

export class CompanySetting {
    @ApiProperty()
    id: string;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;

    @ApiProperty({ required: false })
    deleted_at?: Date;

    // Company Information
    @ApiProperty({ required: false })
    company_name?: string;

    @ApiProperty({ required: false })
    company_registration_number?: string;

    // Address Information
    @ApiProperty({ required: false })
    address?: string;

    @ApiProperty({ required: false })
    city?: string;

    @ApiProperty({ required: false })
    state?: string;

    @ApiProperty({ required: false })
    country?: string;

    @ApiProperty({ required: false })
    zip_code?: string;

    // Contact Information
    @ApiProperty({ required: false })
    telephone?: string;

    @ApiProperty({ required: false })
    email_from_name?: string;

    @ApiProperty({ required: false })
    system_email?: string;

    // Tax Information
    @ApiProperty({ default: false })
    tax_number_enabled: boolean;

    @ApiProperty({ required: false, enum: ['VAT', 'GST'] })
    tax_number_type?: string;

    @ApiProperty({ required: false })
    tax_number_value?: string;

    // Multitenancy
    @ApiProperty({ required: false })
    owner_id?: string;

    @ApiProperty({ required: false })
    workspace_id?: string;

    @ApiProperty({ required: false })
    user_id?: string;
}
