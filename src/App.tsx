import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <AppRoutes />
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2600,
          // base style for all toasts
          style: {
            padding: '0.45rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            minWidth: '180px',
            boxShadow: '0 6px 20px rgba(2,6,23,0.08)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-card-foreground)',
          },
          success: {
            style: {
              background: 'var(--color-success)',
              color: 'var(--foreground)',
            },
          },
          error: {
            style: {
              background: 'var(--color-destructive)',
              color: 'var(--card)',
            },
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
