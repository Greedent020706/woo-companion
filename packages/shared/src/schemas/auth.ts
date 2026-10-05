import { z } from 'zod';

export const USER_ROLES = ['admin', 'customer'] as const;

export const loginInputSchema = z.object({
  email: z.email('Introduce un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const userSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string(),
  role: z.enum(USER_ROLES),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type User = z.infer<typeof userSchema>;
export type UserRole = User['role'];
export type LoginResponse = z.infer<typeof loginResponseSchema>;
