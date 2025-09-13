import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { T_status } from '@prisma/client';

export class UpdateHelpdeskTicketDto {

    @IsOptional()
    @IsString()
    categoryId: string;

    @IsOptional()
    @IsEnum(T_status)
    status: T_status;

    @IsOptional()
    @IsString()
    subject: string;


    @IsOptional()
    customerId?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    workspaceId?: string;

    @IsOptional()
    @IsString()
    notes?: string;

}