'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import { FileText, Download, Grid, List } from 'lucide-react';
import { 
  DataExplorer, 
  ExplorerColumn, 
  Toolbar, 
  ToolbarLeft, 
  ToolbarRight, 
  Search 
} from '@/components/ui/explorer';
import { DocumentExplorerAdapter } from './DocumentExplorerAdapter';

export default function ClienteDocumentosPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('explorer_search_term') || '' : '';
  });
  const [categoryId, setCategoryId] = useState<number | null>(() => {
    return typeof window !== 'undefined' ? (sessionStorage.getItem('explorer_category_id') ? Number(sessionStorage.getItem('explorer_category_id')) : null) : null;
  });
  const [view, setView] = useState<'table' | 'grid'>(() => {
    return typeof window !== 'undefined' ? (sessionStorage.getItem('explorer_view') as 'table'|'grid' || 'table') : 'table';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('explorer_search_term', searchTerm);
      sessionStorage.setItem('explorer_category_id', categoryId ? categoryId.toString() : '');
      sessionStorage.setItem('explorer_view', view);
    }
  }, [searchTerm, categoryId, view]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsRes, catsRes] = await Promise.all([
        api.getDocuments(categoryId ? { category_id: categoryId } : {}),
        api.getDocumentCategories()
      ]);
      setDocuments(docsRes);
      // Sort categories based on views.list.sort
      const sortedCats = catsRes.sort((a: any, b: any) => {
        const sortA = a.display?.views?.list?.sort || 999;
        const sortB = b.display?.views?.list?.sort || 999;
        return sortA - sortB;
      });
      setCategories(sortedCats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const handleDownload = (docId: string | number) => {
    window.open(`http://localhost:8000/documents/${docId}/download`, '_blank');
  };

  const records = useMemo(() => {
    const adapter = new DocumentExplorerAdapter();
    return documents.map(doc => {
      const record = adapter.toExplorerRecord(doc);
      record.actions = [{
        id: 'download',
        label: 'Descargar',
        onClick: (r) => handleDownload(r.id)
      }];
      return record;
    });
  }, [documents]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const lower = searchTerm.toLowerCase();
    return records.filter(r => 
      r.title.toLowerCase().includes(lower) || 
      (r.description && r.description.toLowerCase().includes(lower)) ||
      (r.subtitle && r.subtitle.toLowerCase().includes(lower))
    );
  }, [records, searchTerm]);

  const columns: ExplorerColumn[] = [
    {
      id: 'title',
      title: 'Documento',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={20} color="var(--color-primary)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.subtitle}</div>
          </div>
        </div>
      )
    },
    {
      id: 'category',
      title: 'Categoría',
      width: '160px'
    },
    {
      id: 'date',
      title: 'Fecha de Carga',
      width: '180px',
      render: (item) => <span style={{ color: 'var(--text-secondary)' }}>{new Date(item.metadata?.createdAt as string).toLocaleDateString()}</span>
    },
    {
      id: 'size',
      title: 'Tamaño',
      width: '120px',
      render: (item) => <span style={{ color: 'var(--text-secondary)' }}>{((item.metadata?.fileSize as number) / 1024).toFixed(1)} KB</span>
    }
  ];

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--bg-color)' }}>
      <div style={{ padding: 'var(--space-xl)', maxWidth: 1600, margin: '0 auto' }}>
        
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Documentos</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Consulta y descarga la documentación compartida por IKUSI.</p>
        </div>

        <Toolbar>
          <ToolbarLeft>
            <Search 
              value={searchTerm} 
              onSearch={setSearchTerm} 
              placeholder="Buscar documentos..." 
            />
            {/* Pills for categories */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                onClick={() => setCategoryId(null)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: categoryId === null ? '1px solid var(--color-primary)' : '1px solid var(--surface-border)',
                  backgroundColor: categoryId === null ? 'var(--color-primary)' : 'var(--surface-color)',
                  color: categoryId === null ? '#fff' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                Todas
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: categoryId === cat.id ? '1px solid var(--color-primary)' : '1px solid var(--surface-border)',
                    backgroundColor: categoryId === cat.id ? 'var(--color-primary)' : 'var(--surface-color)',
                    color: categoryId === cat.id ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </ToolbarLeft>
          <ToolbarRight>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-color)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <button 
                onClick={() => setView('table')}
                style={{ 
                  padding: '6px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: 'none', 
                  background: view === 'table' ? 'var(--surface-hover)' : 'transparent',
                  color: view === 'table' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setView('grid')}
                style={{ 
                  padding: '6px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: 'none', 
                  background: view === 'grid' ? 'var(--surface-hover)' : 'transparent',
                  color: view === 'grid' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <Grid size={18} />
              </button>
            </div>
          </ToolbarRight>
        </Toolbar>

        <div style={{
          backgroundColor: 'var(--bg-color)',
          marginTop: '16px'
        }}>
          <DataExplorer 
            items={filteredRecords}
            columns={columns}
            view={view}
            loading={loading}
            emptyState={{
              title: "No se encontraron documentos",
              description: searchTerm ? "No hay resultados para la búsqueda actual." : "Aún no existen documentos en esta categoría.",
              icon: "FileText"
            }}
          />
        </div>

      </div>
    </div>
  );
}
