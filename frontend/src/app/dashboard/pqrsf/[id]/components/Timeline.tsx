import Card from '@/components/ui/Card';

export default function Timeline({ history, communications }: { history: any[], communications: any[] }) {
  // Fusionar ambos arrays y ordenar por fecha descendente
  const events = [
    ...(history || []).map(h => ({ ...h, type: 'history', date: new Date(h.fecha).getTime() })),
    ...(communications || []).map(c => ({ ...c, type: 'communication', date: new Date(c.fecha).getTime() }))
  ].sort((a, b) => b.date - a.date);

  return (
    <Card>
      <h2 style={{ fontSize: 18, marginBottom: 24 }}>Auditoría y Comunicaciones</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {events.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No hay eventos registrados en este caso.</p>
        ) : null}
        {events.map((ev, i) => {
          let icon = '📝';
          let color = '#94a3b8';
          let title = '';
          let subtitle = new Date(ev.fecha).toLocaleString();

          if (ev.type === 'history') {
            title = ev.accion;
            if (ev.accion.toLowerCase().includes('estado') || (ev.field_modified && ev.field_modified.toLowerCase().includes('estado'))) { icon = '🔄'; color = '#3b82f6'; }
            else if (ev.accion.toLowerCase().includes('responsable') || (ev.field_modified && ev.field_modified.toLowerCase().includes('responsable'))) { icon = '👤'; color = '#8b5cf6'; }
            else if (ev.accion.toLowerCase().includes('prioridad') || (ev.field_modified && ev.field_modified.toLowerCase().includes('prioridad'))) { icon = '🔥'; color = '#ef4444'; }
          } else {
            title = ev.message_type || 'Comunicación';
            if (ev.visible_cliente) { icon = '💬'; color = '#10b981'; }
            else { icon = '🔒'; color = '#f59e0b'; title = 'Nota Interna'; }
            
            if (ev.direccion === 'Entrante') subtitle = `Cliente - ${subtitle}`;
            else subtitle = `${ev.autor_usuario?.name || 'Soporte'} - ${subtitle}`;
          }

          return (
            <div key={`${ev.type}-${ev.id}`} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 24 }}>
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
                    <div style={{ fontSize: 13, background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 4, borderLeft: `3px solid ${color}` }}>
                      <p style={{ margin: '0 0 4px 0' }}><strong>Campo Modificado:</strong> {ev.field_modified}</p>
                      <p style={{ color: '#ef4444', margin: 0, textDecoration: 'line-through' }}>{ev.old_value || 'N/A'}</p>
                      <p style={{ color: '#10b981', margin: 0, fontWeight: 500 }}>{ev.new_value}</p>
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
