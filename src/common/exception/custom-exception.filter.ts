import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Check if the exception already has a custom response structure
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'success' in exceptionResponse) {
      // If it's already a custom response (like our EmailAlreadyExistsException), use it as-is
      response.status(status).json(exceptionResponse);
    } else {
      // For standard exceptions, wrap in our custom format
      response.status(status).json({
        success: false,
        message: exceptionResponse,
        statusCode: status,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
