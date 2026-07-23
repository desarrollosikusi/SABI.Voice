import React, { useState } from 'react';
import { CurrentUser } from '@/services/userService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface UserProfileFormProps {
  user: CurrentUser;
  mode: 'readonly' | 'editable';
  onSave?: (data: Partial<CurrentUser>) => Promise<void>;
  onCancel?: () => void;
}

export default function UserProfileForm({ user, mode, onSave, onCancel }: UserProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    job_title: user.job_title || '',
    phone: user.phone || '',
    role: user.role || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'readonly' || !onSave) return;
    
    setLoading(true);
    setError(null);
    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nombre Completo</label>
            <input 
              name="name"
              value={formData.name} 
              onChange={handleChange}
              disabled={mode === 'readonly'} 
              className="input-field" 
              style={{ opacity: mode === 'readonly' ? 0.7 : 1 }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Correo Electrónico</label>
            <input 
              type="email"
              name="email"
              value={formData.email} 
              onChange={handleChange}
              disabled={mode === 'readonly'} 
              className="input-field" 
              style={{ opacity: mode === 'readonly' ? 0.7 : 1 }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cargo</label>
            <input 
              name="job_title"
              value={formData.job_title} 
              onChange={handleChange}
              disabled={mode === 'readonly'} 
              className="input-field" 
              style={{ opacity: mode === 'readonly' ? 0.7 : 1 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Celular</label>
            <input 
              name="phone"
              value={formData.phone} 
              onChange={handleChange}
              disabled={mode === 'readonly'} 
              className="input-field" 
              style={{ opacity: mode === 'readonly' ? 0.7 : 1 }}
            />
          </div>

          {mode === 'editable' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rol del Sistema</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Administrador">Administrador</option>
                <option value="Agente">Agente</option>
                <option value="Consultor">Consultor</option>
              </select>
            </div>
          )}
        </div>

        {mode === 'editable' && (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '16px' }}>
            {onCancel && <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>}
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
