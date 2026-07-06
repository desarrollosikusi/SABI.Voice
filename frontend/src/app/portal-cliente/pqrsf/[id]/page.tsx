'use client';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerCaseDetail({ params }: { params: { id: string } }) {
  const [pqrsf, setPqrsf] = useState<any>(null);
  const [communications, setCommunications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [communications]);

  const fetchData = async () => {
    try {
      const [caseData, commsData] = await Promise.all([
        api.getPqrsfById(params.id),
        api.getCommunications(params.id)
      ]);
      setPqrsf(caseData);
      setCommunications(commsData);
    } catch (err) {
      console.error(err);
      alert("Error al cargar la información. Redirigiendo...");
      window.location.href = '/portal-cliente';
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await api.createCommunication(params.id, {
        tipo: "Cliente",
        message_type: "Solicitud",
        direccion: "Entrante",
        canal: "Portal",
        mensaje: message
      });
      setMessage('');
      fetchData(); // reload messages
    } catch (err) {
      console.error(err);
      alert("Error al enviar el mensaje");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando detalles...</div>;
  if (!pqrsf) return null;

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      
      <header style={{ marginBottom: 24, flexShrink: 0 }}>
        <Link href="/portal-cliente" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
          &larr; Volver a Mis Casos
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.8rem' }}>Caso {pqrsf.consecutivo}</h1>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '1.1rem' }}>{pqrsf.asunto}</p>
          </div>
          <span style={{ 
            padding: '6px 16px', 
            borderRadius: '100px', 
            fontSize: '1rem',
            fontWeight: 600,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#3B82F6'
          }}>
            {pqrsf.estado?.name || 'Recibido'}
          </span>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: 24 }} className="hide-scrollbar">
        {/* Initial message representation */}
        <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
          <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 4, marginLeft: 8 }}>
            Tú - {new Date(pqrsf.fecha_creacion).toLocaleString()}
          </div>
          <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '20px', borderTopLeftRadius: '4px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{pqrsf.descripcion}</p>
          </div>
        </div>

        {communications.map(comm => {
          const isCustomer = comm.tipo === 'Cliente';
          return (
            <div key={comm.id} style={{ alignSelf: isCustomer ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 4, marginLeft: isCustomer ? 0 : 8, marginRight: isCustomer ? 8 : 0, textAlign: isCustomer ? 'right' : 'left' }}>
                {isCustomer ? 'Tú' : 'Soporte IKUSI'} - {new Date(comm.fecha).toLocaleString()}
              </div>
              <div className="glass-panel" style={{ 
                padding: '16px 20px', 
                borderRadius: '20px', 
                borderTopRightRadius: isCustomer ? '4px' : '20px',
                borderTopLeftRadius: isCustomer ? '20px' : '4px',
                backgroundColor: isCustomer ? '#EBF5FF' : '#ffffff',
                border: isCustomer ? '1px solid #BFDBFE' : '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{comm.mensaje}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="glass-panel" style={{ padding: 16, flexShrink: 0 }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12 }}>
          <input 
            className="input-field"
            style={{ flex: 1, margin: 0, borderRadius: '100px', padding: '12px 24px' }}
            placeholder="Escribe tu mensaje aquí..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: '100px', padding: '0 24px' }} disabled={!message.trim()}>
            Enviar
          </button>
        </form>
      </div>
      
    </div>
  );
}
