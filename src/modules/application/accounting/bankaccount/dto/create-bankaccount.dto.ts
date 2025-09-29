// src/bank-account/dto/create-bank-account.dto.ts
import { IsOptional, IsString, IsNumber, MaxLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BankType } from '@prisma/client';

export class CreateBankAccountDto {
  @IsOptional()
  @IsEnum(BankType)
  bank_type?: BankType;

  @IsOptional()
  @IsString()
  holder_name?: string;

  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsNumber()
  opening_balance?: number;

  @IsOptional()
  @IsString()
  contact_number?: string;

  @IsOptional()
  @IsString()
  bank_branch?: string;

  @IsOptional()
  @IsString()
  swift?: string;

  @IsOptional()
  @IsString()
  bank_address?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  chart_of_account_id?: string;
}
