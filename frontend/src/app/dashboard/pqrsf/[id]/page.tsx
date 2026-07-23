'use client';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import SLAIndicator from './components/SLAIndicator';
import GeneralInformationCard from './components/GeneralInformationCard';
import OperationalPanel from './components/OperationalPanel';
import AIClassificationCard from './components/AIClassificationCard';
import Timeline from './components/Timeline';
import AttachmentsPanel from '@/components/AttachmentsPanel';
import SabiCompanion from '@/components/SabiCompanion';
import { useToast } from '@/contexts/ToastContext';
import Badge from '@/components/ui/Badge';
import * as LucideIcons from 'lucide-react';

const renderIcon = (iconName: string, size: number = 20, color: string = 'currentColor') => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.FileText;
  return <Icon size={size} color={color} />;
};

export default function PqrsfDetailPage() {
  const { error: toastError, success } = useToast();
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [communications, setCommunications] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any>({ states: [], priorities: [], users: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      // Execute all necessary network requests concurrently
      const [resData, commsData, states, priorities, users, categories] = await Promise.all([
        api.getPqrsfById(id as string),
        api.getCommunications(id as string),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/states`, { credentials: "include" }).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/priorities`, { credentials: "include" }).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/catalogs/internal-users`, { credentials: "include" }).then(r => r.json()),
        api.getCaseCategories()
      ]);

      setData(resData);
      setCommunications(commsData);
      setCatalogs({ states, priorities, users, categories: categories || [] });
    } catch (err) {
      console.error('Error fetching PQRSF data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [id]);

  const handleSaveOperational = async (payload: any) => {
    try {
      // Convert empty strings to null for backend payload
      const formattedPayload: any = { ...payload };
      Object.keys(formattedPayload).forEach(key => {
        if (formattedPayload[key] === '') formattedPayload[key] = null;
        else if (key !== 'nueva_nota' && formattedPayload[key] !== null) formattedPayload[key] = parseInt(formattedPayload[key], 10);
      });
      
      await api.updatePqrsf(id as string, formattedPayload);
      success("Cambios guardados correctamente.");
      await fetchAllData(); // Refresh data to get new history/communications
    } catch (err: any) {
      toastError(err.message || "Error guardando cambios");
      throw err; // Re-throw to let component know it failed
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--surface-border)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Cargando ticket...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) return <div style={{ padding: 24, textAlign: 'center' }}>No se pudo cargar el ticket.</div>;

  const category = catalogs.categories?.find((c: any) => c.id === data.category_id) || {
    name: 'PQRSF',
    color: 'var(--success)',
    icon: '📝'
  };

  return (
    <div style={{ paddingBottom: 64 }}>
      <div style={{ 
        backgroundColor: category.color ? `${category.color}15` : 'rgba(34, 197, 94, 0.1)', 
        borderLeft: `4px solid ${category.color || 'var(--success)'}`,
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <PageHeader 
          title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Ticket {data.consecutivo} - {renderIcon(category.icon, 24, category.color || 'currentColor')} {category.name}</span>}
          description={data.asunto}
          breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Gestión de Tickets', href: '/dashboard/pqrsf' }, { label: `Ticket ${data.consecutivo}` }]}
          actions={<SLAIndicator data={data} />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Panel Principal (Izquierdo) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <GeneralInformationCard data={data} />
          <Timeline history={data.history || []} communications={communications || []} />
          <AttachmentsPanel data={data} onUploadComplete={fetchAllData} />
        </div>
        
        {/* Panel Lateral Operativo (Derecho) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <OperationalPanel data={data} catalogs={catalogs} onSave={handleSaveOperational} />
          <AIClassificationCard clasificacion={data.clasificacion_ia} />
        </div>
        
      </div>
    </div>
  );
}
