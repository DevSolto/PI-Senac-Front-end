import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import App from './app/App';
import { router } from './app/router';
import './index.css';

const globalScope = globalThis as typeof globalThis & { __APP_ENV__?: Record<string, string | undefined> };
if (!globalScope.__APP_ENV__) {
  globalScope.__APP_ENV__ = import.meta.env;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300_000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App>
      <RouterProvider router={router} />
    </App>
  </QueryClientProvider>,
);
