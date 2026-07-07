'use client';
import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import SabiCompanion from '@/components/SabiCompanion';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const resp = await api.login(email, password);
      localStorage.setItem('token', resp.access_token);
      router.push('/portal-cliente');
    } catch (err) {
      setErrorMsg("Credenciales incorrectas o contacto no autorizado.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'row', width: '90%', maxWidth: 1000, overflow: 'hidden', padding: 0, minHeight: 600 }}>
        
        {/* Left Column - Form */}
        <div style={{ flex: 1, padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', margin: '0 0 16px 0', lineHeight: 1.2 }}>Bienvenido al<br />Portal del Cliente</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
              Inicia sesión para hacer seguimiento a tus solicitudes y comunicarte con nuestro equipo.
            </p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <input 
              className="input-field" 
              style={{ padding: 16, fontSize: '1rem' }}
              type="email"
              placeholder="Correo electrónico" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
            <input 
              className="input-field" 
              style={{ padding: 16, fontSize: '1rem' }}
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
            {errorMsg && (
              <div style={{ color: '#EF4444', fontSize: '0.9rem' }}>{errorMsg}</div>
            )}
            <button className="btn-primary" style={{ padding: 16, fontSize: '1.1rem', marginTop: 8 }} type="submit">Iniciar sesión</button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem' }}>
            <a href="#" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</a>
          </p>
        </div>

        {/* Right Column - SABI */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', backgroundColor: '#f1f5f9' }}>
          <SabiCompanion 
            layout="login"
            message="Te acompañaré en el seguimiento de tus solicitudes y en la comunicación con nuestro equipo para brindarte una mejor experiencia."
          />
        </div>
      </div>
    </div>
  );
}
