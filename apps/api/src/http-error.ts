import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { z } from 'zod';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export function parseOrThrow<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fieldErrors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new HttpError(400, 'Datos no válidos', fieldErrors);
  }
  return result.data;
}

export function parseIdParam(rawId: string | string[] | undefined): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Identificador no válido');
  return id;
}

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ message: 'Ruta no encontrada' });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message, details: error.details });
    return;
  }
  console.error(error);
  response.status(500).json({ message: 'Error interno del servidor' });
};
