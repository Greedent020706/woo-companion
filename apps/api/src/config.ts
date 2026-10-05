import { z } from 'zod';

const DEV_ONLY_JWT_SECRET = 'dev-only-secret-change-me';

try {
  process.loadEnvFile();
} catch {
  // Sin .env usamos los valores por defecto: modo mock en el puerto 4000
}

const envSchema = z
  .object({
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    DATA_SOURCE: z.enum(['mock', 'woo']).default('mock'),
    JWT_SECRET: z.string().min(16).default(DEV_ONLY_JWT_SECRET),
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
    WOO_URL: z.url().optional(),
    WOO_KEY: z.string().optional(),
    WOO_SECRET: z.string().optional(),
  })
  .superRefine((env, context) => {
    if (env.DATA_SOURCE === 'woo' && !(env.WOO_URL && env.WOO_KEY && env.WOO_SECRET)) {
      context.addIssue({
        code: 'custom',
        message: 'DATA_SOURCE=woo necesita WOO_URL, WOO_KEY y WOO_SECRET en apps/api/.env',
      });
    }
    if (env.NODE_ENV === 'production' && env.JWT_SECRET === DEV_ONLY_JWT_SECRET) {
      context.addIssue({ code: 'custom', message: 'Define JWT_SECRET en producción' });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Configuración no válida:');
  for (const issue of parsedEnv.error.issues) {
    console.error(`  - ${issue.path.join('.') || 'env'}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsedEnv.data;

export const config = {
  port: env.PORT,
  dataSource: env.DATA_SOURCE,
  jwtSecret: env.JWT_SECRET,
  corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
  woo: {
    url: env.WOO_URL ?? '',
    key: env.WOO_KEY ?? '',
    secret: env.WOO_SECRET ?? '',
  },
};

export type AppConfig = typeof config;
