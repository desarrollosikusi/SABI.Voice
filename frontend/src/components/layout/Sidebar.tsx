import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedState = localStorage.getItem('sabi_sidebar_collapsed');
    if (storedState !== null) {
      setIsCollapsed(storedState === 'true');
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push(basePath);
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sabi_sidebar_collapsed', newState.toString());
  };

  const effectiveCollapsed = isCollapsed && !isHovered;
  const width = effectiveCollapsed ? '80px' : '260px';

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <aside 
      style={{
        width,
        backgroundColor: 'var(--surface-color)',
        borderRight: '1px solid var(--surface-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
        zIndex: 20,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowX: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Logo Area */}
      <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', height: '32px' }}>
        {logo || (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
            <div style={{ flexShrink: 0, width: 32, height: 32, backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)', 
              letterSpacing: '-0.02em',
              opacity: effectiveCollapsed ? 0 : 1,
              transition: 'opacity 0.2s',
              whiteSpace: 'nowrap'
            }}>IKUSI</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, padding: '0 16px' }}>
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
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
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ 
                  fontSize: '0.95rem',
                  opacity: effectiveCollapsed ? 0 : 1,
                  transition: 'opacity 0.2s'
                }}>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle & Logout */}
      <div style={{ padding: '24px 16px 0 16px', borderTop: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Toggle Collapse Pin */}
        <button 
          onClick={toggleCollapse}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </span>
          <span style={{ 
            fontSize: '0.95rem',
            opacity: effectiveCollapsed ? 0 : 1,
            transition: 'opacity 0.2s'
          }}>Fijar menú</span>
        </button>

        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            color: 'var(--color-danger)',
            fontWeight: 500,
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </span>
          <span style={{ 
            fontSize: '0.95rem',
            opacity: effectiveCollapsed ? 0 : 1,
            transition: 'opacity 0.2s'
          }}>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
