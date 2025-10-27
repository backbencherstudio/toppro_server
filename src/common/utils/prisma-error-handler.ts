export function handlePrismaError(error: any) {
  console.error('❌ Prisma Error:', error);

  switch (error.code) {
    case 'P2002':
      return {
        success: false,
        message: `Duplicate value for field(s): ${error.meta?.target?.join(', ')}`,
      };

    case 'P2003':
      return {
        success: false,
        message: 'Invalid reference value. Foreign key constraint failed.',
      };

    case 'P2011':
      return {
        success: false,
        message: 'Required field missing. Please fill all mandatory fields.',
      };

    case 'P2025':
      return {
        success: false,
        message: 'Record not found or already deleted.',
      };

    case 'P1001':
    case 'P1010':
      return {
        success: false,
        message: 'Database connection error. Try again later.',
      };

    case 'P2000':
      return {
        success: false,
        message: `Value too long for field: ${error.meta?.target}`,
      };

    case 'P2004':
      return {
        success: false,
        message: `Invalid value for field: ${error.meta?.field_name}`,
      };

    case 'P2005':
      return {
        success: false,
        message: `Null value provided for required field: ${error.meta?.field_name}`,
      };

    case 'P2006':
      return {
        success: false,
        message: `Value too long for field: ${error.meta?.field_name}`,
      };

    case 'P2034':
      return {
        success: false,
        message: 'Transaction failed. Please try again.',
      };

    default:
      return {
        success: false,
        message: error.message || 'Unknown error occurred.',
      };
  }
}
