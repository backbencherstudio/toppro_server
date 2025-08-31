// src/calls/dto/call-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CallType } from '@prisma/client';

export class CallQueryDto {
  @ApiPropertyOptional({ enum: CallType })
  @IsOptional()
  @IsEnum(CallType)
  call_type?: CallType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignee_name?: string;
}