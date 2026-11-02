import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logoIcon from '../../assets/logo-bexly-one.png';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            navigate('/dashboard');
        }, 500);
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            navigate('/dashboard');
        }, 600);
    };

    const handleAppleLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            navigate('/dashboard');
        }, 600);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#07090e',
            padding: '32px 16px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Minimalist Professional Ambient Halo */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '1000px',
                height: '420px',
                background: 'radial-gradient(50% 50% at 50% 0%, rgba(59, 130, 246, 0.09) 0%, rgba(59, 130, 246, 0.02) 60%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Subtle Grid texture */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    opacity: 0.6,
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            {/* Minimalist Professional Card */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '430px',
                backgroundColor: 'rgba(13, 17, 28, 0.8)',
                backgroundImage: 'radial-gradient(ellipse at 50% -10%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                padding: '36px 30px 32px 30px',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxSizing: 'border-box'
            }}>
                {/* Logo Bexly Centralizado */}
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <img
                        src={logoIcon}
                        alt="Bexly"
                        style={{
                            height: '32px',
                            width: 'auto',
                            display: 'inline-block'
                        }}
                    />
                </div>

                {/* Título e Subtítulo */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        margin: '0 0 6px 0',
                        letterSpacing: '-0.4px'
                    }}>
                        Entrar
                    </h1>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.55)',
                        margin: 0,
                        lineHeight: 1.4
                    }}>
                        Preencha seus dados para acessar o workspace
                    </p>
                </div>

                {/* Botões Sociais: Google & Apple em 2 colunas */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        aria-label="Continuar com o Google"
                        style={{
                            height: '48px',
                            backgroundColor: '#121620',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#181e2c';
                            e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#121620';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={handleAppleLogin}
                        aria-label="Continuar com a Apple"
                        style={{
                            height: '48px',
                            backgroundColor: '#121620',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#181e2c';
                            e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#121620';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.36-.56.65-1.06 1.71-.92 2.73 1.01.08 2.03-.49 2.65-1.24" />
                        </svg>
                    </button>
                </div>

                {/* Divisor "ou" */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '18px 0 22px 0',
                    gap: '14px'
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                    <span style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontWeight: 500,
                        textTransform: 'lowercase'
                    }}>
                        ou
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* E-mail Address */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.825rem',
                            fontWeight: 500,
                            color: 'rgba(255, 255, 255, 0.85)',
                            marginBottom: '6px'
                        }}>
                            E-mail <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="nome@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                height: '46px',
                                padding: '0 16px',
                                backgroundColor: '#10141e',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '12px',
                                color: '#ffffff',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#0066FF';
                                e.target.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.825rem',
                            fontWeight: 500,
                            color: 'rgba(255, 255, 255, 0.85)',
                            marginBottom: '6px'
                        }}>
                            Senha <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    height: '46px',
                                    padding: '0 44px 0 16px',
                                    backgroundColor: '#10141e',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    color: '#ffffff',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#0066FF';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.15)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Remember me & Forgot Password */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '24px'
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            userSelect: 'none'
                        }}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{
                                    accentColor: '#0066FF',
                                    width: '16px',
                                    height: '16px',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                }}
                            />
                            <span>Lembrar de mim</span>
                        </label>
                        <button
                            type="button"
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '0.8rem',
                                color: '#0066FF',
                                fontWeight: 500,
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            Esqueceu a senha?
                        </button>
                    </div>

                    {/* Botão Entrar */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            height: '50px',
                            backgroundColor: '#0066FF',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 8px 24px rgba(0, 102, 255, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#1a75ff';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 102, 255, 0.5)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#0066FF';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 102, 255, 0.35)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                {/* Footer Link */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '22px',
                    marginBottom: 0,
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.85rem'
                }}>
                    Não tem uma conta ainda?{' '}
                    <Link
                        to="/signup"
                        style={{
                            color: '#0066FF',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#0066FF'}
                    >
                        Criar conta
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
