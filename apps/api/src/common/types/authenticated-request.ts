import type { Request } from 'express';

/** Shape attached to the request by JwtStrategy.validate(). */
export interface AuthUser {
  userId: string;
  displayName: string;
  isGuest: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
