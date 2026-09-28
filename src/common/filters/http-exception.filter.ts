import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import type { HttpErrorResponse } from '../types/http-error-response.js';

interface RequestWithId extends Request {
  id: string;
}
interface ExceptionPayload {
  code?: unknown;
  message?: unknown;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithId>();
    const response = context.getResponse<Response>();
    const requestId = request.id;
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : undefined;
    const normalized = this.normalize(body, statusCode);

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        { err: exception, method: request.method, path: request.originalUrl, requestId },
        'Unhandled request error',
      );
    }

    const payload: HttpErrorResponse = {
      statusCode,
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
      requestId,
    };
    response.status(statusCode).json(payload);
  }

  private normalize(
    body: string | object | undefined,
    statusCode: number,
  ): { code: string; message: string; details: readonly unknown[] } {
    if (typeof body === 'string') {
      return { code: 'HTTP_ERROR', message: body, details: [] };
    }

    const payload = (body ?? {}) as ExceptionPayload;
    if (Array.isArray(payload.message)) {
      return { code: 'VALIDATION_ERROR', message: 'Invalid request', details: payload.message };
    }

    return {
      code:
        typeof payload.code === 'string'
          ? payload.code
          : statusCode >= 500
            ? 'INTERNAL_SERVER_ERROR'
            : 'HTTP_ERROR',
      message:
        statusCode >= 500
          ? 'Internal server error'
          : typeof payload.message === 'string'
            ? payload.message
            : 'Request failed',
      details: Array.isArray(payload.details) ? payload.details : [],
    };
  }
}
