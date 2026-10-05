import { Router } from 'express';
import { loginInputSchema } from '@woo/shared';
import { findUserByCredentials } from '../auth/demo-users';
import { getAuthenticatedUser, type createRequireAuth } from '../auth/require-auth';
import { signToken } from '../auth/tokens';
import { HttpError, parseOrThrow } from '../http-error';

export function createAuthRoutes(
  jwtSecret: string,
  requireAuth: ReturnType<typeof createRequireAuth>,
) {
  const router = Router();

  router.post('/login', (request, response) => {
    const { email, password } = parseOrThrow(loginInputSchema, request.body);
    const user = findUserByCredentials(email, password);
    if (!user) throw new HttpError(401, 'Email o contraseña incorrectos');
    response.json({ token: signToken(user, jwtSecret), user });
  });

  router.get('/me', requireAuth(), (_request, response) => {
    response.json(getAuthenticatedUser(response));
  });

  return router;
}
