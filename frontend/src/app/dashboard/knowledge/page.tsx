'use client';
import { useState, useEffect } from 'react';

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
        headers: { ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) }
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
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Base de Conocimiento</h1>
      </div>
      
      <div className="glass-panel" style={{ marginBottom: 32 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16 }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar por problema, síntoma o error..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 32px' }}>
            Buscar
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Buscando artículos...</p>
        ) : articles.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No se encontraron artículos.</p>
        ) : (
          articles.map(article => (
            <div key={article.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: 16, margin: 0, color: 'var(--accent-color)' }}>{article.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {article.arquitectura && <span style={{ marginRight: 8, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{article.arquitectura}</span>}
                {article.area && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{article.area}</span>}
              </p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, fontSize: 14, whiteSpace: 'pre-wrap', flex: 1 }}>
                {article.content}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right' }}>
                Ref. PQRSF #{article.source_pqrsf_id} - {new Date(article.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
