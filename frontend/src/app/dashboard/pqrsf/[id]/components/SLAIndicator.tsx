import Badge from '@/components/ui/Badge';

export default function SLAIndicator({ data }: { data: any }) {
  const isVencido = data?.estado_sla?.toLowerCase() === 'vencido';
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
