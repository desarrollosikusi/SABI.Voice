'use client';
import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { api } from '@/services/api';
import { UploadCloud, Search, Trash2, Download, FileText } from 'lucide-react';

export default function GestionDocumentalPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    customer_id: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, catsRes, custRes] = await Promise.all([
        api.getDocuments(),
        api.getDocumentCategories(),
        api.getDocumentCustomers()
      ]);
      
      setDocuments(docsRes);
      setCategories(catsRes);
      setCustomers(custRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.title || !formData.category_id || !formData.customer_id) return;
    
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('category_id', formData.category_id);
      form.append('customer_id', formData.customer_id);

      await api.createDocument(form);

      setIsModalOpen(false);
      setFormData({ title: '', description: '', category_id: '', customer_id: '1' });
      setSelectedFile(null);
      loadData();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;
    try {
      await api.deleteDocument(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = (doc: any) => {
    window.open(`http://localhost:8000/documents/${doc.id}/download`, '_blank');
  };

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: ColumnDef<any>[] = [
    {
      key: 'title',
      header: 'Documento',
      cell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={20} color="var(--color-primary)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.file_name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Categoría',
      width: '160px',
      cell: (item) => <Badge color="var(--color-info)">{item.category?.name || 'General'}</Badge>
    },
    {
      key: 'date',
      header: 'Fecha de Carga',
      width: '180px',
      cell: (item) => <span style={{ color: 'var(--text-secondary)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
    },
    {
      key: 'size',
      header: 'Tamaño',
      width: '120px',
      cell: (item) => <span style={{ color: 'var(--text-secondary)' }}>{(item.file_size / 1024).toFixed(1)} KB</span>
    }
  ];

  const renderActions = (item: any) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => handleDownload(item)}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--surface-border)', backgroundColor: 'transparent', cursor: 'pointer' }}
        title="Descargar"
      >
        <Download size={16} color="var(--color-primary)" />
      </button>
      <button 
        onClick={() => handleDelete(item.id)}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--surface-border)', backgroundColor: 'transparent', cursor: 'pointer' }}
        title="Eliminar"
      >
        <Trash2 size={16} color="var(--color-danger)" />
      </button>
    </div>
  );

  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Gestión Documental</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Administra los documentos compartidos con los clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', backgroundColor: 'var(--color-primary)', color: 'white',
            border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <UploadCloud size={18} />
          Subir Documento
        </button>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 10px 10px 40px',
              border: '1px solid var(--surface-border)', borderRadius: '6px',
              backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      <div style={{
        backgroundColor: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--surface-border)',
        overflow: 'hidden'
      }}>
        {filteredDocs.length > 0 ? (
          <DataTable data={filteredDocs} columns={columns} actions={renderActions} />
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--surface-color)' }}>
            <FileText size={48} color="var(--text-secondary)" style={{ marginBottom: 16, opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px 0' }}>No hay documentos</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Sube un documento para compartirlo con el cliente.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Subir Documento">
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Archivo *</label>
            <input type="file" required onChange={e => setSelectedFile(e.target.files?.[0] || null)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Título *</label>
            <input 
              type="text" required value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Categoría *</label>
            <select 
              required value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}
            >
              <option value="">Seleccione una categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Cliente (Empresa) *</label>
            <select 
              required value={formData.customer_id}
              onChange={e => setFormData({...formData, customer_id: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}
            >
              <option value="">Seleccione a qué cliente pertenece</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Descripción (Opcional)</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--surface-border)', minHeight: '80px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid var(--surface-border)', background: 'transparent', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={uploading} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {uploading ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
