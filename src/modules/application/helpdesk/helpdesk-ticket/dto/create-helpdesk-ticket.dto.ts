import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { T_status } from '@prisma/client'; // Enum for ticket status

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

  @IsOptional() // Required for SUPERADMIN, ignored for OWNER (taken from JWT)
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  notes?: string;  // Optional notes for the ticket
}
