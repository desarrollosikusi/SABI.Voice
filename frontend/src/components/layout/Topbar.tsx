import React from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/api';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

type TopbarProps = {
  userName?: string;
};

export default function Topbar({ userName = 'Administrador' }: TopbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header style={{ 
      height: '64px', 
      backgroundColor: 'var(--surface-color)', 
      borderBottom: '1px solid var(--surface-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Simple global search placeholder */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
          <span style={{ color: 'var(--text-disabled)', marginRight: '8px' }}>🔍</span>
          <input type="text" placeholder="Buscar..." style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
        </div>

        {/* User profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--surface-border)', paddingLeft: '24px' }}>
          
          <NotificationBell />
          <UserMenu />

        </div>
      </div>
    </header>
  );
}
