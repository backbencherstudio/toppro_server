import { BankType } from '@prisma/client';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateTransferDto {
  @IsEnum(BankType)
  from_type: BankType;

  @IsEnum(BankType)
  to_type: BankType;

  @IsString()
  from_account: string; // BankAccount ID

  @IsString()
  to_account: string; // BankAccount ID

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  workspace_id?: string;

  @IsOptional()
  @IsString()
  user_id?: string;
}
