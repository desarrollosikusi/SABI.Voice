import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';

type WorkflowTransition = {
  id: number;
  from_state_id: number;
  to_state_id: number;
  to_state_name: string;
  allowed_roles: string;
  require_note: boolean;
  require_assignment: boolean;
  require_evidence: boolean;
};

type Props = {
  pqrsfId: number;
  currentStateName: string;
  catalogs: any;
  onClose: () => void;
  onSuccess: () => void;
};

export default function StatusTransitionModal({ pqrsfId, currentStateName, catalogs, onClose, onSuccess }: Props) {
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransition, setSelectedTransition] = useState<WorkflowTransition | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [note, setNote] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTransitions();
  }, [pqrsfId]);

  const fetchTransitions = async () => {
    try {
      const data = await api.getAllowedTransitions(pqrsfId);
      setTransitions(data);
    } catch (err) {
      console.error("Error loading transitions:", err);
      setError("Error al cargar las transiciones permitidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransition) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        to_state_id: selectedTransition.to_state_id,
      };
      
      if (note) payload.note = note;
      if (assignedTo) payload.assigned_to = parseInt(assignedTo);
      if (evidenceUrl) payload.evidence_url = evidenceUrl;

      await api.executeTransition(pqrsfId, payload);
      onSuccess();
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || "Error al ejecutar transición";
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'var(--surface-color)',
        padding: '24px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '500px',
        zIndex: 101,
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Cambiar Estado</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Estado actual: <strong>{currentStateName}</strong>
        </p>

        {loading ? (
          <div>Cargando opciones...</div>
        ) : error && !selectedTransition ? (
          <div style={{ color: 'var(--danger)', padding: 12, backgroundColor: '#fee2e2', borderRadius: 6 }}>{error}</div>
        ) : transitions.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-color)', borderRadius: 6 }}>
            No tienes transiciones permitidas desde este estado.
          </div>
        ) : !selectedTransition ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontWeight: 500 }}>Seleccione el estado destino:</label>
            {transitions.map(t => (
              <button 
                key={t.id}
                onClick={() => setSelectedTransition(t)}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 500 }}>{t.to_state_name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {t.require_note && "Nota Requerida"} 
                  {t.require_assignment && " • Asignación Requerida"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>Transición: <strong>{currentStateName} &rarr; {selectedTransition.to_state_name}</strong></span>
              <button type="button" onClick={() => setSelectedTransition(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}>Cambiar</button>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', padding: 12, backgroundColor: '#fee2e2', borderRadius: 6 }}>{error}</div>
            )}

            {selectedTransition.require_note && (
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4, fontWeight: 500 }}>
                  Nota Justificativa <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea 
                  required
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ width: '100%', padding: '10px', minHeight: '80px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}
                  placeholder="Explique el motivo del cambio..."
                />
              </div>
            )}

            {selectedTransition.require_assignment && (
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4, fontWeight: 500 }}>
                  Reasignar Responsable <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select 
                  required
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}
                >
                  <option value="">Seleccione responsable...</option>
                  {catalogs.users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}

            {selectedTransition.require_evidence && (
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4, fontWeight: 500 }}>
                  Evidencia (URL o Ref) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={evidenceUrl}
                  onChange={e => setEvidenceUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}
                  placeholder="https://... o JIRA-123"
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: 6, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  padding: '10px 16px', 
                  backgroundColor: 'var(--accent-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 6, 
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Ejecutando...' : 'Confirmar Transición'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
