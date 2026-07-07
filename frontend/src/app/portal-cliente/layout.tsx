'use client';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
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

  return (
    <div className="light-theme" style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* Mobile hidden Sidebar via CSS class or media query, but for now we render it and use CSS to control */}
      <div className="desktop-sidebar">
        <Sidebar />
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
