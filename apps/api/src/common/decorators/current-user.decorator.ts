import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { AuthUser, AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Reads the user that JwtStrategy attached to the request.
 *
 * Controllers use @CurrentUser() instead of @Req(), which keeps the Express
 * request object out of the handler signature and makes handlers trivial to
 * unit test — they take a plain object, not a mock request.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().user;
  },
);
