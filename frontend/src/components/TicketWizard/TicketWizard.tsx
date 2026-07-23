import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import TicketTypeSelector from './TicketTypeSelector';
import InternalTicketForm from './InternalTicketForm';
import CustomerTicketForm from './CustomerTicketForm';
import { useToast } from '@/contexts/ToastContext';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function TicketWizard({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [ticketType, setTicketType] = useState<string | null>(null);
  
  const [catalogs, setCatalogs] = useState<{areas: any[], types: any[], priorities: any[], categories: any[]}>({
    areas: [], types: [], priorities: [], categories: []
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const endpoints = ['areas', 'types', 'priorities'];
        const results: any = {};
        for (const ep of endpoints) {
          const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/${ep}`);
          if (resp.ok) results[ep] = await resp.json();
        }
        
        const catResp = await api.getCaseCategories();
        results.categories = catResp;

        setCatalogs(results as any);
      } catch (e) {
        console.error("Error loading catalogs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogs();
  }, []);

  const handleSelectType = (categoryCode: string, categoryId: number) => {
    setTicketType(categoryCode as any);
    // also we need to pass category_id to forms, let's keep it in state
    setCategoryId(categoryId);
    setStep(2);
  };
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const handleSubmit = async (payload: any, files: File[]) => {
    setIsSubmitting(true);
    try {
      // Si es un ticket interno, podemos agregar una bandera si el backend lo requiere.
      // Por ahora el backend usa los schemas de PqrsfCreate.
      const res = await api.createPqrsf(payload);
      
      if (files.length > 0) {
        for (const file of files) {
          try {
            await api.uploadAttachment(res.id, file);
          } catch (uploadErr) {
            console.error("Error subiendo archivo:", file.name, uploadErr);
          }
        }
      }
      
      success(`Ticket creado exitosamente: ${res.consecutivo}`);
      onSuccess();
    } catch (err: any) {
      error(err.message || "Hubo un error al registrar el ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando catálogo...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      {step === 2 && (
        <button 
          onClick={() => setStep(1)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}
        >
          ← Volver atrás
        </button>
      )}
      
      {step === 1 && (
        <TicketTypeSelector categories={catalogs.categories} onSelect={handleSelectType} />
      )}
      
      {step === 2 && ticketType === 'PQRSF' && (
        <InternalTicketForm catalogs={catalogs} categoryId={categoryId} category={catalogs.categories.find(c => c.id === categoryId)} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}

      {step === 2 && ticketType === 'SOLICITUD_CLIENTE' && (
        <CustomerTicketForm catalogs={catalogs} categoryId={categoryId} category={catalogs.categories.find(c => c.id === categoryId)} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
