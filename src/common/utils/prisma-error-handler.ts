import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export function handlePrismaError(error: any) {
  console.error('❌ Prisma Error:', error);

  switch (error.code) {
    // Unique constraint failed
    case 'P2002':
      throw new ConflictException(
        `Duplicate value for field(s): ${error.meta?.target?.join(', ')}`,
      );

    // Foreign key constraint failed
    case 'P2003':
      throw new BadRequestException(
        'Invalid reference value. Foreign key constraint failed.',
      );

    // Required field missing
    case 'P2011':
      throw new BadRequestException(
        'Required field missing. Please fill all mandatory fields.',
      );

    // Record not found
    case 'P2025':
      throw new NotFoundException(
        'Record not found or already deleted.'
      );

    // Connection errors
    case 'P1001': // Database connection failed
    case 'P1010': // Database unreachable
      throw new InternalServerErrorException(
        'Database connection error. Try again later.',
      );

    // Value out of range for field type
    case 'P2000':
      throw new BadRequestException(
        `Value too long for field: ${error.meta?.target}`,
      );

    // Invalid field value (e.g., type mismatch)
    case 'P2004':
      throw new BadRequestException(
        `Invalid value for field: ${error.meta?.field_name}`,
      );

    // Null constraint violation
    case 'P2005':
      throw new BadRequestException(
        `Null value provided for required field: ${error.meta?.field_name}`,
      );

    // Exceeding constraint length
    case 'P2006':
      throw new BadRequestException(
        `Value too long for field: ${error.meta?.field_name}`,
      );

    // Transaction failed
    case 'P2034':
      throw new InternalServerErrorException(
        'Transaction failed. Please try again.'
      );

    default:
      throw new InternalServerErrorException(error.message || 'Unknown error');
  }
}
