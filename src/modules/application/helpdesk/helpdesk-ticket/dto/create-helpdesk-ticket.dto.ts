import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { T_status } from '@prisma/client';  // Enum for ticket status
import { Type } from 'class-transformer';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;  // Category of the HelpDeskTicket

  @IsEnum(T_status)
  status: T_status;  // Status of the ticket (OPEN, IN_PROGRESS, RESOLVED, CLOSED)

  @IsString()
  @IsNotEmpty()
  subject: string;  // Subject of the HelpDeskTicket

  @IsString()
  @IsNotEmpty()
  description: string;  // Description of the HelpDeskTicket

  @IsOptional()  // Optional for admins only
  customerId?: string;  // Customer's user ID, required for SUPERADMIN

  @IsOptional()  // Optional for admins only
  @IsEmail()
  email?: string;  // Customer's email, required for SUPERADMIN

  // Constructor to type transform any incoming data
  @Type(() => String)
  @IsString()
  createdBy: string;  // Created by (user ID) from JWT
}
