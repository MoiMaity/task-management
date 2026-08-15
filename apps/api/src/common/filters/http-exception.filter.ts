import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiFailure } from '@tms/shared';

/**
 * Turns every thrown error into the ApiFailure shape.
 *
 * Nest's ValidationPipe throws a BadRequestException whose response body has a
 * `message` array of strings. We reshape that into details keyed by field so
 * the frontend can attach messages to the right input without string parsing.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ApiFailure = {
      success: false,
      error: {
        code: this.codeFor(status),
        message: this.messageFor(exception, status),
        details: this.detailsFor(exception),
      },
    };

    if (status >= 500) {
      // Log the real error server-side; never leak internals to the client.
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json(body);
  }

  private codeFor(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_FAILED';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      default:
        return status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED';
    }
  }

  private messageFor(exception: unknown, status: number): string {
    if (status >= 500) {
      return 'Something went wrong on our end. Try again.';
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      const message = (response as { message?: string | string[] }).message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message[0] ?? exception.message;
    }

    return 'Request failed.';
  }

  private detailsFor(exception: unknown): Record<string, string[]> | undefined {
    if (!(exception instanceof HttpException)) return undefined;

    const response = exception.getResponse();
    if (typeof response === 'string') return undefined;

    const message = (response as { message?: string | string[] }).message;
    if (!Array.isArray(message)) return undefined;

    // class-validator messages start with the property name, e.g.
    // "title should not be empty". Group them under that property.
    return message.reduce<Record<string, string[]>>((acc, text) => {
      const field = text.split(' ')[0];
      acc[field] = [...(acc[field] ?? []), text];
      return acc;
    }, {});
  }
}
