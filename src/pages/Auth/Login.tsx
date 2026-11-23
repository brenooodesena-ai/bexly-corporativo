import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import logoIcon from '../../assets/logo-bexly-one.png';
import loginBgBlue from '../../assets/login-bg-blue.jpg';
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signInWithGoogle, signInWithGoogleIdToken, signInWithFacebook, signInWithEmail, syncDatabaseUser, signOut, isConfigured } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const googleBtnRef = useRef<HTMLDivElement>(null);
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '791461827731-l4q5jasa0tg3ra7mtlk3t1a2gnkb0tfl.apps.googleusercontent.com';

    const handleCredentialResponse = async (response: any) => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            if (!response?.credential) {
                setErrorMessage('Não foi possível obter credencial do Google.');
                setIsLoading(false);
                return;
            }

            const { data, error } = await signInWithGoogleIdToken(response.credential);
            if (error) {
                setErrorMessage(error.message || 'Erro ao realizar login com o Google.');
                setIsLoading(false);
                return;
            }

            const sessionUser = data?.user;
            if (!sessionUser) {
                setErrorMessage('Não foi possível autenticar o usuário com o Google.');
                setIsLoading(false);
                return;
            }

            const isAdminUser = sessionUser.email === ADMIN_EMAIL;
            const isAccountRegistered = Boolean(sessionUser.user_metadata?.bexly_account_created) || isAdminUser;
            const createdAt = new Date(sessionUser.created_at).getTime();
            const now = Date.now();
            const isBrandNewAccount = Math.abs(now - createdAt) < 25000;

            if (isBrandNewAccount && !isAccountRegistered) {
                await signOut();
                setErrorMessage('Conta não encontrada com este e-mail. Por favor, crie uma conta primeiro para ter acesso à Bexly.');
                setIsLoading(false);
                return;
            }

            await syncDatabaseUser(sessionUser);
            navigate('/dashboard');
        } catch (err: any) {
            setErrorMessage(err.message || 'Erro inesperado ao conectar com o Google.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let checkTimer: any = null;
        const initGsi = () => {
            if (typeof window !== 'undefined' && window.google?.accounts?.id) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: handleCredentialResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    if (googleBtnRef.current) {
                        googleBtnRef.current.innerHTML = '';
                        window.google.accounts.id.renderButton(googleBtnRef.current, {
                            type: 'standard',
                            theme: 'outline',
                            size: 'large',
                            width: 240,
                        });
                    }

                    window.google.accounts.id.prompt();
                } catch (err) {
                    console.warn('[GSI] Erro ao inicializar Google Identity Services:', err);
                }
            }
        };

        if (window.google?.accounts?.id) {
            initGsi();
        } else {
            checkTimer = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(checkTimer);
                    initGsi();
                }
            }, 200);
        }

        return () => {
            if (checkTimer) clearInterval(checkTimer);
        };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('error') === 'account_not_found') {
            setErrorMessage('Conta não encontrada com este e-mail. Por favor, crie uma conta primeiro para ter acesso à Bexly.');
        }
    }, [location.search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        if (!isConfigured) {
            setErrorMessage('Supabase ainda não configurado no arquivo .env. Configure VITE_SUPABASE_ANON_KEY.');
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await signInWithEmail(email, password);
            if (error) {
                const msg = error.message || '';
                if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) {
                    setErrorMessage('Conta não encontrada ou senha incorreta. Se você ainda não tem cadastro, crie sua conta primeiro.');
                } else if (msg.includes('Email not confirmed')) {
                    setErrorMessage('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
                } else {
                    setErrorMessage(msg || 'Erro ao realizar login. Verifique suas credenciais.');
                }
                setIsLoading(false);
                return;
            }

            if (!data?.user && !data?.session) {
                setErrorMessage('Não foi possível entrar. Verifique os dados informados.');
                setIsLoading(false);
                return;
            }

            navigate('/dashboard');
        } catch (err: any) {
            setErrorMessage(err.message || 'Erro inesperado.');
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        if (!isConfigured) {
            setErrorMessage('Supabase ainda não configurado no arquivo .env.');
            setIsLoading(false);
            return;
        }

        try {
            sessionStorage.setItem('bexly_auth_intent', 'login');
            const { error } = await signInWithGoogle();
            if (error) {
                setErrorMessage(error.message || 'Erro ao iniciar autenticação com o Google.');
                setIsLoading(false);
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Erro ao conectar com o Google.');
            setIsLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        if (!isConfigured) {
            setErrorMessage('Supabase ainda não configurado no arquivo .env.');
            setIsLoading(false);
            return;
        }

        try {
            sessionStorage.setItem('bexly_auth_intent', 'login');
            const { error } = await signInWithFacebook();
            if (error) {
                setErrorMessage(error.message || 'Erro ao iniciar autenticação com o Facebook.');
                setIsLoading(false);
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Erro ao conectar com o Facebook.');
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Card Principal Dividido em 2 Colunas */}
            <div style={{
                width: '100%',
                maxWidth: '1080px',
                minHeight: '640px',
                backgroundColor: '#000000',
                borderRadius: '32px',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxSizing: 'border-box',
                position: 'relative'
            }}>

                {/* ── COLUNA ESQUERDA: BANNER COM O NOVO FUNDO AZUL GRADIENTE ── */}
                <div style={{
                    flex: '1 1 50%',
                    minHeight: '640px',
                    margin: '12px',
                    borderRadius: '24px',
                    backgroundImage: `url(${loginBgBlue})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '48px 36px',
                    boxSizing: 'border-box',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
                className="login-left-banner"
                >
                    {/* Conteúdo Centralizado no Banner */}
                    <div style={{
                        maxWidth: '360px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        zIndex: 2
                    }}>
                        {/* Logo + Nome Bexly */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            marginBottom: '28px'
                        }}>
                            <img
                                src={logoIcon}
                                alt="Bexly"
                                style={{
                                    height: '28px',
                                    width: 'auto',
                                    filter: 'brightness(1.1)'
                                }}
                            />
                            <span style={{
                                color: '#ffffff',
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                letterSpacing: '-0.4px'
                            }}>
                                Bexly
                            </span>
                        </div>

                        {/* Título Principal */}
                        <h2 style={{
                            color: '#ffffff',
                            fontSize: '1.95rem',
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                            margin: '0 0 10px 0',
                            lineHeight: 1.2
                        }}>
                            Comece com a Bexly
                        </h2>

                        {/* Subtítulo */}
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.72)',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            margin: '0 0 36px 0',
                            maxWidth: '300px'
                        }}>
                            Acesse sua conta para gerenciar suas automações e escalar suas vendas.
                        </p>

                        {/* Etapas / Pílulas Visuais (Estilo Exato da Imagem) */}
                        <div style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {/* Pílula 1: Ativa (Fundo Branco, Texto Preto) */}
                            <div style={{
                                width: '100%',
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                borderRadius: '14px',
                                padding: '13px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxSizing: 'border-box',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}>
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    backgroundColor: '#000000',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    flexShrink: 0
                                }}>
                                    1
                                </div>
                                <span style={{
                                    fontSize: '0.86rem',
                                    fontWeight: 600,
                                    letterSpacing: '-0.2px'
                                }}>
                                    Acesse sua conta
                                </span>
                            </div>

                            {/* Pílula 2: Inativa Translúcida */}
                            <div style={{
                                width: '100%',
                                backgroundColor: 'rgba(10, 15, 25, 0.65)',
                                color: 'rgba(255, 255, 255, 0.75)',
                                borderRadius: '14px',
                                padding: '13px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxSizing: 'border-box',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)'
                            }}>
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    flexShrink: 0
                                }}>
                                    2
                                </div>
                                <span style={{
                                    fontSize: '0.86rem',
                                    fontWeight: 500,
                                    letterSpacing: '-0.2px'
                                }}>
                                    Conecte seu Instagram
                                </span>
                            </div>

                            {/* Pílula 3: Inativa Translúcida */}
                            <div style={{
                                width: '100%',
                                backgroundColor: 'rgba(10, 15, 25, 0.65)',
                                color: 'rgba(255, 255, 255, 0.75)',
                                borderRadius: '14px',
                                padding: '13px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxSizing: 'border-box',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)'
                            }}>
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    flexShrink: 0
                                }}>
                                    3
                                </div>
                                <span style={{
                                    fontSize: '0.86rem',
                                    fontWeight: 500,
                                    letterSpacing: '-0.2px'
                                }}>
                                    Venda no piloto automático
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── COLUNA DIREITA: FORMULÁRIO DE LOGIN PRETO/MINIMALISTA ── */}
                <div style={{
                    flex: '1 1 50%',
                    backgroundColor: '#000000',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '48px 40px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '380px'
                    }}>
                        {/* Cabeçalho do Formulário */}
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <h1 style={{
                                fontSize: '1.85rem',
                                fontWeight: 700,
                                color: '#ffffff',
                                margin: '0 0 8px 0',
                                letterSpacing: '-0.5px'
                            }}>
                                Entrar na Conta
                            </h1>
                            <p style={{
                                fontSize: '0.85rem',
                                color: 'rgba(255, 255, 255, 0.55)',
                                margin: 0,
                                lineHeight: 1.4
                            }}>
                                Digite seus dados para acessar sua conta.
                            </p>
                        </div>

                        {/* Mensagem de Erro / Alerta */}
                        {errorMessage && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#fca5a5',
                                fontSize: '0.825rem',
                                lineHeight: 1.4
                            }}>
                                <AlertCircle size={18} style={{ flexShrink: 0, color: '#f87171' }} />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Botões Sociais (Google e Facebook em Grid de 2 Colunas) */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '20px'
                        }}>
                            {/* Botão Google */}
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                height: '44px',
                                overflow: 'hidden',
                                borderRadius: '12px',
                            }}>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#121215',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        color: '#ffffff',
                                        fontSize: '0.84rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1a1a20';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '#121215';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    <span>Google</span>
                                </button>
                                {/* Overlay invisível do Google Identity Services (GIS) */}
                                <div
                                    ref={googleBtnRef}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0.001,
                                        zIndex: 10,
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        transform: 'scale(1.3)',
                                        transformOrigin: 'top left',
                                    }}
                                />
                            </div>

                            {/* Botão Facebook */}
                            <button
                                type="button"
                                onClick={handleFacebookLogin}
                                style={{
                                    height: '44px',
                                    backgroundColor: '#121215',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    color: '#ffffff',
                                    fontSize: '0.84rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1a1a20';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#121215';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                            </button>
                        </div>

                        {/* Divisor "Ou" */}
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
                            }}>
                                ou
                            </span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                        </div>

                        {/* Formulário */}
                        <form onSubmit={handleSubmit}>
                            {/* Campo E-mail */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.82rem',
                                    fontWeight: 500,
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    marginBottom: '6px'
                                }}>
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    placeholder="ex: brenin@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        height: '46px',
                                        padding: '0 16px',
                                        backgroundColor: '#121215',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: '#ffffff',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                                        e.target.style.backgroundColor = '#16161b';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.target.style.backgroundColor = '#121215';
                                    }}
                                />
                            </div>

                            {/* Campo Senha */}
                            <div style={{ marginBottom: '6px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.82rem',
                                    fontWeight: 500,
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    marginBottom: '6px'
                                }}>
                                    Senha
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
                                            backgroundColor: '#121215',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            color: '#ffffff',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                                            e.target.style.backgroundColor = '#16161b';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            e.target.style.backgroundColor = '#121215';
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
                                            color: 'rgba(255, 255, 255, 0.45)',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                                        onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Lembrar de mim e Esqueceu a senha */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '10px',
                                marginBottom: '22px'
                            }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.78rem',
                                    color: 'rgba(255, 255, 255, 0.65)',
                                    userSelect: 'none'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        style={{
                                            accentColor: '#ffffff',
                                            cursor: 'pointer',
                                            width: '14px',
                                            height: '14px',
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
                                        fontSize: '0.78rem',
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        cursor: 'pointer',
                                        padding: 0,
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                                    onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>

                            {/* Botão Branco Sólido "Entrar" (Estilo Exato da Imagem) */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    height: '48px',
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    fontWeight: 600,
                                    fontSize: '0.92rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px'
                                }}
                                onMouseOver={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.backgroundColor = '#e2e8f0';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {isLoading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>

                        {/* Link de Rodapé para Criar Conta */}
                        <p style={{
                            textAlign: 'center',
                            margin: 0,
                            color: 'rgba(255, 255, 255, 0.55)',
                            fontSize: '0.82rem'
                        }}>
                            Não tem uma conta?{' '}
                            <Link
                                to="/signup"
                                style={{
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Estilo CSS Responsivo para Mobile */}
            <style>{`
                @media (max-width: 860px) {
                    .login-left-banner {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
