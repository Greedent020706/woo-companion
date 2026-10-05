import './styles/theme.scss';
import './styles/tokens.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from './auth/AuthProvider';
import { createQueryClient } from './lib/query-client';
import { router } from './router';
import { ThemeProvider } from './theme/ThemeProvider';

const queryClient = createQueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
