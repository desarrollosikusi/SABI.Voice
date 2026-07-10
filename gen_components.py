import os

components_dir = r'frontend\src\app\dashboard\pqrsf\[id]\components'

files = {
    'SLAIndicator.tsx': '''import Badge from '@/components/ui/Badge';

export default function SLAIndicator({ data }: { data: any }) {
  const isVencido = data?.estado_sla?.toLowerCase() === 'vencido';
  // If we had logic for "prox_vencer" we would evaluate it here
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Badge variant={isVencido ? 'danger' : 'success'}>
        SLA: {data?.estado_sla || 'Al Día'}
      </Badge>
      {data?.prioridad?.name?.toLowerCase() === 'crítica' && (
        <Badge variant="danger">🔥 Prioridad Crítica</Badge>
      )}
      <Badge variant="neutral">
        Estado: {data?.estado?.name || 'Recibido'}
      </Badge>
    </div>
  );
}
''',
    'AIClassificationCard.tsx': '''import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function AIClassificationCard({ clasificacion }: { clasificacion: any }) {
  if (!clasificacion) {
    return (
      <Card style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px dashed var(--surface-border)' }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>IA no disponible para este caso.</p>
      </Card>
    );
  }

  return (
    <Card style={{ borderLeft: '4px solid #6366f1', backgroundColor: '#fdfdff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 12 }}>S</div>
        <h3 style={{ margin: 0, fontSize: 14 }}>Recomendación de IA (SABI)</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Categoría Sugerida</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{clasificacion.categoria_causa || 'N/A'}</span>
        </div>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Prioridad Sugerida</span>
          <Badge variant="neutral">{clasificacion.prioridad || 'N/A'}</Badge>
        </div>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Nivel de Confianza</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, backgroundColor: 'var(--surface-border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: ${(clasificacion.nivel_confianza || 0) * 100}%, height: '100%', backgroundColor: (clasificacion.nivel_confianza || 0) > 0.8 ? '#10B981' : '#F59E0B' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{Math.round((clasificacion.nivel_confianza || 0) * 100)}%</span>
          </div>
        </div>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Explicación</span>
          <p style={{ margin: 0, fontSize: 13, backgroundColor: 'var(--surface-color)', padding: 8, borderRadius: 4, border: '1px solid var(--surface-border)' }}>
            {clasificacion.explicacion || 'Sin explicación.'}
          </p>
        </div>
      </div>
    </Card>
  );
}
''',
    'GeneralInformationCard.tsx': '''import Card from '@/components/ui/Card';

export default function GeneralInformationCard({ data }: { data: any }) {
  const customer = data?.customer;
  const contact = data?.contact;

  const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{value || 'N/A'}</span>
    </div>
  );

  return (
    <Card>
      <h2 style={{ fontSize: 18, marginBottom: 24, borderBottom: '1px solid var(--surface-border)', paddingBottom: 16 }}>
        Información General
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div>
          <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InfoRow label="Nombre / Razón Social" value={customer?.name || data?.cliente_empresa} />
            <InfoRow label="NIT / Documento" value={customer?.nit} />
            <InfoRow label="Sector Económico" value={customer?.sector || customer?.economic_sector?.name} />
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InfoRow label="Nombre Completo" value={contact ? ${contact.name}  : data?.correo} />
            <InfoRow label="Correo Electrónico" value={contact?.email || data?.correo} />
            <InfoRow label="Teléfono / Celular" value={contact?.celular || contact?.phone} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div>
          <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detalles de la PQRSF</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <InfoRow label="Tipo de Solicitud" value={data?.tipo?.name} />
            <InfoRow label="Prioridad" value={data?.prioridad?.name} />
            <InfoRow label="Estado Actual" value={data?.estado?.name} />
            <InfoRow label="Arquitectura" value={data?.arquitectura?.name} />
            <InfoRow label="Área Responsable" value={data?.area_responsable?.name} />
            <InfoRow label="Responsable Asignado" value={data?.responsable?.name} />
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción Original</h3>
          <p style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.6, background: 'var(--surface-color)', padding: 16, borderRadius: 8, border: '1px solid var(--surface-border)' }}>
            {data?.descripcion}
          </p>
        </div>
      </div>
    </Card>
  );
}
''',
    'AttachmentsPanel.tsx': '''import Card from '@/components/ui/Card';
import { api } from '@/services/api';

export default function AttachmentsPanel({ data }: { data: any }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleDownload = (att: any) => {
    // Basic redirect download, ideally handled via a signed URL or authenticated fetch with blob
    window.open(${API_URL}/pqrsf//attachments//download, '_blank');
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Documentos Adjuntos</h2>
        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
          + Subir Documento
        </button>
      </div>
      
      {data?.attachments && data.attachments.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {data.attachments.map((att: any, i: number) => (
            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'var(--surface-color)', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', fontSize: 20 }}>
                  📄
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{att.file_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{Math.round(att.size / 1024)} KB</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(att)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: 20, flexShrink: 0 }}
                title="Descargar"
              >
                ⬇️
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ textAlign: 'center', padding: 48, backgroundColor: 'var(--surface-color)', borderRadius: 8, border: '1px dashed var(--surface-border)' }}>
          <span style={{ fontSize: 32, marginBottom: 12, display: 'block' }}>📂</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>No hay documentos adjuntos en este caso.</p>
        </div>
      )}
    </Card>
  );
}
''',
    'Timeline.tsx': '''import Card from '@/components/ui/Card';

export default function Timeline({ history, communications }: { history: any[], communications: any[] }) {
  // Fusionar ambos arrays y ordenar por fecha descendente
  const events = [
    ...history.map(h => ({ ...h, type: 'history', date: new Date(h.fecha).getTime() })),
    ...communications.map(c => ({ ...c, type: 'communication', date: new Date(c.fecha).getTime() }))
  ].sort((a, b) => b.date - a.date);

  return (
    <Card>
      <h2 style={{ fontSize: 18, marginBottom: 24 }}>Auditoría y Comunicaciones</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {events.map((ev, i) => {
          let icon = '📝';
          let color = '#94a3b8';
          let title = '';
          let subtitle = new Date(ev.fecha).toLocaleString();

          if (ev.type === 'history') {
            title = ev.accion;
            if (ev.accion.toLowerCase().includes('estado')) { icon = '🔄'; color = '#3b82f6'; }
            else if (ev.accion.toLowerCase().includes('responsable')) { icon = '👤'; color = '#8b5cf6'; }
            else if (ev.accion.toLowerCase().includes('prioridad')) { icon = '🔥'; color = '#ef4444'; }
          } else {
            title = ev.message_type || 'Comunicación';
            if (ev.visible_cliente) { icon = '💬'; color = '#10b981'; }
            else { icon = '🔒'; color = '#f59e0b'; title = 'Nota Interna'; }
            
            if (ev.direccion === 'Entrante') subtitle = Cliente - ;
            else subtitle = ${ev.autor_usuario?.name || 'Soporte'} - ;
          }

          return (
            <div key={${ev.type}-} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 24 }}>
              {/* Line */}
              {i !== events.length - 1 && (
                <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, backgroundColor: 'var(--surface-border)' }} />
              )}
              
              {/* Icon */}
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, zIndex: 1, flexShrink: 0 }}>
                {icon}
              </div>
              
              {/* Content */}
              <div style={{ flex: 1, backgroundColor: 'var(--surface-color)', padding: 16, borderRadius: 8, border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h4>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{subtitle}</span>
                </div>
                
                {ev.type === 'history' ? (
                  ev.field_modified ? (
                    <div style={{ fontSize: 13, background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 4, borderLeft: 3px solid  }}>
                      <p style={{ margin: '0 0 4px 0' }}><strong>Campo:</strong> {ev.field_modified}</p>
                      <p style={{ color: 'var(--status-danger)', margin: 0, textDecoration: 'line-through' }}>{ev.old_value || 'N/A'}</p>
                      <p style={{ color: 'var(--status-aldia)', margin: 0, fontWeight: 500 }}>{ev.new_value}</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{ev.descripcion}</p>
                  )
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {ev.mensaje}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
''',
    'OperationalPanel.tsx': '''import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function OperationalPanel({ data, catalogs, onSave }: { data: any, catalogs: any, onSave: (payload: any) => Promise<void> }) {
  const [form, setForm] = useState({
    estado_id: data?.estado?.id || '',
    prioridad_id: data?.prioridad?.id || '',
    responsable_id: data?.responsable?.id || '',
    nueva_nota: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(form);
      setForm({ ...form, nueva_nota: '' }); // Clear note after save
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = form.estado_id != (data?.estado?.id || '') || 
                     form.prioridad_id != (data?.prioridad?.id || '') || 
                     form.responsable_id != (data?.responsable?.id || '') || 
                     form.nueva_nota.trim() !== '';

  return (
    <Card style={{ position: 'sticky', top: 24 }}>
      <h3 style={{ fontSize: 16, marginBottom: 20, borderBottom: '1px solid var(--surface-border)', paddingBottom: 12 }}>Gestión Operativa</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Estado del Caso</label>
          <select name="estado_id" value={form.estado_id} onChange={handleChange} className="input-field" style={{ padding: 10 }}>
            <option value="">Seleccione...</option>
            {catalogs.states.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Prioridad</label>
          <select name="prioridad_id" value={form.prioridad_id} onChange={handleChange} className="input-field" style={{ padding: 10 }}>
            <option value="">Seleccione...</option>
            {catalogs.priorities.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Responsable</label>
          <select name="responsable_id" value={form.responsable_id} onChange={handleChange} className="input-field" style={{ padding: 10 }}>
            <option value="">Sin Asignar</option>
            {catalogs.users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Nota Interna (Acción realizada)</label>
          <textarea 
            name="nueva_nota" 
            value={form.nueva_nota} 
            onChange={handleChange} 
            className="input-field" 
            style={{ padding: 10, minHeight: 80, resize: 'vertical' }}
            placeholder="Documente la gestión realizada o instrucción para el equipo..."
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={!hasChanges || isSubmitting}
          style={{ padding: '12px 16px', marginTop: 8 }}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </Card>
  );
}
'''
}

for name, content in files.items():
    with open(os.path.join(components_dir, name), 'w', encoding='utf-8') as f:
        f.write(content)
print("Components generated successfully!")
