import React from 'react';
import Card from '@/components/ui/Card';

export default function PreferenceSection() {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0' }}>Preferencias Generales</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Configuración de internacionalización y notificaciones (En construcción).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Idioma</label>
            <select className="input-field" disabled>
              <option>Español (Colombia)</option>
              <option>English (US)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notificaciones por Email</label>
            <select className="input-field" disabled>
              <option>Todas las notificaciones</option>
              <option>Solo alertas de seguridad</option>
              <option>Ninguna</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
}
