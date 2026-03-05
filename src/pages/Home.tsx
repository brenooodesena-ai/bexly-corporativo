import { Link } from 'react-router-dom';
import { Shield, Users, Target, TrendingUp } from 'lucide-react';
import { useMagnetic } from '../hooks/useMagnetic';

const Home = () => {
    const navMagnetic = useMagnetic();
    const heroMagnetic = useMagnetic();

    return (
        <div className="home-container grid-bg" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', position: 'relative' }}>
            {/* Navigation */}
            <nav className="glass-nav" style={{
                height: 'var(--header-height)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100
            }}>
                {/* Left: Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)'
                    }}>
                        <Shield color="white" size={20} />
                    </div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-1px' }}>Bexly</span>
                </div>

                {/* Center: Navigation Links */}
                <div style={{
                    display: 'flex',
                    gap: '48px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 2,
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.2px' }}>Preços</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.2px' }}>Recursos</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.2px' }}>Vitrines</span>
                </div>

                {/* Right: Auth Links */}
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                    <Link to="/login" style={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>Login</Link>
                    <Link to="/signup" style={{ textDecoration: 'none' }}>
                        <button
                            ref={navMagnetic.ref as any}
                            className="premium-button"
                            style={{ ...navMagnetic.style, fontSize: '0.9rem', minWidth: '130px' }}
                        >
                            Criar conta
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                padding: '240px 20px 140px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="premium-badge">
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 640, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Plataforma Corporativa de Alto Nível</span>
                    </div>

                    <h1 style={{ fontSize: '6rem', marginBottom: '32px', lineHeight: 0.95, fontWeight: 900, color: 'var(--white)', letterSpacing: '-4px' }}>
                        Transforme qualquer ideia em <br />
                        <span className="text-gradient-blue">um produto digital completo</span>
                    </h1>

                    <p style={{ fontSize: '1.3rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '64px', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto 64px', fontWeight: 400 }}>
                        Apps, sites, sistemas com banco de dados, landing pages: crie tudo apenas descrevendo o que você quer. Sem código. Sem equipe. Desenvolvido para o mercado enterprise.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <Link to="/signup" style={{ textDecoration: 'none' }}>
                            <button
                                ref={heroMagnetic.ref as any}
                                className="premium-button"
                                style={{ ...heroMagnetic.style, padding: '18px 48px', fontSize: '1.2rem' }}
                            >
                                Falar com especialista
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Ambient Lights/Orbs */}
            <div className="gradient-bg-orb" style={{ top: '5%', left: '0%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.07) 0%, transparent 70%)' }} />
            <div className="gradient-bg-orb" style={{ top: '35%', right: '-5%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)' }} />
            <div className="gradient-bg-orb" style={{ bottom: '-5%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.04) 0%, transparent 70%)' }} />

            {/* Features Section */}
            <section style={{ padding: '140px 20px', backgroundColor: 'rgba(2, 6, 23, 0.3)', position: 'relative' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '80px', fontSize: '3rem', color: 'var(--white)', fontWeight: 800, letterSpacing: '-1.5px' }}>Tecnologia para Crescimento</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '40px'
                    }}>
                        <FeatureCard
                            icon={<Users size={32} color="var(--primary-blue)" />}
                            title="Gestão de Clientes"
                            description="Visibilidade total sobre o ciclo de vida do seu cliente com rastreamento de alto desempenho."
                        />
                        <FeatureCard
                            icon={<Target size={32} color="var(--primary-blue)" />}
                            title="Pipelines Inteligentes"
                            description="Pontuação automática de leads e gestão de estágios para otimizar sua taxa de conversão."
                        />
                        <FeatureCard
                            icon={<TrendingUp size={32} color="var(--primary-blue)" />}
                            title="Analytics Avançado"
                            description="Insights em tempo real impulsionados por métricas avançadas de inteligência de negócios."
                        />
                    </div>
                </div>
            </section>

            {/* Corporate Footer */}
            <footer style={{ padding: '120px 20px 80px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Shield color="var(--primary-blue)" size={28} />
                    <span style={{ fontWeight: 900, color: 'var(--white)', fontSize: '1.8rem', letterSpacing: '-1px' }}>Bexly</span>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
                    © 2026 Bexly Enterprises. Todos os direitos reservados.
                    Fornecendo infraestrutura tecnológica de ponta para empresas modernas.
                </p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="card" style={{
        textAlign: 'left',
        padding: '56px',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '28px',
        backdropFilter: 'blur(12px)',
        transition: 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), border-color 0.4s ease',
        cursor: 'default'
    }}>
        <div style={{ marginBottom: '28px' }}>{icon}</div>
        <h3 style={{ marginBottom: '16px', color: 'var(--white)', fontWeight: 700, fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>{description}</p>
    </div>
);

export default Home;
