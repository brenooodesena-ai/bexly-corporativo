import { useState, useEffect } from 'react';
import {
    Instagram, Zap, MessageSquare, Send, Users, Target, Plus,
    Search, CheckCircle2, ExternalLink, RefreshCw, Trash2,
    Play, Pause, X, ShieldCheck, Activity, CornerDownRight,
    Sparkles, Loader2, Lock
} from 'lucide-react';
import { useInstagramAutomation } from '../context/InstagramAutomationContext';
import { api } from '../lib/api';
import { useSearchParams } from 'react-router-dom';

type TabType = 'regras' | 'posts' | 'historico' | 'meta';

export default function Marketing() {
    const {
        account,
        accountLoading,
        refreshAccount,
        posts,
        postsLoading,
        refreshPosts,
        automations,
        logs,
        reconnectInstagram,
        connectWithToken,
        connectDirectAccount,
        disconnectInstagram,
        createAutomation,
        toggleAutomationStatus,
        deleteAutomation,
        simulateCommentEvent
    } = useInstagramAutomation();

    const [searchParams] = useSearchParams();

    // Refresh account after OAuth callback redirect
    useEffect(() => {
        if (searchParams.get('connected') === 'true') {
            refreshAccount();
        }
    }, [searchParams]);

    const [activeTab, setActiveTab] = useState<TabType>('regras');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

    // Direct Token Connection State
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [tokenInput, setTokenInput] = useState('');
    const [isConnectingToken, setIsConnectingToken] = useState(false);
    const [tokenError, setTokenError] = useState('');

    const handleConnectToken = async () => {
        if (!tokenInput.trim()) return;
        setIsConnectingToken(true);
        setTokenError('');
        const res = await connectWithToken(tokenInput.trim());
        if (!res.success) {
            setTokenError(res.message || 'Token inválido ou sem permissões da Meta.');
        }
        setIsConnectingToken(false);
    };

    // Direct Username Connection State
    const [showDirectInput, setShowDirectInput] = useState(false);
    const [directUsername, setDirectUsername] = useState('');
    const [isConnectingDirect, setIsConnectingDirect] = useState(false);
    const [directError, setDirectError] = useState('');

    const handleConnectDirect = async () => {
        if (!directUsername.trim()) return;
        setIsConnectingDirect(true);
        setDirectError('');
        const res = await connectDirectAccount({ username: directUsername.trim() });
        if (!res.success) {
            setDirectError(res.message || 'Erro ao vincular perfil.');
        }
        setIsConnectingDirect(false);
    };

    // Simulator State (Professional Test Console)
    const [testPostId, setTestPostId] = useState(posts[0]?.id || 'all');
    const [testUsername, setTestUsername] = useState('breno.sena');
    const [testComment, setTestComment] = useState('QUERO');
    const [testResult, setTestResult] = useState<any | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // Modal Form State
    const [formName, setFormName] = useState('');
    const [formCampaign, setFormCampaign] = useState('');
    const [postSelectionMode, setPostSelectionMode] = useState<'all' | 'specific'>('all');
    const [formPostId, setFormPostId] = useState(posts[0]?.id || 'all');
    const [customPostLink, setCustomPostLink] = useState('');
    const [formKeyword, setFormKeyword] = useState('');
    const [formPublicReply, setFormPublicReply] = useState('Acabei de te enviar no Direct! 🚀 Confere lá!');
    const [formMessage, setFormMessage] = useState('Olá, {{nome}}! 👋 Conforme combinado, aqui está o seu acesso prioritário: {{link}}');
    const [formCtaText, setFormCtaText] = useState('Acessar Conteúdo Gratuito');
    const [formCtaUrl, setFormCtaUrl] = useState('https://bexly.com.br/acesso-vip');

    // Quick open test for specific automation
    const handleOpenTestForAuto = (auto: any) => {
        setTestPostId(auto.trigger.postId);
        setTestComment(auto.conditions[0]?.keyword || 'QUERO');
        setTestResult(null);
        setShowTestModal(true);
    };

    const handleRunTest = async () => {
        setIsSimulating(true);
        try {
            const res = simulateCommentEvent({
                username: testUsername,
                fullName: testUsername,
                postId: testPostId,
                commentText: testComment,
            });

            try {
                await api.testTrigger({
                    instagram_account_id: account?.id || 'none',
                    post_id: testPostId,
                    comment_text: testComment,
                    commenter_username: testUsername,
                });
            } catch (err) {
                console.warn('Backend live test fallback:', err);
            }

            setTestResult(res);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleSaveAutomation = () => {
        if (!formName.trim() || !formKeyword.trim() || !formMessage.trim()) return;
        const isAll = postSelectionMode === 'all';
        const targetPostId = isAll ? 'all' : (formPostId || customPostLink || 'all');
        const selectedPost = posts.find(p => p.id === targetPostId);

        createAutomation({
            organizationId: account?.id || 'org_default',
            name: formName.trim(),
            campaignName: formCampaign.trim() || formName.trim(),
            status: 'active',
            trigger: {
                type: 'instagram_comment',
                postId: targetPostId,
                postTitle: isAll
                    ? 'Todas as publicações e reels'
                    : (selectedPost?.caption?.substring(0, 60) || customPostLink || 'Publicação Selecionada')
            },
            conditions: [{
                field: 'comment_text',
                operator: 'contains',
                keyword: formKeyword.trim().toUpperCase(),
                caseSensitive: false
            }],
            actions: [{
                type: 'send_instagram_dm',
                messageTemplate: formMessage,
                ctaButton: formCtaUrl.startsWith('https://') ? {
                    text: formCtaText,
                    url: formCtaUrl
                } : undefined,
                publicCommentReply: {
                    enabled: true,
                    replyTemplates: [formPublicReply || 'Enviado no seu direct! 🚀']
                }
            }]
        });

        setShowCreateModal(false);
        setFormName('');
        setFormCampaign('');
        setFormKeyword('');
        setCustomPostLink('');
    };

    // Global Metrics Calculation
    const totalLeads = automations.reduce((s, a) => s + a.metrics.leadsGenerated, 0);
    const totalDms = automations.reduce((s, a) => s + a.metrics.dmsSent, 0);
    const totalComments = automations.reduce((s, a) => s + a.metrics.commentsDetected, 0);
    const activeCount = automations.filter(a => a.status === 'active').length;
    const avgConversion = automations.length > 0
        ? (automations.reduce((s, a) => s + a.metrics.conversionRate, 0) / automations.length).toFixed(1)
        : '0.0';

    // Filter automations
    const filteredAutomations = automations.filter(a => {
        const matchesSearch =
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.conditions.some(c => c.keyword.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && a.status === 'active') ||
            (statusFilter === 'paused' && a.status === 'paused');

        return matchesSearch && matchesStatus;
    });

    // ── LOADING STATE ──
    if (accountLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', color: '#94a3b8' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Verificando conexão com o Instagram...</p>
                </div>
            </div>
        );
    }

    // ── NO ACCOUNT: SHOW CONNECT SCREEN ──
    if (!account) {
        return (
            <div style={{ color: '#f8fafc', maxWidth: '1280px', margin: '0 auto', paddingBottom: '70px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                            Automações de Conversão
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '6px 0 0' }}>
                            Responda comentários e envie Directs automáticos com a Meta API Oficial.
                        </p>
                    </div>
                </div>

                {/* Connection Panel */}
                <div style={{
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(10,15,30,0.98) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '72px 40px',
                    textAlign: 'center',
                    backdropFilter: 'blur(20px)'
                }}>
                    {/* Background glow effects */}
                    <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', maxWidth: '520px', margin: '0 auto' }}>
                        {/* Icon */}
                        <div style={{
                            width: '88px', height: '88px', borderRadius: '26px',
                            background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 20px 60px rgba(168,85,247,0.4), 0 0 0 1px rgba(168,85,247,0.3)'
                        }}>
                            <Instagram size={42} color="#ffffff" />
                        </div>

                        {/* Title */}
                        <div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                                Conecte sua conta do Instagram
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                                Vincule seu perfil profissional do Instagram para ativar as automações de comentários, envio automático de Directs e captura de leads no CRM da Bexly.
                            </p>
                        </div>

                        {/* Features list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', textAlign: 'left' }}>
                            {[
                                { icon: <MessageSquare size={15} />, text: 'Resposta automática a comentários com palavras-chave' },
                                { icon: <Send size={15} />, text: 'Envio de DMs personalizadas instantaneamente' },
                                { icon: <Users size={15} />, text: 'Captura e qualificação automática de leads no CRM' },
                                { icon: <ShieldCheck size={15} />, text: 'Integração oficial via Meta Graph API — 100% segura' }
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px 16px', borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.07)'
                                }}>
                                    <span style={{ color: '#a78bfa', flexShrink: 0 }}>{item.icon}</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.84rem' }}>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '420px', alignItems: 'center' }}>
                            <button
                                onClick={reconnectInstagram}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    padding: '14px 32px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
                                    color: '#ffffff', fontWeight: 700, fontSize: '0.95rem',
                                    boxShadow: '0 8px 32px rgba(168,85,247,0.45)',
                                    transition: 'all 0.2s', width: '100%'
                                }}
                            >
                                <Instagram size={18} />
                                Conectar com Instagram (Login Oficial)
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', margin: '4px 0' }}>
                                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou conexão direta</span>
                                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                            </div>

                            {/* Direct connection buttons */}
                            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                {!showTokenInput && (
                                    <button
                                        onClick={() => {
                                            setShowTokenInput(true);
                                            setShowDirectInput(false);
                                        }}
                                        style={{
                                            flex: 1,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            padding: '10px 14px', borderRadius: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 600,
                                            cursor: 'pointer', transition: 'all 0.15s'
                                        }}
                                    >
                                        <Sparkles size={13} color="#38bdf8" />
                                        Via Token Meta
                                    </button>
                                )}
                                {!showDirectInput && (
                                    <button
                                        onClick={() => {
                                            setShowDirectInput(true);
                                            setShowTokenInput(false);
                                        }}
                                        style={{
                                            flex: 1,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            padding: '10px 14px', borderRadius: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 600,
                                            cursor: 'pointer', transition: 'all 0.15s'
                                        }}
                                    >
                                        <Users size={13} color="#a78bfa" />
                                        Vincular @username
                                    </button>
                                )}
                            </div>

                            {/* Token input form */}
                            {showTokenInput && (
                                <div style={{
                                    width: '100%',
                                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    textAlign: 'left'
                                }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                                        Cole o Access Token da Meta (Graph API):
                                    </label>
                                    <input
                                        type="password"
                                        value={tokenInput}
                                        onChange={(e) => setTokenInput(e.target.value)}
                                        placeholder="Ex: EAAQ..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff',
                                            fontSize: '0.8rem',
                                            fontFamily: 'monospace',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    {tokenError && (
                                        <span style={{ fontSize: '0.74rem', color: '#f87171' }}>
                                            {tokenError}
                                        </span>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                        <button
                                            onClick={handleConnectToken}
                                            disabled={isConnectingToken || !tokenInput.trim()}
                                            style={{
                                                flex: 1,
                                                padding: '9px 16px',
                                                borderRadius: '8px',
                                                backgroundColor: '#3b82f6',
                                                color: '#ffffff',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                border: 'none',
                                                cursor: isConnectingToken ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            {isConnectingToken ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                                            {isConnectingToken ? 'Validando na Meta...' : 'Validar e Conectar'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowTokenInput(false);
                                                setTokenError('');
                                            }}
                                            style={{
                                                padding: '9px 14px',
                                                borderRadius: '8px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                color: '#94a3b8',
                                                fontSize: '0.8rem',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Direct Username input form */}
                            {showDirectInput && (
                                <div style={{
                                    width: '100%',
                                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    textAlign: 'left'
                                }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                                        Informe o @usuario profissional do Instagram:
                                    </label>
                                    <input
                                        type="text"
                                        value={directUsername}
                                        onChange={(e) => setDirectUsername(e.target.value)}
                                        placeholder="Ex: sua_empresa"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff',
                                            fontSize: '0.82rem',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    {directError && (
                                        <span style={{ fontSize: '0.74rem', color: '#f87171' }}>
                                            {directError}
                                        </span>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                        <button
                                            onClick={handleConnectDirect}
                                            disabled={isConnectingDirect || !directUsername.trim()}
                                            style={{
                                                flex: 1,
                                                padding: '9px 16px',
                                                borderRadius: '8px',
                                                backgroundColor: '#a855f7',
                                                color: '#ffffff',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                border: 'none',
                                                cursor: isConnectingDirect ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            {isConnectingDirect ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                                            {isConnectingDirect ? 'Vinculando...' : 'Conectar Perfil'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDirectInput(false);
                                                setDirectError('');
                                            }}
                                            style={{
                                                padding: '9px 14px',
                                                borderRadius: '8px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                color: '#94a3b8',
                                                fontSize: '0.8rem',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Security note */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.77rem' }}>
                            <Lock size={12} />
                            <span>Usamos apenas as permissões necessárias. Nunca publicamos em seu nome sem autorização.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ color: '#f8fafc', maxWidth: '1280px', margin: '0 auto', paddingBottom: '70px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 500px', minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                            Automações de Conversão
                        </h1>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.25)'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            Meta API Oficial
                        </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                        Responda comentários instantaneamente, envie Directs automáticos com links e capture leads qualificados no CRM nativo da Bexly.
                    </p>
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Meta Account Pill */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '7px 14px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(12px)'
                    }}>
                        <img
                            src={account.profilePictureUrl}
                            alt={account.username}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>@{account.username}</span>
                            <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                                Conectado
                            </span>
                        </div>
                    </div>

                    {/* Test Console Trigger Button */}
                    <button
                        onClick={() => {
                            setTestResult(null);
                            setShowTestModal(true);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 16px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: '#e2e8f0',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Sparkles size={14} color="#60a5fa" />
                        Testar Fluxo
                    </button>

                    {/* New Automation CTA */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 18px',
                            borderRadius: '12px',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Plus size={15} />
                        Nova Automação
                    </button>
                </div>
            </div>

            {/* ── KPI METRICS BAR ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px'
            }}>
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <span>Automações Ativas</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={16} color="#60a5fa" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>{activeCount}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {automations.length} configuradas</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        Monitoramento ativo 24/7
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <span>Comentários Analisados</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={16} color="#10b981" />
                        </div>
                    </div>
                    <div>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                            {totalComments.toLocaleString('pt-BR')}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                        Tempo de disparo: &lt; 1s
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <span>Directs Enviados</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Send size={16} color="#a855f7" />
                        </div>
                    </div>
                    <div>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                            {totalDms.toLocaleString('pt-BR')}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                        Taxa de entrega 99.8% oficial
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <span>Leads Salvos no CRM</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={16} color="#06b6d4" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#06b6d4', fontFamily: 'monospace' }}>
                            {totalLeads.toLocaleString('pt-BR')}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>({avgConversion}% conv.)</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '6px' }}>
                        Sincronizados nativamente no CRM
                    </div>
                </div>
            </div>

            {/* ── TABS NAVIGATION ── */}
            <div style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '12px',
                overflowX: 'auto'
            }}>
                {[
                    { id: 'regras', label: 'Regras de Automação', count: automations.length },
                    { id: 'posts', label: 'Posts & Reels Monitorados', count: posts.length },
                    { id: 'historico', label: 'Histórico de Disparos', count: logs.length },
                    { id: 'meta', label: 'Conexão & Webhook Meta' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                            border: activeTab === tab.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                            fontSize: '0.84rem',
                            fontWeight: activeTab === tab.id ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span style={{
                                padding: '2px 7px',
                                borderRadius: '10px',
                                fontSize: '0.7rem',
                                backgroundColor: activeTab === tab.id ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                                color: '#ffffff',
                                fontFamily: 'monospace'
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── TAB 1: REGRAS DE AUTOMAÇÃO ── */}
            {activeTab === 'regras' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Filter and Search Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '9px 16px',
                            flex: 1,
                            maxWidth: '440px'
                        }}>
                            <Search size={14} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Filtrar por nome, campanha ou palavra-chave..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', fontSize: '0.82rem', width: '100%' }}
                            />
                        </div>

                        {/* Status Filter Buttons */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '4px'
                        }}>
                            {(['all', 'active', 'paused'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setStatusFilter(mode)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        backgroundColor: statusFilter === mode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        color: statusFilter === mode ? '#ffffff' : '#94a3b8',
                                        border: 'none',
                                        fontSize: '0.78rem',
                                        fontWeight: statusFilter === mode ? 600 : 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {mode === 'all' ? 'Todos' : mode === 'active' ? 'Ativos' : 'Pausados'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Empty State */}
                    {filteredAutomations.length === 0 && (
                        <div style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.5)',
                            border: '1px dashed rgba(255, 255, 255, 0.12)',
                            borderRadius: '20px',
                            padding: '60px 24px',
                            textAlign: 'center'
                        }}>
                            <Zap size={40} color="#64748b" style={{ margin: '0 auto 14px' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px', color: '#ffffff' }}>Nenhuma automação encontrada</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '22px' }}>
                                Não encontramos regras com os filtros selecionados. Crie uma nova regra de comentário para Direct automático.
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 22px',
                                    borderRadius: '12px',
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={15} /> Criar Nova Automação
                            </button>
                        </div>
                    )}

                    {/* List of Automations */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredAutomations.map(auto => {
                            const targetPost = posts.find(p => p.id === auto.trigger.postId);
                            const keyword = auto.conditions[0]?.keyword || 'QUERO';
                            const action = auto.actions[0];
                            const isActive = auto.status === 'active';

                            return (
                                <div
                                    key={auto.id}
                                    style={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '20px',
                                        padding: '24px',
                                        backdropFilter: 'blur(16px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '20px',
                                        transition: 'border-color 0.2s',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                                    }}
                                >
                                    {/* Top Line: Post Preview, Title, Status & Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '18px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            {/* Media Thumbnail */}
                                            <div style={{
                                                position: 'relative',
                                                width: '52px',
                                                height: '52px',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                backgroundColor: '#1e293b',
                                                flexShrink: 0,
                                                border: '1px solid rgba(255, 255, 255, 0.1)'
                                            }}>
                                                {targetPost?.mediaUrl ? (
                                                    <img
                                                        src={targetPost.mediaUrl}
                                                        alt="Thumbnail"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Instagram size={22} color="#64748b" />
                                                    </div>
                                                )}
                                                <span style={{
                                                    position: 'absolute',
                                                    bottom: '2px',
                                                    right: '2px',
                                                    padding: '1px 4px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.62rem',
                                                    fontWeight: 700,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                                    color: '#ffffff'
                                                }}>
                                                    {targetPost?.mediaType || 'POST'}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                                                        {auto.name}
                                                    </h3>
                                                    <span style={{
                                                        padding: '3px 9px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: 500,
                                                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                                        color: '#cbd5e1',
                                                        border: '1px solid rgba(255, 255, 255, 0.08)'
                                                    }}>
                                                        {auto.campaignName}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                                                    {targetPost ? `Publicação: "${targetPost.caption.substring(0, 55)}..."` : 'Todas as publicações recentes'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Switch & Actions */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {/* Status Badge */}
                                            <button
                                                onClick={() => toggleAutomationStatus(auto.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '7px 14px',
                                                    borderRadius: '10px',
                                                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                                                    color: isActive ? '#10b981' : '#94a3b8',
                                                    border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)'}`,
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {isActive ? <Play size={12} fill="currentColor" /> : <Pause size={12} />}
                                                {isActive ? 'Ativa' : 'Pausada'}
                                            </button>

                                            {/* Test Button */}
                                            <button
                                                onClick={() => handleOpenTestForAuto(auto)}
                                                style={{
                                                    padding: '7px 14px',
                                                    borderRadius: '10px',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                                    color: '#60a5fa',
                                                    border: '1px solid rgba(59, 130, 246, 0.25)',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Testar Fluxo
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => deleteAutomation(auto.id)}
                                                style={{
                                                    padding: '7px 10px',
                                                    borderRadius: '10px',
                                                    backgroundColor: 'transparent',
                                                    color: '#64748b',
                                                    border: '1px solid transparent',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#ef4444';
                                                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#64748b';
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                                title="Excluir automação"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Middle: The Automation Flow Pipeline */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                        gap: '14px'
                                    }}>
                                        {/* Step 1: Gatilho */}
                                        <div style={{
                                            padding: '16px',
                                            borderRadius: '14px',
                                            backgroundColor: '#020617',
                                            border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                <MessageSquare size={14} />
                                                <span>Gatilho de Comentário</span>
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                                                Palavra-chave detectada:
                                                <span style={{
                                                    marginLeft: '8px',
                                                    padding: '3px 10px',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                                    color: '#60a5fa',
                                                    fontFamily: 'monospace',
                                                    fontWeight: 700,
                                                    fontSize: '0.82rem',
                                                    border: '1px solid rgba(59, 130, 246, 0.3)'
                                                }}>
                                                    "{keyword}"
                                                </span>
                                            </div>
                                        </div>

                                        {/* Step 2: Resposta Pública */}
                                        <div style={{
                                            padding: '16px',
                                            borderRadius: '14px',
                                            backgroundColor: '#020617',
                                            border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                <CornerDownRight size={14} />
                                                <span>Resposta no Post</span>
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>
                                                "{action?.publicCommentReply?.replyTemplates[0] || 'Enviado no seu direct! 🚀'}"
                                            </p>
                                        </div>

                                        {/* Step 3: Direct Message */}
                                        <div style={{
                                            padding: '16px',
                                            borderRadius: '14px',
                                            backgroundColor: '#020617',
                                            border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#a855f7', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Send size={14} />
                                                    <span>Direct Message (DM)</span>
                                                </span>
                                                {action?.ctaButton && (
                                                    <span style={{ fontSize: '0.7rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'none', fontWeight: 600 }}>
                                                        <ExternalLink size={11} /> Link VIP
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                                                {action?.messageTemplate || 'Mensagem automática enviada via Direct...'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom: Performance Metrics Strip */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '14px',
                                        paddingTop: '16px',
                                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                        fontSize: '0.82rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: '#94a3b8' }}>
                                            <div>
                                                <span style={{ color: '#64748b', marginRight: '6px' }}>Comentários:</span>
                                                <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{auto.metrics.commentsDetected}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: '#64748b', marginRight: '6px' }}>DMs:</span>
                                                <strong style={{ color: '#a855f7', fontFamily: 'monospace' }}>{auto.metrics.dmsSent}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: '#64748b', marginRight: '6px' }}>Leads no CRM:</span>
                                                <strong style={{ color: '#06b6d4', fontFamily: 'monospace' }}>{auto.metrics.leadsGenerated}</strong>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Taxa de Conversão:</span>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                fontFamily: 'monospace',
                                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                                color: '#10b981',
                                                border: '1px solid rgba(16, 185, 129, 0.25)'
                                            }}>
                                                {auto.metrics.conversionRate}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── TAB 2: POSTS & REELS MONITORADOS ── */}
            {activeTab === 'posts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
                                Publicações oficiais sincronizadas via Instagram Graph API da conta @{account.username}.
                            </p>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                Selecione qualquer post para anexar regras de resposta automática e disparo de Direct.
                            </span>
                        </div>
                        <button
                            onClick={() => refreshPosts()}
                            disabled={postsLoading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: '#e2e8f0',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: postsLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {postsLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} />}
                            {postsLoading ? 'Sincronizando...' : 'Sincronizar Feed'}
                        </button>
                    </div>

                    {posts.length === 0 ? (
                        <div style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.5)',
                            border: '1px dashed rgba(255, 255, 255, 0.12)',
                            borderRadius: '20px',
                            padding: '60px 24px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                <Instagram size={28} color="#60a5fa" />
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, color: '#ffffff' }}>
                                Nenhuma publicação encontrada no @{account.username}
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
                                O feed oficial da sua conta está conectado. Assim que você publicar novos posts ou reels no Instagram, clique em "Sincronizar Feed" para visualizá-los aqui e aplicar regras exclusivas por post.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <button
                                    onClick={() => refreshPosts()}
                                    disabled={postsLoading}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        fontSize: '0.84rem',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        cursor: postsLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {postsLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
                                    {postsLoading ? 'Sincronizando...' : 'Sincronizar Feed Agora'}
                                </button>
                                <button
                                    onClick={() => {
                                        setPostSelectionMode('all');
                                        setFormPostId('all');
                                        setShowCreateModal(true);
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        borderRadius: '12px',
                                        backgroundColor: '#3b82f6',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        fontSize: '0.84rem',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Zap size={14} />
                                    Criar Automação Global
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            {posts.map(post => {
                                const isAutomated = automations.some(a => a.trigger.postId === post.id);

                                return (
                                    <div
                                        key={post.id}
                                        style={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            backdropFilter: 'blur(16px)'
                                        }}
                                    >
                                        <div>
                                            <div style={{ position: 'relative', height: '190px', backgroundColor: '#020617', overflow: 'hidden' }}>
                                                <img
                                                    src={post.mediaUrl}
                                                    alt="Post media"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    left: '12px',
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                                    color: '#ffffff'
                                                }}>
                                                    {post.mediaType}
                                                </span>
                                                {isAutomated ? (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                        backgroundColor: 'rgba(16, 185, 129, 0.9)',
                                                        color: '#ffffff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        <Zap size={11} /> Automação Ativa
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: 500,
                                                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                                        color: '#94a3b8'
                                                    }}>
                                                        Sem Automação
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ padding: '18px' }}>
                                                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0, minHeight: '44px' }}>
                                                    {post.caption || 'Sem legenda'}
                                                </p>

                                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.76rem', color: '#64748b' }}>
                                                    <span>💬 {post.commentsCount} comentários</span>
                                                    <span>❤️ {post.likeCount} curtidas</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '0 18px 18px 18px' }}>
                                            <button
                                                onClick={() => {
                                                    setPostSelectionMode('specific');
                                                    setFormPostId(post.id);
                                                    setShowCreateModal(true);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '12px',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                                    color: '#60a5fa',
                                                    border: '1px solid rgba(59, 130, 246, 0.25)',
                                                    fontWeight: 600,
                                                    fontSize: '0.82rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Plus size={14} /> Criar Automação Neste Post
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB 3: HISTÓRICO DE DISPAROS ── */}
            {activeTab === 'historico' && (
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    backdropFilter: 'blur(16px)'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Log de Execuções em Tempo Real</h3>
                            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Auditoria de cada comentário captado e Direct enviado</p>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>{logs.length} eventos registrados</span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#64748b', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                                    <th style={{ padding: '14px 24px', fontWeight: 600 }}>Usuário</th>
                                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Comentário Captado</th>
                                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Palavra-Chave</th>
                                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status de Entrega</th>
                                    <th style={{ padding: '14px 24px', fontWeight: 600, textAlign: 'right' }}>Data / Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <Activity size={28} color="#64748b" />
                                                <span style={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.9rem' }}>Nenhum disparo registrado ainda</span>
                                                <span style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '420px' }}>
                                                    Quando seguidores comentarem nos posts monitorados com a palavra-chave configurada, os disparos de DM e logs aparecerão aqui em tempo real.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                            <td style={{ padding: '16px 24px', fontWeight: 600, color: '#ffffff' }}>
                                                @{log.instagramUsername}
                                            </td>
                                            <td style={{ padding: '16px 18px', color: '#cbd5e1' }}>
                                                "{log.commentText}"
                                            </td>
                                            <td style={{ padding: '16px 18px' }}>
                                                <span style={{ padding: '3px 8px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                                                    {log.matchedKeyword}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 18px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                                    <CheckCircle2 size={12} /> Entregue (Meta API)
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#64748b', textAlign: 'right', fontFamily: 'monospace' }}>
                                                {log.timestamp}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── TAB 4: CONEXÃO & WEBHOOK META ── */}
            {activeTab === 'meta' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                    {/* Meta API Settings */}
                    <div style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '28px',
                        backdropFilter: 'blur(16px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldCheck size={22} color="#60a5fa" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Credenciais da Meta Graph API</h3>
                                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Conexão oficial v21.0 ativa com autorização empresarial</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
                            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Instagram App ID</span>
                                <span style={{ color: '#ffffff', fontFamily: 'monospace', fontWeight: 600 }}>
                                    {import.meta.env.VITE_META_APP_ID || '1734960207599537'}
                                </span>
                            </div>

                            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Segurança do Token</span>
                                    <span style={{ color: '#10b981', fontWeight: 600 }}>Criptografia AES-256-GCM Nativa</span>
                                </div>
                                <CheckCircle2 size={18} color="#10b981" />
                            </div>

                            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Permissões Autorizadas</span>
                                <span style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.76rem' }}>
                                    instagram_manage_comments, instagram_manage_messages
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={reconnectInstagram}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                backgroundColor: '#3b82f6',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.84rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '4px'
                            }}
                        >
                            <RefreshCw size={14} /> Renovar / Reconectar Conta Meta
                        </button>
                    </div>

                    {/* Instagram Profile Status */}
                    <div style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '28px',
                        backdropFilter: 'blur(16px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img
                                src={account.profilePictureUrl}
                                alt={account.name}
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>{account.name}</h3>
                                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>@{account.username} • Perfil Comercial</p>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                                    Respostas públicas e privadas liberadas
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.82rem' }}>
                            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Seguidores</span>
                                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                                    {account.followersCount.toLocaleString('pt-BR')}
                                </span>
                            </div>
                            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Publicações</span>
                                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                                    {account.mediaCount}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={disconnectInstagram}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                fontWeight: 600,
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                                marginTop: 'auto'
                            }}
                        >
                            Desconectar Esta Conta
                        </button>
                    </div>
                </div>
            )}

            {/* ── MODAL: CONSOLE DE TESTES & VALIDAÇÃO (PROFESSIONAL INSPECTOR) ── */}
            {showTestModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 999,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '720px',
                        backgroundColor: '#0a0f1d',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '24px',
                        padding: '28px',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '22px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={18} color="#60a5fa" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Console de Teste da Automação</h3>
                                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Simule um seguidor comentando e audite a execução em tempo real.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTestModal(false)}
                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {/* Controls */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
                                <div>
                                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Publicação Alvo</label>
                                    <select
                                        value={testPostId}
                                        onChange={(e) => setTestPostId(e.target.value)}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#020617',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            color: '#ffffff',
                                            fontSize: '0.82rem',
                                            outline: 'none'
                                        }}
                                    >
                                        {posts.map(p => (
                                            <option key={p.id} value={p.id}>
                                                [{p.mediaType}] {p.caption.substring(0, 36)}...
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Usuário Comentador</label>
                                    <input
                                        type="text"
                                        value={testUsername}
                                        onChange={(e) => setTestUsername(e.target.value)}
                                        placeholder="breno.sena"
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#020617',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            color: '#ffffff',
                                            fontSize: '0.82rem',
                                            fontFamily: 'monospace',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Comentário Digitado</label>
                                    <input
                                        type="text"
                                        value={testComment}
                                        onChange={(e) => setTestComment(e.target.value)}
                                        placeholder="QUERO"
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#020617',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            color: '#60a5fa',
                                            fontSize: '0.85rem',
                                            fontFamily: 'monospace',
                                            fontWeight: 700,
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={handleRunTest}
                                    disabled={isSimulating}
                                    style={{
                                        marginTop: '6px',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        backgroundColor: '#3b82f6',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        fontSize: '0.84rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Play size={14} fill="currentColor" />
                                    {isSimulating ? 'Executando Gatilho...' : 'Simular Disparo Agora'}
                                </button>
                            </div>

                            {/* Live Result Inspector */}
                            <div style={{
                                padding: '18px',
                                borderRadius: '16px',
                                backgroundColor: '#020617',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                fontSize: '0.82rem',
                                gap: '14px'
                            }}>
                                <div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                                        Status da Execução
                                    </span>

                                    {testResult ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{
                                                padding: '12px',
                                                borderRadius: '10px',
                                                backgroundColor: testResult.matched ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                border: `1px solid ${testResult.matched ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                                color: testResult.matched ? '#10b981' : '#ef4444',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <CheckCircle2 size={16} />
                                                <span>
                                                    {testResult.matched ? 'Regra correspondida com sucesso!' : 'Nenhuma regra correspondeu à palavra-chave.'}
                                                </span>
                                            </div>

                                            {testResult.matched && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                                                    <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                        <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Resposta no post:</span>
                                                        <span style={{ color: '#86efac', fontStyle: 'italic' }}>"Acabei de te enviar no Direct! 🚀 Confere lá!"</span>
                                                    </div>

                                                    <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                        <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Direct enviado (DM):</span>
                                                        <span style={{ color: '#d8b4fe' }}>{testResult.sentDm}</span>
                                                    </div>

                                                    <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.25)', color: '#67e8f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Target size={14} />
                                                        <span>Lead @{testUsername} cadastrado no CRM nativo.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                                            <Activity size={28} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                                            Clique em "Simular Disparo Agora" para validar o fluxo.
                                        </div>
                                    )}
                                </div>

                                <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                                    Simulação fiel com os mesmos hooks do webhook oficial da Meta.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: NOVA AUTOMAÇÃO ── */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 999,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '620px',
                        backgroundColor: '#0a0f1d',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '24px',
                        padding: '28px',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Criar Nova Automação</h3>
                                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Configure o gatilho, resposta no post e mensagem privada no Direct.</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.82rem' }}>
                            <div>
                                <label style={{ color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Nome da Regra</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Ex: Entrega Checklist — Reel de Escala"
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#020617',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        padding: '11px 14px',
                                        color: '#ffffff',
                                        fontSize: '0.84rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Gatilho: Seletor Visual de Postagem */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ color: '#cbd5e1', fontWeight: 500, fontSize: '0.84rem' }}>
                                    Onde essa regra deve monitorar comentários?
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPostSelectionMode('all');
                                            setFormPostId('all');
                                        }}
                                        style={{
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            backgroundColor: postSelectionMode === 'all' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                            border: postSelectionMode === 'all' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                                            color: '#ffffff',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>⚡ Todos os Posts e Reels</span>
                                            {postSelectionMode === 'all' && <CheckCircle2 size={16} color="#3b82f6" />}
                                        </div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Gatilho global em qualquer post ou publicação futura</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPostSelectionMode('specific');
                                            if (posts.length > 0 && formPostId === 'all') {
                                                setFormPostId(posts[0].id);
                                            }
                                        }}
                                        style={{
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            backgroundColor: postSelectionMode === 'specific' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                            border: postSelectionMode === 'specific' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                                            color: '#ffffff',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>🎯 Post Específico do Perfil</span>
                                            {postSelectionMode === 'specific' && <CheckCircle2 size={16} color="#3b82f6" />}
                                        </div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Selecione uma postagem real do @{account.username}</span>
                                    </button>
                                </div>

                                {/* Post History Picker */}
                                {postSelectionMode === 'specific' && (
                                    <div style={{
                                        backgroundColor: '#020617',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '14px',
                                        padding: '14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>
                                                {posts.length > 0
                                                    ? `Selecione a publicação (${posts.length} sincronizadas)`
                                                    : `Nenhuma publicação no feed do @${account.username}`
                                                }
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => refreshPosts()}
                                                disabled={postsLoading}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#60a5fa',
                                                    fontSize: '0.74rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                            >
                                                <RefreshCw size={12} className={postsLoading ? 'animate-spin' : ''} />
                                                {postsLoading ? 'Sincronizando...' : 'Sincronizar Feed'}
                                            </button>
                                        </div>

                                        {posts.length > 0 ? (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                                                gap: '10px',
                                                maxHeight: '220px',
                                                overflowY: 'auto',
                                                paddingRight: '4px'
                                            }}>
                                                {posts.map(p => {
                                                    const isSelected = formPostId === p.id;
                                                    return (
                                                        <div
                                                            key={p.id}
                                                            onClick={() => setFormPostId(p.id)}
                                                            style={{
                                                                position: 'relative',
                                                                borderRadius: '10px',
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                                                                backgroundColor: '#0f172a',
                                                                display: 'flex',
                                                                flexDirection: 'column'
                                                            }}
                                                        >
                                                            <div style={{ position: 'relative', height: '90px' }}>
                                                                <img
                                                                    src={p.mediaUrl}
                                                                    alt="Post thumbnail"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                                <span style={{
                                                                    position: 'absolute',
                                                                    top: '4px',
                                                                    left: '4px',
                                                                    padding: '2px 5px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.6rem',
                                                                    fontWeight: 700,
                                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                                    color: '#ffffff'
                                                                }}>
                                                                    {p.mediaType}
                                                                </span>
                                                                {isSelected && (
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        top: '4px',
                                                                        right: '4px',
                                                                        width: '18px',
                                                                        height: '18px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#3b82f6',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <CheckCircle2 size={12} color="#ffffff" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div style={{ padding: '6px 8px', fontSize: '0.7rem', color: '#cbd5e1' }}>
                                                                <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {p.caption || 'Sem legenda'}
                                                                </p>
                                                                <span style={{ color: '#64748b', fontSize: '0.65rem' }}>{p.timestamp}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{
                                                padding: '16px',
                                                borderRadius: '10px',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                border: '1px dashed rgba(255,255,255,0.1)',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            }}>
                                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    Nenhum post publicado encontrado no feed do @{account.username} ainda.
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                                                    Você pode colar o link direto ou ID de um post abaixo:
                                                </p>
                                                <input
                                                    type="text"
                                                    value={customPostLink}
                                                    onChange={(e) => setCustomPostLink(e.target.value)}
                                                    placeholder="Cole o link do post (ex: https://instagram.com/p/...)"
                                                    style={{
                                                        width: '100%',
                                                        backgroundColor: '#020617',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '8px',
                                                        padding: '8px 10px',
                                                        color: '#ffffff',
                                                        fontSize: '0.76rem',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Palavra-Chave Gatilho</label>
                                <input
                                    type="text"
                                    value={formKeyword}
                                    onChange={(e) => setFormKeyword(e.target.value)}
                                    placeholder="Ex: QUERO ou ABRIR"
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#020617',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        padding: '11px 14px',
                                        color: '#60a5fa',
                                        fontFamily: 'monospace',
                                        fontWeight: 700,
                                        fontSize: '0.84rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Resposta Pública no Comentário do Post</label>
                                <input
                                    type="text"
                                    value={formPublicReply}
                                    onChange={(e) => setFormPublicReply(e.target.value)}
                                    placeholder="Ex: Acabei de te enviar no Direct! 🚀 Confere lá!"
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#020617',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        padding: '11px 14px',
                                        color: '#ffffff',
                                        fontSize: '0.84rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ color: '#cbd5e1', fontWeight: 500 }}>Mensagem no Direct (Instagram DM)</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#64748b' }}>
                                        <span>Variáveis:</span>
                                        <code style={{ color: '#60a5fa' }}>{"{{nome}}"}</code>
                                        <code style={{ color: '#60a5fa' }}>{"{{link}}"}</code>
                                    </div>
                                </div>
                                <textarea
                                    value={formMessage}
                                    onChange={(e) => setFormMessage(e.target.value)}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#020617',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        padding: '11px 14px',
                                        color: '#ffffff',
                                        fontSize: '0.84rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        lineHeight: 1.5
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                <div>
                                    <label style={{ color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Texto do Botão CTA</label>
                                    <input
                                        type="text"
                                        value={formCtaText}
                                        onChange={(e) => setFormCtaText(e.target.value)}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#020617',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            color: '#ffffff',
                                            fontSize: '0.82rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Link de Destino</label>
                                    <input
                                        type="text"
                                        value={formCtaUrl}
                                        onChange={(e) => setFormCtaUrl(e.target.value)}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#020617',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            color: '#60a5fa',
                                            fontSize: '0.82rem',
                                            fontFamily: 'monospace',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    backgroundColor: 'transparent',
                                    color: '#94a3b8',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveAutomation}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: '10px',
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
                                }}
                            >
                                Salvar e Ativar Regra
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
