import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IKUSI PQRSF Inteligente',
  description: 'Gestión inteligente de PQRSF',
};

import SessionManager from '@/components/SessionManager';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SessionManager />
        {children}
      </body>
    </html>
  );
}
