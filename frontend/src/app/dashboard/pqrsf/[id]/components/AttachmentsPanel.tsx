import Card from '@/components/ui/Card';

export default function AttachmentsPanel({ data }: { data: any }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleDownload = (att: any) => {
    window.open(`${API_URL}/pqrsf/${data.id}/attachments/${att.id}/download`, '_blank');
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
