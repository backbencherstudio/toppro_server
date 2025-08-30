// src/calls/dto/update-call.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateCallDto } from './create-call.dto';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CallType } from '@prisma/client';

export class UpdateCallDto extends PartialType(CreateCallDto) {
  @IsOptional()
  @IsEnum(CallType)
  call_type?: CallType;
}