import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'radial-gradient(circle at top, rgba(59, 130, 246, 0.15), transparent 60%)' }}>
      <div className="saas-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '60px 40px' }}>
        <h1 className="sidebar-logo" style={{ marginBottom: 24, fontSize: '48px', display: 'inline-block' }}>SABI Voice</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: 48, lineHeight: 1.6 }}>
          Plataforma Inteligente de Gestión de la Voz del Cliente (PQRSF). Registre y gestione solicitudes con el poder de la Inteligencia Artificial.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <Link href="/nueva-solicitud" style={{ textDecoration: 'none', width: '100%', maxWidth: '300px' }}>
            <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px' }}>
              Nueva Solicitud
            </button>
          </Link>
          
          <Link href="/login" style={{ textDecoration: 'none', width: '100%', maxWidth: '300px' }}>
            <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px', background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)' }}>
              Portal Interno
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
