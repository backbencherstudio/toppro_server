import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  from_type: string;

  @IsString()
  @IsNotEmpty()
  to_type: string;

  @IsString()
  @IsNotEmpty()
  from_account: string;

  @IsString()
  @IsNotEmpty()
  to_account: string;

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
  owner_id?: string;

  @IsOptional()
  @IsString()
  workspace_id?: string;

  @IsOptional()
  @IsString()
  user_id?: string;
}
