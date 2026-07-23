import React, { useState } from 'react';
import TicketFormBase from './TicketFormBase';
import CustomerSelector, { CustomerInfo } from './CustomerSelector';
import StakeholderSelector from './StakeholderSelector';
import AttachmentUploader from './AttachmentUploader';

interface Props {
  catalogs: {
    types: any[];
    priorities: any[];
  };
  onSubmit: (payload: any, files: File[]) => Promise<void>;
  isSubmitting: boolean;
  categoryId: number;
  category?: any;
}

export default function CustomerTicketForm({ catalogs, onSubmit, isSubmitting, categoryId, category }: Props) {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [contact, setContact] = useState<any | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    tipo_id: '',
    prioridad_id: '',
    fecha_limite_sugerida: '',
    asunto: '',
    descripcion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !contact) {
      alert('Debes seleccionar un cliente y a quién va dirigido.');
      return;
    }
    
    const payload = {
      ...formData,
      customer_id: customer.id,
      cliente_empresa: customer.name,
      contact_id: contact.id,
      correo: contact.email,
      category_id: categoryId,
    };
    
    onSubmit(payload, files);
  };

  const getTodayString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <TicketFormBase 
      title="Ticket hacia el Cliente"
      description="Registrar una solicitud que será enviada a un cliente para realizar seguimiento, solicitar información o gestionar una actividad."
      customerName={customer?.name}
      contactEmail={contact?.email}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', alignItems: 'start' }}>
        
        {/* Izquierda: Formulario Principal */}
        <div className="saas-card" style={{ padding: '40px' }}>
          <h2 style={{ marginBottom: 32, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>💬</span> Detalles del Ticket
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CustomerSelector selectedCustomer={customer} onSelect={(c) => { setCustomer(c); setContact(null); }} />
              <StakeholderSelector customerId={customer?.id} selectedStakeholder={contact} onSelect={setContact} label="A quién va dirigida *" />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Tipo *</label>
                <select required name="tipo_id" value={formData.tipo_id} onChange={handleChange} className="input-field" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}>
                  <option value="" disabled>Seleccione...</option>
                  {catalogs.types
                    .filter(t => !category?.form_schema?.allowed_type_codes || category.form_schema.allowed_type_codes.includes(t.code))
                    .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Prioridad *</label>
                <select required name="prioridad_id" value={formData.prioridad_id} onChange={handleChange} className="input-field" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}>
                  <option value="" disabled>Seleccione...</option>
                  {catalogs.priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Fecha límite sugerida *</label>
              <input required name="fecha_limite_sugerida" value={formData.fecha_limite_sugerida} min={getTodayString()} onChange={handleChange} className="input-field" type="date" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Asunto *</label>
              <input required name="asunto" value={formData.asunto} onChange={handleChange} className="input-field" type="text" placeholder="Resume la necesidad en una frase..." style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Descripción Detallada *</label>
              <textarea required name="descripcion" value={formData.descripcion} onChange={handleChange} className="input-field" rows={8} placeholder="Describe con el mayor nivel de detalle posible..." style={{ padding: '16px', fontSize: '1.05rem', resize: 'vertical', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}></textarea>
            </div>
            
            <AttachmentUploader files={files} setFiles={setFiles} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: 'fit-content', padding: '14px 28px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '8px' }}>
                {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </TicketFormBase>
  );
}
