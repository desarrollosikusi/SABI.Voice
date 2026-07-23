import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useRef, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';

export default function AttachmentsPanel({ data, onUploadComplete }: { data: any, onUploadComplete?: () => void }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [observation, setObservation] = useState('');
  const { success: toastSuccess, error: toastError } = useToast();

  const handleDownload = (att: any) => {
    window.open(`${API_URL}/pqrsf/${data.id}/attachments/${att.id}/download`, '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      await api.uploadAttachment(data.id, selectedFile, observation);
      toastSuccess("Documento adjuntado exitosamente");
      if (onUploadComplete) {
        onUploadComplete();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      toastError(err.message || "Error al adjuntar documento");
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setObservation('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Documentos Adjuntos</h2>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />
        <button 
          className="btn-secondary" 
          style={{ padding: '8px 16px', fontSize: 13 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Subiendo..." : "+ Subir Documento"}
        </button>
      </div>

      <Modal 
        isOpen={!!selectedFile} 
        onClose={() => { setSelectedFile(null); setObservation(''); if(fileInputRef.current) fileInputRef.current.value = ''; }}
        title="Subir Documento Adjunto"
      >
        <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            Vas a subir el archivo: <strong>{selectedFile?.name}</strong>
          </p>
          <Input 
            label="Observación (Obligatorio)" 
            value={observation} 
            onChange={(e) => setObservation(e.target.value)} 
            placeholder="Ej: Evidencia de la falla técnica enviada por el cliente..."
          />
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button 
              className="btn-secondary" 
              onClick={() => { setSelectedFile(null); setObservation(''); if(fileInputRef.current) fileInputRef.current.value = ''; }}
              style={{ flex: 1, padding: '12px' }}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              onClick={handleConfirmUpload}
              disabled={isUploading || observation.trim() === ''}
              style={{ flex: 1, padding: '12px', width: 'auto' }}
            >
              {isUploading ? 'Subiendo...' : 'Confirmar Carga'}
            </button>
          </div>
        </div>
      </Modal>
      
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
