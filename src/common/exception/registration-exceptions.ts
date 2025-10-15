import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception thrown when an email address is already registered
 */
export class EmailAlreadyExistsException extends HttpException {
    constructor(email?: string, endpoint?: string) {
        const message = email
            ? `The email address "${email}" is already registered. Please use a different email address or try logging in if you already have an account.`
            : 'This email address is already registered. Please use a different email address or try logging in if you already have an account.';

        super(
            {
                success: false,
                message,
                error: 'EMAIL_ALREADY_EXISTS',
                statusCode: HttpStatus.CONFLICT,
                timestamp: new Date().toISOString(),
                path: endpoint || '/auth/register',
                details: {
                    suggestion: 'If you already have an account, please try logging in instead of registering.',
                    alternative: 'Use a different email address to create a new account.',
                    support: 'Contact support if you believe this is an error.'
                }
            },
            HttpStatus.CONFLICT,
        );
    }
}

/**
 * Exception thrown when a pending registration already exists
 */
export class PendingRegistrationExistsException extends HttpException {
    constructor(email?: string) {
        const message = email
            ? `A verification email has already been sent to "${email}". Please check your inbox and spam folder, or wait a few minutes before trying again.`
            : 'A verification email has already been sent. Please check your inbox and spam folder, or wait a few minutes before trying again.';

        super(
            {
                success: false,
                message,
                error: 'PENDING_REGISTRATION_EXISTS',
                statusCode: HttpStatus.CONFLICT,
                timestamp: new Date().toISOString(),
                path: '/auth/register',
                details: {
                    suggestion: 'Check your email inbox and spam folder for the verification email.',
                    alternative: 'Wait a few minutes and try again, or use the resend verification endpoint.',
                    support: 'Contact support if you did not receive the verification email.'
                }
            },
            HttpStatus.CONFLICT,
        );
    }
}

/**
 * Exception thrown when registration data is invalid
 */
export class InvalidRegistrationDataException extends HttpException {
    constructor(field?: string, reason?: string) {
        const message = field && reason
            ? `Invalid ${field}: ${reason}`
            : 'Invalid registration data provided. Please check your input and try again.';

        super(
            {
                success: false,
                message,
                error: 'INVALID_REGISTRATION_DATA',
                statusCode: HttpStatus.BAD_REQUEST,
                timestamp: new Date().toISOString(),
                path: '/auth/register',
                details: {
                    suggestion: 'Please review your registration form and ensure all required fields are filled correctly.',
                    alternative: 'Contact support if you continue to experience issues.',
                    support: 'Check our documentation for registration requirements.'
                }
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}
