import jwt from 'jsonwebtoken';
import { userSchema, type User } from '@woo/shared';

const TOKEN_LIFETIME = '8h';

export function signToken(user: User, secret: string): string {
  return jwt.sign(user, secret, { expiresIn: TOKEN_LIFETIME, subject: String(user.id) });
}

export function verifyToken(token: string, secret: string): User | null {
  try {
    const payload = jwt.verify(token, secret);
    const parsedUser = userSchema.safeParse(payload);
    return parsedUser.success ? parsedUser.data : null;
  } catch {
    return null;
  }
}
