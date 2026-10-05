import { ApiError } from '@woo/shared';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ha ocurrido un error inesperado';
}
