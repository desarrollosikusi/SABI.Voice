'use client';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async (searchQuery?: string) => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/knowledge`;
      if (searchQuery) url += `?query=${encodeURIComponent(searchQuery)}`;
      
      const resp = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (resp.ok) {
        setArticles(await resp.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles(query);
  };

  return (
    <div>
      <PageHeader 
        title="Base de Conocimiento"
        description="Consulta artículos, manuales de solución y guías para resolver casos rápidamente."
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Base de Conocimiento' }]}
        actions={<Button variant="primary">Crear Artículo</Button>}
      />
      
      <Card style={{ marginBottom: '32px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Input 
              placeholder="Buscar por problema, síntoma o código de error..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {articles.length === 0 && !loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No se encontraron artículos que coincidan con la búsqueda.
          </div>
        ) : (
          articles.map(article => (
            <Card key={article.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 }}>
                  {article.title}
                </h3>
                {article.tags && article.tags.includes('SLA') && (
                  <Badge variant="warning">SLA</Badge>
                )}
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, flex: 1 }}>
                {article.content.substring(0, 150)}...
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Por: {article.author?.full_name || 'Sistema'}
                </span>
                <Button variant="ghost" style={{ padding: '4px 8px' }}>Ver detalles &rarr;</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
