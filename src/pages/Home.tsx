import { Link } from 'react-router-dom';
import logo from '../logo.png';
import logoText from '../logo-text.png';

const Home = () => {
    return (
        <div className="home-container grid-bg" style={{ background: 'var(--background)', minHeight: '100vh', position: 'relative' }}>
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
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0px', 
                    flex: 1,
                    marginTop: '15px' // Lowered as requested
                }}>
                    <img src={logo} alt="Bexly Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <img src={logoText} alt="Bexly Name" style={{ height: '160px', width: 'auto', objectFit: 'contain', marginLeft: '-95px', marginTop: '5px' }} />
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
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.2px' }}>Preços</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.2px' }}>Recursos</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.2px' }}>Vitrines</span>
                </div>

                {/* Right: Auth Links */}
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                    <Link to="/login" style={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>Login</Link>
                    <Link to="/signup" style={{ textDecoration: 'none' }}>
                        <button
                            className="premium-button"
                            style={{ fontSize: '0.8rem', minWidth: '110px', padding: '10px 20px' }}
                        >
                            Criar conta
                        </button>
                    </Link>
                </div>
            </nav>


            
            {/* Ambient Lights/Orbs */}
            <div className="gradient-bg-orb" style={{ top: '5%', left: '0%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.07) 0%, transparent 70%)' }} />
            <div className="gradient-bg-orb" style={{ top: '35%', right: '-5%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)' }} />
            <div className="gradient-bg-orb" style={{ bottom: '-5%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.04) 0%, transparent 70%)' }} />

            {/* Corporate Footer */}
            <footer style={{ padding: '120px 20px 80px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <img src={logo} alt="Bexly Logo" style={{ width: '56px', height: '56px', objectFit: 'contain', marginTop: '4px' }} />
                    <img src={logoText} alt="Bexly Name" style={{ height: '56px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.8rem', maxWidth: '600px', margin: '0 auto' }}>
                    © 2026 Bexly Enterprises. Todos os direitos reservados.
                    Fornecendo infraestrutura tecnológica de ponta para empresas modernas.
                </p>
            </footer>
        </div>
    );
};

export default Home;
