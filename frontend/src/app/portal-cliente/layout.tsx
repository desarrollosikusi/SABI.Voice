'use client';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === '/portal-cliente/login';

  useEffect(() => {
    // Add the light theme to the body so the background color is correctly applied globally
    document.body.classList.add('light-theme');
    return () => {
      document.body.classList.remove('light-theme');
    };
  }, []);

  if (isLogin) {
    return (
      <div className="light-theme" style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Inicio', href: '/portal-cliente', icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ) },
    { name: 'Mis casos', href: '/portal-cliente/casos', icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    ) },
    { name: 'Crear solicitud', href: '/nueva-solicitud', icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    ) },
    { name: 'Documentos', href: '/portal-cliente/documentos', icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    ) },
    { name: 'Mi perfil', href: '/portal-cliente/perfil', icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ) },
  ];

  return (
    <div className="light-theme" style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* Mobile hidden Sidebar via CSS class or media query, but for now we render it and use CSS to control */}
      <div className="desktop-sidebar">
        <Sidebar navItems={navItems} basePath="/portal-cliente/login" />
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        {children}
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}
