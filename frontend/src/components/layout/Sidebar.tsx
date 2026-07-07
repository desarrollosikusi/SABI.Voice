import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/services/api';

export type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

type SidebarProps = {
  logo?: React.ReactNode;
  navItems: NavItem[];
  basePath?: string;
};

export default function Sidebar({ logo, navItems, basePath = '/login' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(basePath);
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--surface-color)',
      borderRight: '1px solid var(--surface-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'sticky',
      top: 0,
      height: '100vh',
      flexShrink: 0,
      zIndex: 20
    }}>
      
      {/* Logo Area */}
      <div style={{ padding: '0 12px', marginBottom: '40px' }}>
        {logo || (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>IKUSI</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            width: '100%',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
