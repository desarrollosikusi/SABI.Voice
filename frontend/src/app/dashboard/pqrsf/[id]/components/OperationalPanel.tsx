import { useState } from 'react';
import Card from '@/components/ui/Card';
import StatusTransitionModal from './StatusTransitionModal';

export default function OperationalPanel({ data, catalogs, onSave }: { data: any, catalogs: any, onSave: (payload: any) => Promise<void> }) {
  const [form, setForm] = useState({
    prioridad_id: data?.prioridad?.id || '',
    responsable_id: data?.responsable?.id || '',
    nueva_nota: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(form);
      setForm(prev => ({ ...prev, nueva_nota: '' })); // Clear note after save
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = form.prioridad_id != (data?.prioridad?.id || '') || 
                     form.responsable_id != (data?.responsable?.id || '') || 
                     form.nueva_nota.trim() !== '';

  return (
    <>
      <Card style={{ position: 'sticky', top: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 20, borderBottom: '1px solid var(--surface-border)', paddingBottom: 12 }}>Gestión Operativa</h3>
        
        {/* Workflow Status Section */}
        <div style={{ marginBottom: 24, padding: 16, backgroundColor: 'var(--bg-color)', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Estado del Caso (Workflow)</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {data?.estado?.name || 'Desconocido'}
            </span>
            <button 
              type="button"
              onClick={() => setShowTransitionModal(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--surface-color)',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cambiar Estado
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Prioridad</label>
            <select name="prioridad_id" value={form.prioridad_id} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
              <option value="">Seleccione...</option>
              {catalogs.priorities.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Responsable</label>
            <select name="responsable_id" value={form.responsable_id} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
              <option value="">Sin Asignar</option>
              {catalogs.users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Nota Interna Libre</label>
            <textarea 
              name="nueva_nota" 
              value={form.nueva_nota} 
              onChange={handleChange} 
              className="input-field" 
              style={{ width: '100%', padding: '10px', minHeight: '80px', resize: 'vertical', borderRadius: '6px', border: '1px solid var(--surface-border)' }}
              placeholder="Documente la gestión realizada o instrucción para el equipo..."
            />
          </div>

          <button 
            type="submit" 
            disabled={!hasChanges || isSubmitting}
            style={{ 
              padding: '12px 16px', 
              marginTop: 8,
              backgroundColor: !hasChanges || isSubmitting ? '#94a3b8' : 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: !hasChanges || isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Actualizar Caso'}
          </button>
        </form>
      </Card>

      {showTransitionModal && (
        <StatusTransitionModal 
          pqrsfId={data.id}
          currentStateName={data?.estado?.name}
          catalogs={catalogs}
          onClose={() => setShowTransitionModal(false)}
          onSuccess={() => {
            setShowTransitionModal(false);
            onSave({}); // Trigger a refresh without payload by taking advantage of the fact that empty payload won't change data but fetchAllData is called.
            // Wait, onSave sends payload to API. If payload is empty, API might do nothing and then fetchAllData is called! Let's check how handleSaveOperational behaves in page.tsx.
          }}
        />
      )}
    </>
  );
}
