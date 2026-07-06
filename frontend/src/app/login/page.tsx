'use client';
import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await api.login(username, password);
      localStorage.setItem('token', resp.access_token);
      router.push('/dashboard');
    } catch (err) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-container">
      <div className="glass-panel login-form">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Portal Interno IKUSI</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          />
          <button className="btn-primary" type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}
