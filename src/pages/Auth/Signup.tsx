import { Button, Input, Card } from '../../components/UI';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, we would register here
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
            <div style={{ position: 'absolute', bottom: '0', left: '0', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(126, 173, 252, 0.05) 0%, transparent 70%)', zIndex: 0 }} />

            <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>

                    <h1 style={{ fontSize: '2.5rem', color: 'var(--white)', marginBottom: '8px', fontWeight: 600 }}>Criar conta</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Lance seu negócio em 48 horas.</p>
                </div>

                <Card style={{ padding: '40px', backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
                    <form onSubmit={handleSubmit}>
                        <Input label="E-mail Business" type="email" placeholder="nome@empresa.com" required />
                        <Input label="Senha" type="password" placeholder="••••••••" required />
                        <Input label="Confirmar Senha" type="password" placeholder="••••••••" required />

                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
                            Ao se cadastrar, você concorda com nossos <span style={{ color: 'var(--primary-blue)' }}>Termos de Serviço</span> e <span style={{ color: 'var(--primary-blue)' }}>Política de Privacidade</span>.
                        </p>

                        <Button type="submit" style={{ width: '100%', backgroundColor: 'var(--primary-blue)', color: 'var(--dark-blue)', fontWeight: 500, padding: '16px' }}>
                            Criar Sua Conta
                        </Button>
                    </form>
                </Card>

                <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                    Já usa a Bexly? {' '}
                    <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: 500 }}>Fazer login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
