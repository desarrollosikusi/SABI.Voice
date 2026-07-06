'use client';
import { useEffect } from 'react';
import { logout } from '@/services/api';
import { usePathname } from 'next/navigation';

export default function SessionManager() {
  const pathname = usePathname();

  useEffect(() => {
    // No timeout on login pages
    if (pathname.includes('/login')) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      // 30 minutes idle timeout
      timeoutId = setTimeout(() => {
        alert("Su sesión ha expirado por inactividad.");
        logout();
      }, 30 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [pathname]);

  return null;
}
