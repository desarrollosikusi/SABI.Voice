import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { logout } from '@/services/api';

export default function UserMenu() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading || !user) return <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e2e8f0' }} />;

  const getInitial = () => user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <div style={{ 
          width: '32px', height: '32px', borderRadius: '50%', 
          backgroundColor: 'var(--primary)', color: '#fff', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontWeight: 'bold', fontSize: '0.9rem',
          backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}>
          {!user.avatarUrl && getInitial()}
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', top: '100%', right: 0, marginTop: '8px',
          backgroundColor: 'var(--surface-color)', border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
          width: '200px', zIndex: 100, overflow: 'hidden'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--surface-border)' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</p>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{user.email}</p>
          </div>
          
          <button 
            onClick={() => { setIsOpen(false); router.push('/dashboard/perfil'); }}
            style={{ 
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', 
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Mi Perfil
          </button>
          
          <button 
            onClick={handleLogout} 
            style={{ 
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', 
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
              color: 'var(--danger)', borderTop: '1px solid var(--surface-border)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
