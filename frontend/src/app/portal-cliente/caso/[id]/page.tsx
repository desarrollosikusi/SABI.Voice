'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import SabiCompanion from '@/components/SabiCompanion';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';
import ConversationBubble from '@/components/ConversationBubble';
import { useParams } from 'next/navigation';

export default function CustomerCaseDetail() {
  const params = useParams();
  const pqrsfId = params.id as string;

  const [pqrsf, setPqrsf] = useState<any>(null);
  const [communications, setCommunications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [pqrsfId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [caseData, commsData] = await Promise.all([
        api.getCustomerPqrsfById(pqrsfId),
        api.getCustomerPqrsfCommunications(pqrsfId)
      ]);
      setPqrsf(caseData);
      setCommunications(commsData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al cargar el caso');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    
    try {
      setIsSubmitting(true);
      const newComm = await api.createCustomerCommunication(pqrsfId, replyMessage);
      setCommunications([...communications, newComm]);
      setReplyMessage('');
      // Update last updated date locally
      setPqrsf({ ...pqrsf, fecha_ultima_actualizacion: newComm.fecha });
    } catch (err: any) {
      console.error(err);
      alert('Error al enviar la respuesta: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ width: 200, height: 24, backgroundColor: '#334155', borderRadius: 4, marginBottom: 24, animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: 400, height: 48, backgroundColor: '#334155', borderRadius: 8, marginBottom: 32, animation: 'pulse 1.5s infinite' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 40 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height: 100, backgroundColor: '#1E293B', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />)}
        </div>
        
        <div style={{ height: 150, backgroundColor: '#1E293B', borderRadius: 8, marginBottom: 40, animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 300, backgroundColor: '#1E293B', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}</style>
      </div>
    );
  }

  if (errorMsg || !pqrsf) {
    return (
      <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <Link href="/portal-cliente" style={{ color: 'var(--primary)', textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>
          ← Volver al Dashboard
        </Link>
        <div style={{ padding: 24, backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: 8 }}>
          {errorMsg || 'Caso no encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px 120px 20px', maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ marginBottom: 32 }}>
        <Link href="/portal-cliente" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--primary)', textDecoration: 'none', marginBottom: 16, fontWeight: 600 }}>
          ← Volver al Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', color: 'var(--text-primary)' }}>{pqrsf.consecutivo}</h1>
            <p style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-secondary)' }}>{pqrsf.asunto}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge status={pqrsf.estado_visible} type="estado" />
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>
              Creado el {new Date(pqrsf.fecha_creacion).toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      {/* Resumen KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 40 }}>
        <Card style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Estado</div>
          <StatusBadge status={pqrsf.estado_visible} type="estado" />
        </Card>
        <Card style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Responsable</div>
          <StatusBadge status={pqrsf.responsable_actual} type="responsable" />
        </Card>
        <Card style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>SLA</div>
          <StatusBadge status={pqrsf.estado_sla || 'En tiempo'} type="sla" />
        </Card>
        <Card style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Última Actualización</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: 4 }}>
            {new Date(pqrsf.fecha_ultima_actualizacion).toLocaleDateString()}
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32, marginBottom: 40, alignItems: 'start' }} className="detail-grid">
        <style>{`
          @media (min-width: 900px) {
            .detail-grid { grid-template-columns: 2fr 1fr !important; }
          }
        `}</style>
        
        {/* Left Column: Description & Timeline */}
        <div>
          {/* Descripción Original */}
          <Card style={{ padding: 24, marginBottom: 40 }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Descripción del Caso</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {pqrsf.descripcion_original}
            </p>
          </Card>

          {/* Timeline de Comunicaciones */}
          <div>
            <h3 style={{ marginBottom: 24, color: 'var(--text-primary)' }}>Línea de Tiempo</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', left: 24, top: 0, bottom: 0, width: 2, backgroundColor: '#e2e8f0', zIndex: 0 }} />
              
              {/* Primer Evento: Registro */}
              <ConversationBubble 
                isIkusi={false}
                senderName="Caso registrado (Cliente)"
                date={new Date(pqrsf.fecha_creacion).toLocaleString()}
                message="El caso ha sido ingresado al sistema exitosamente."
                icon="📝"
              />

              {/* Comunicaciones iteradas */}
              {communications.map((comm, idx) => (
                <ConversationBubble 
                  key={comm.id}
                  isIkusi={comm.remitente === 'IKUSI'}
                  senderName={comm.remitente === 'IKUSI' ? 'IKUSI respondió' : 'Cliente respondió'}
                  date={new Date(comm.fecha).toLocaleString()}
                  message={comm.mensaje}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column: SABI & Info */}
        <div>
          <SabiCompanion 
            layout="detail"
            message={pqrsf.estado_visible === 'Cerrado' ? "Tu caso fue resuelto y puedes revisar el detalle." : (pqrsf.responsable_actual === 'IKUSI' ? "Nuestro equipo está trabajando en tu solicitud." : "Estamos esperando información adicional de tu parte.")}
            subMessage={pqrsf.estado_visible === 'Cerrado' ? undefined : "Recibirás una notificación con cualquier actualización."}
          />
          <Card style={{ marginTop: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Información del caso</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Categoría</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{pqrsf.tipo}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cliente</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{pqrsf.cliente_empresa || pqrsf.correo}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Área</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{pqrsf.area_responsable || 'Sin asignar'}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Caja de Respuesta Fija */}
      {pqrsf.estado_visible !== 'Cerrado' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--surface-border)', padding: '16px 0', zIndex: 50, boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
            <form onSubmit={handleReply} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <div style={{ flexGrow: 1 }}>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={pqrsf.responsable_actual === 'IKUSI' ? "Escribe tu actualización aquí..." : "Escribe tu respuesta aquí..."}
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--surface-border)',
                    color: 'var(--text-primary)',
                    minHeight: 80,
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                  disabled={isSubmitting}
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary"
                style={{ alignSelf: 'center', padding: '16px 32px' }}
                disabled={isSubmitting || !replyMessage.trim()}
              >
                {isSubmitting ? 'Enviando...' : (pqrsf.responsable_actual === 'IKUSI' ? 'Enviar nueva actualización' : 'Enviar Respuesta')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
