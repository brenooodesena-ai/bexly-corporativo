import { Shield } from 'lucide-react';
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
            backgroundColor: 'var(--background)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <div style={{ position: 'absolute', bottom: '0', left: '0', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(126, 173, 252, 0.05) 0%, transparent 70%)', zIndex: 0 }} />

            <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)'
                        }}>
                            <Shield color="white" size={24} />
                        </div>
                        <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', letterSpacing: '-1.5px' }}>Bexly</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--white)', marginBottom: '8px', fontWeight: 700 }}>Create account</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Launch your business in 48 hours.</p>
                </div>

                <Card style={{ padding: '40px', backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
                    <form onSubmit={handleSubmit}>
                        <Input label="Business Email" type="email" placeholder="name@company.com" required />
                        <Input label="Password" type="password" placeholder="••••••••" required />
                        <Input label="Confirm Password" type="password" placeholder="••••••••" required />

                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
                            By signing up, you agree to our <span style={{ color: 'var(--primary-blue)' }}>Terms of Service</span> and <span style={{ color: 'var(--primary-blue)' }}>Privacy Policy</span>.
                        </p>

                        <Button type="submit" style={{ width: '100%', backgroundColor: 'var(--primary-blue)', color: 'var(--dark-blue)', fontWeight: 700, padding: '16px' }}>
                            Create Your Account
                        </Button>
                    </form>
                </Card>

                <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                    Already using Bexly? {' '}
                    <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
