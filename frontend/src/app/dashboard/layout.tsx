'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/services/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="layout-container">
      <div className="sidebar">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="sidebar-logo">SABI Voice</div>
        </Link>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <p style={{ color: pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pathname === '/dashboard' ? 600 : 400, cursor: 'pointer' }}>Dashboard Ejecutivo</p>
          </Link>
          <Link href="/dashboard/pqrsf" style={{ textDecoration: 'none' }}>
            <p style={{ color: pathname.includes('/dashboard/pqrsf') ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pathname.includes('/dashboard/pqrsf') ? 600 : 400, cursor: 'pointer' }}>Gestión de Casos</p>
          </Link>
          <Link href="/dashboard/admin" style={{ textDecoration: 'none' }}>
            <p style={{ color: pathname.includes('/dashboard/admin') ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pathname.includes('/dashboard/admin') ? 600 : 400, cursor: 'pointer' }}>Administración</p>
          </Link>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: 14 }}>
          Cerrar Sesión
        </button>
      </div>
      
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
