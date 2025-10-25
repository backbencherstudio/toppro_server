import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export function handlePrismaError(error: any) {
  console.error('❌ Prisma Error:', error);

  switch (error.code) {
    case 'P2002':
      throw new ConflictException(
        `Duplicate value for field(s): ${error.meta?.target?.join(', ')}`,
      );

    case 'P2003':
      throw new BadRequestException(
        'Invalid reference value. Foreign key constraint failed.',
      );

    case 'P2011':
      throw new BadRequestException(
        'Required field missing. Please fill all mandatory fields.',
      );

    case 'P2025':
      throw new NotFoundException(
        'Record not found or already deleted.'
      );

    case 'P1001':
    case 'P1010':
      throw new InternalServerErrorException(
        'Database connection error. Try again later.',
      );

    default:
      throw new InternalServerErrorException(error.message || 'Unknown error');
  }
}
