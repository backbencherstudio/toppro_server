import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { CallType } from '@prisma/client';

export class CreateCallDto {
  @IsString()
  @IsNotEmpty()
  lead_id: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsEnum(CallType)
  @IsNotEmpty()
  call_type: CallType; // "INBOUND" | "OUTBOUND"

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  assignee_id?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  result?: string;
}
