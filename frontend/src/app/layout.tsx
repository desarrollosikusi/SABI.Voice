import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IKUSI PQRSF Inteligente',
  description: 'Gestión inteligente de PQRSF',
};

import SessionManager from '@/components/SessionManager';
import { ToastProvider } from '@/contexts/ToastContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>
          <SessionManager />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
