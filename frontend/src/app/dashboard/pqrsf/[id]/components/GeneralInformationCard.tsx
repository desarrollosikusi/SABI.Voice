import Card from '@/components/ui/Card';

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
            <InfoRow label="Nombre Completo" value={contact ? `${contact.name} ${contact.apellidos || ''}` : data?.correo} />
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
