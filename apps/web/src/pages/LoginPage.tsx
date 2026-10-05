import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate, type Location } from 'react-router';
import { loginInputSchema, type LoginInput } from '@woo/shared';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../lib/error-message';
import styles from './LoginPage.module.css';

const DEMO_CREDENTIALS: LoginInput = { email: 'admin@demo.com', password: 'demo1234' };

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginInputSchema) });

  const redirectTo = (location.state as { from?: Location } | null)?.from?.pathname ?? '/';

  if (status === 'authenticated') return <Navigate to={redirectTo} replace />;

  const onSubmit = async (credentials: LoginInput) => {
    setLoginError(null);
    try {
      await login(credentials);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setLoginError(getErrorMessage(error));
    }
  };

  const fillDemoCredentials = () => {
    setValue('email', DEMO_CREDENTIALS.email, { shouldValidate: true });
    setValue('password', DEMO_CREDENTIALS.password, { shouldValidate: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>

      <section className={styles.hero} aria-hidden="true">
        <span className={styles.heroMark}>W</span>
        <p className={styles.heroTitle}>Tu tienda, en un solo panel.</p>
        <p className={styles.heroText}>Productos, pedidos y métricas de WooCommerce.</p>
      </section>

      <main className={styles.panel}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Accede al panel de administración.</p>

        {loginError && (
          <Alert variant="danger" role="alert">
            {loginError}
          </Alert>
        )}

        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3" controlId="login-email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              autoComplete="email"
              isInvalid={Boolean(errors.email)}
              {...register('email')}
            />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="login-password">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              autoComplete="current-password"
              isInvalid={Boolean(errors.password)}
              {...register('password')}
            />
            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" className="w-100" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner size="sm" aria-hidden="true" className="me-2" />
            ) : (
              <LogIn size={18} aria-hidden="true" className="me-2" />
            )}
            Entrar
          </Button>
        </Form>

        <div className={styles.demoBox}>
          <span>
            Demo: <code>{DEMO_CREDENTIALS.email}</code> / <code>{DEMO_CREDENTIALS.password}</code>
          </span>
          <Button variant="link" size="sm" onClick={fillDemoCredentials}>
            Rellenar
          </Button>
        </div>
      </main>
    </div>
  );
}
