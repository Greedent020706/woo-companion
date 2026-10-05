import type { RequestHandler, Response } from 'express';
import type { User, UserRole } from '@woo/shared';
import { HttpError } from '../http-error';
import { verifyToken } from './tokens';

declare module 'express-serve-static-core' {
  interface Locals {
    user?: User;
  }
}

export function createRequireAuth(jwtSecret: string) {
  return function requireAuth(...allowedRoles: UserRole[]): RequestHandler {
    return (request, response, next) => {
      const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
      if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Necesitas iniciar sesión');

      const user = verifyToken(token, jwtSecret);
      if (!user) throw new HttpError(401, 'La sesión ha caducado, vuelve a entrar');
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new HttpError(403, 'No tienes permiso para esta acción');
      }

      response.locals.user = user;
      next();
    };
  };
}

export function getAuthenticatedUser(response: Response): User {
  const user = response.locals.user;
  if (!user) throw new HttpError(401, 'Necesitas iniciar sesión');
  return user;
}
