// src/calls/dto/create-call.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CallType } from '@prisma/client';

export class CreateCallDto {
  @ApiProperty({ description: 'Subject of the call' })
  @IsString()
  @MaxLength(255)
  subject: string;

  @ApiProperty({ enum: CallType, default: CallType.OUTBOUND })
  @IsEnum(CallType)
  call_type: CallType = CallType.OUTBOUND;

  @ApiProperty({
    description: 'Duration in h:m:s format (e.g., 00:35:20)',
    required: false
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ description: 'Name of the user assigned to this call', required: false })
  @IsOptional()
  @IsString()
  assignee_name?: string;

  @ApiProperty({ description: 'Description of the call', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Result of the call', required: false })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiProperty({ description: 'ID of the lead this call is associated with' })
  @IsString()
  lead_id: string;
}