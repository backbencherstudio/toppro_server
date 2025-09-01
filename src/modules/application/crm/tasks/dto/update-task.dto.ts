import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
