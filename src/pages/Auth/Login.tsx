import logo from '../../logo.png';
import logoText from '../../logo-text.png';
import { Button, Input, Card } from '../../components/UI';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <div style={{ position: 'absolute', top: '0', right: '0', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(126, 173, 252, 0.05) 0%, transparent 70%)', zIndex: 0 }} />

            <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0px', 
                        marginBottom: '4px', // Reduced from 24px
                        marginTop: '85px',
                        transform: 'translateX(20px)' // Reduced from 35px to move slightly left
                    }}>
                        <img src={logo} alt="Bexly Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                        <img src={logoText} alt="Bexly Name" style={{ height: '160px', width: 'auto', objectFit: 'contain', marginLeft: '-95px', marginTop: '5px' }} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--white)', marginBottom: '8px', fontWeight: 600 }}>Bem-vindo de volta</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Acesse seu workspace de alta performance.</p>
                </div>

                <Card style={{ padding: '40px', backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
                    <form onSubmit={handleSubmit}>
                        <Input label="E-mail Business" type="email" placeholder="nome@empresa.com" required />
                        <Input label="Senha" type="password" placeholder="••••••••" required />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                            <button type="button" style={{
                                background: 'none',
                                color: 'var(--primary-blue)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                padding: 0
                            }}>
                                Esqueceu a senha?
                            </button>
                        </div>

                        <Button type="submit" style={{ width: '100%', backgroundColor: 'var(--primary-blue)', color: 'var(--dark-blue)', fontWeight: 500, padding: '16px' }}>
                            Entrar na Bexly
                        </Button>
                    </form>
                </Card>

                <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                    Não tem uma conta? {' '}
                    <Link to="/signup" style={{ color: 'var(--primary-blue)', fontWeight: 500 }}>Criar uma conta</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
