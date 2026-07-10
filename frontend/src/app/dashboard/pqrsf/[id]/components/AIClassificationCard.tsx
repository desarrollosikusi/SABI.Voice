import Card from '@/components/ui/Card';
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
              <div style={{ width: `${(clasificacion.nivel_confianza || 0) * 100}%`, height: '100%', backgroundColor: (clasificacion.nivel_confianza || 0) > 0.8 ? '#10B981' : '#F59E0B' }} />
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
