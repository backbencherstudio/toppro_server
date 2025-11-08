import { IsOptional, IsString } from 'class-validator';

export class CreateControlSettingDto {
    @IsOptional() 
    @IsString() 
    logo_dark?: string;


    @IsOptional() 
    @IsString() 
    logo_light?: string;

    @IsOptional() 
    @IsString() 
    logo_favicon?: string;

    @IsOptional() 
    @IsString() 
    title_text?: string;

    @IsOptional() 
    @IsString() 
    footer_text?: string;

    @IsOptional() 
    @IsString() 
    customer_prefix?: string;

    @IsOptional() 
    @IsString() 
    vendor_prefix?: string;
}
