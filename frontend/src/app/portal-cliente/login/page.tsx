'use client';
import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await api.login(email, password);
      // We store the token in the same place as admin. 
      // The API validates user_type via JWT claims.
      localStorage.setItem('token', resp.access_token);
      router.push('/portal-cliente');
    } catch (err) {
      alert("Credenciales incorrectas o contacto no autorizado.");
    }
  };

  return (
    <div className="login-container">
      <div className="glass-panel login-form">
        <h2 style={{ textAlign: 'center', marginBottom: 24, color: 'var(--primary)' }}>SABI Voice - Portal del Cliente</h2>
        <p style={{ textAlign: 'center', marginBottom: 24, fontSize: '0.9rem', color: '#666' }}>Inicie sesión con su correo corporativo y contraseña autorizada.</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input 
            className="input-field" 
            type="email"
            placeholder="Correo Electrónico" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required
          />
          <input 
            className="input-field" 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
          />
          <button className="btn-primary" type="submit">Ingresar al Portal</button>
        </form>
      </div>
    </div>
  );
}
