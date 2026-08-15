import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { ApiSuccess } from '@tms/shared';

/**
 * Wraps every successful controller return value in { success: true, data }.
 * Controllers stay clean — they return domain objects and nothing else — and
 * the client always unwraps responses the same way.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiSuccess<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<T>> {
    return next.handle().pipe(map((data) => ({ success: true as const, data })));
  }
}
