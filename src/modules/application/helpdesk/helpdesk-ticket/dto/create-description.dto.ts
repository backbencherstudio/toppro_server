import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDescriptionDto {
  @IsString()
  @IsNotEmpty()
  ticketId: string;   // public ticketId

  @IsString()
  @IsNotEmpty()
  description: string;
}