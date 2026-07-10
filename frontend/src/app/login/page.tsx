'use client';
import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

export default function LoginPage() {
  const { error: toastError } = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await api.login(username, password);
      // The backend sets the HttpOnly cookie automatically via the Next.js proxy
      // Redirect directly to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      toastError(err.message || "Credenciales incorrectas");
    }
  };

  return (
    <div className="login-container">
      <div className="saas-card login-form">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Portal Interno IKUSI</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input 
            className="input-field" 
            placeholder="Usuario" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
          <input 
            className="input-field" 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin(e as any)}
          />
          <button className="btn-primary" type="button" onClick={handleLogin}>Ingresar</button>
        </div>
      </div>
    </div>
  );
}
