import { IsString, IsNotEmpty, IsEmail, IsDateString, IsArray, ArrayNotEmpty, IsOptional, IsEnum, ArrayUnique } from 'class-validator';

export class CreateLeadDto {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    phone: string;

    @IsDateString()
    followup_at: string;

    // @IsArray()
    // @IsString({ each: true })
    // userIds?: string[];

    @IsArray()
    @IsOptional()  // can be empty; owner will always be added anyway
    users?: string[];

}
