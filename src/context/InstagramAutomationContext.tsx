import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import type {
    InstagramAccount,
    InstagramPost,
    Automation,
    NativeLead,
    AutomationRunLog,
    LeadInteraction
} from '../types/instagramAutomation';


interface InstagramAutomationContextType {
    account: InstagramAccount | null;
    setAccount: React.Dispatch<React.SetStateAction<InstagramAccount | null>>;
    accountLoading: boolean;
    posts: InstagramPost[];
    automations: Automation[];
    leads: NativeLead[];
    logs: AutomationRunLog[];
    reconnectInstagram: () => Promise<void>;
    connectWithToken: (token: string) => Promise<{ success: boolean; message?: string }>;
    connectDirectAccount: (data: { username: string; name?: string; profilePictureUrl?: string; followersCount?: number }) => Promise<{ success: boolean; message?: string }>;
    disconnectInstagram: () => void;
    refreshAccount: () => Promise<void>;
    createAutomation: (automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => Automation;
    toggleAutomationStatus: (id: string) => void;
    deleteAutomation: (id: string) => void;
    simulateCommentEvent: (params: {
        username: string;
        fullName: string;
        postId: string;
        commentText: string;
        simulatedAt?: string;
    }) => {
        success: boolean;
        matched: boolean;
        reason?: string;
        automation?: Automation;
        lead?: NativeLead;
        sentDm?: string;
        log?: AutomationRunLog;
    };
    updateLeadStatus: (leadId: string, status: NativeLead['status']) => void;
    addLeadNote: (leadId: string, note: string) => void;
}

// No hardcoded account — real account comes from the backend after OAuth

const initialPosts: InstagramPost[] = [
    {
        id: 'post_reel_101',
        caption: 'Como triplicar seu faturamento com agentes de conversão digital. Comente QUERO para receber o checklist exclusivo no seu Direct! 🚀',
        mediaType: 'REEL',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        permalink: 'https://instagram.com/p/reel_101',
        timestamp: 'Há 2 dias',
        commentsCount: 342,
        likeCount: 2840
    },
    {
        id: 'post_carrossel_102',
        caption: '5 Passos infalíveis para qualificar leads no automático antes da ligação. Comente ABRIR para ter acesso à nossa planilha mestra.',
        mediaType: 'CAROUSEL_ALBUM',
        mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        permalink: 'https://instagram.com/p/carrossel_102',
        timestamp: 'Há 5 dias',
        commentsCount: 189,
        likeCount: 1420
    },
    {
        id: 'post_single_103',
        caption: 'Novo sistema da Bexly já disponível para membros VIP. Comente LINK para entrar no grupo prioritário com desconto especial.',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
        permalink: 'https://instagram.com/p/single_103',
        timestamp: 'Há 1 semana',
        commentsCount: 95,
        likeCount: 980
    }
];

const initialAutomations: Automation[] = [
    {
        id: 'auto_1',
        organizationId: 'tenant_org_01',
        name: 'Material Gratuito — Checklist de Escala',
        campaignName: 'Reels Escala Q3',
        status: 'active',
        trigger: {
            type: 'instagram_comment',
            postId: 'post_reel_101',
            postTitle: 'Como triplicar seu faturamento com agentes de conversão'
        },
        conditions: [
            {
                field: 'comment_text',
                operator: 'contains',
                keyword: 'QUERO',
                caseSensitive: false
            }
        ],
        actions: [
            {
                type: 'send_instagram_dm',
                messageTemplate: 'Olá, {{nome}}! 👋 Vi que você comentou "{{palavra_chave}}" no nosso Reel. Conforme prometido, aqui está o seu material gratuito de escala: {{link}}',
                ctaButton: {
                    text: 'Acessar Checklist Gratuito',
                    url: 'https://bexly.com.br/materiais/checklist-escala'
                },
                publicCommentReply: {
                    enabled: true,
                    replyTemplates: [
                        'Acabei de te enviar o material no Direct! 🚀 Dá uma olhada lá!',
                        'Enviado no seu privado com sucesso! Qualquer dúvida me chama.',
                        'Checa seu Direct, {{nome}}! O acesso já está liberado 🔥'
                    ]
                }
            }
        ],
        createdAt: '2026-03-20T14:00:00Z',
        updatedAt: '2026-03-28T09:30:00Z',
        metrics: {
            commentsDetected: 342,
            keywordMatches: 310,
            dmsSent: 308,
            leadsGenerated: 295,
            conversionRate: 95.1,
            attributedRevenue: 14850
        }
    },
    {
        id: 'auto_2',
        organizationId: 'tenant_org_01',
        name: 'Entrega Isca Digital — Planilha Mestra',
        campaignName: 'Carrossel Planilha Q3',
        status: 'active',
        trigger: {
            type: 'instagram_comment',
            postId: 'post_carrossel_102',
            postTitle: '5 Passos infalíveis para qualificar leads no automático'
        },
        conditions: [
            {
                field: 'comment_text',
                operator: 'contains',
                keyword: 'ABRIR',
                caseSensitive: false
            }
        ],
        actions: [
            {
                type: 'send_instagram_dm',
                messageTemplate: 'E aí {{nome}}, tudo bem? 🎯 Aqui está a Planilha Mestra de Qualificação que você pediu nos comentários: {{link}} Aproveite!',
                ctaButton: {
                    text: 'Baixar Planilha Agora',
                    url: 'https://bexly.com.br/downloads/planilha-mestra'
                },
                publicCommentReply: {
                    enabled: true,
                    replyTemplates: [
                        'Enviado no seu Direct! Confere lá 📊',
                        'Prontinho! Link enviado no seu privado.'
                    ]
                }
            }
        ],
        createdAt: '2026-03-24T11:20:00Z',
        updatedAt: '2026-03-29T16:45:00Z',
        metrics: {
            commentsDetected: 189,
            keywordMatches: 174,
            dmsSent: 174,
            leadsGenerated: 168,
            conversionRate: 96.5,
            attributedRevenue: 8400
        }
    }
];

const initialLeads: NativeLead[] = [
    {
        id: 'lead_ig_01',
        organizationId: 'tenant_org_01',
        name: 'Camila Fernandes',
        instagramUsername: 'camila.growth',
        instagramUserId: 'ig_user_891238',
        profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        status: 'Qualificado',
        tags: ['Instagram Lead', 'Interesse Alto', 'Automação Q3'],
        originPlatform: 'instagram',
        sourcePostId: 'post_reel_101',
        sourcePostTitle: 'Como triplicar seu faturamento com agentes de conversão',
        campaign: 'Reels Escala Q3',
        triggerKeyword: 'QUERO',
        automationId: 'auto_1',
        firstInteractionAt: '2026-03-28T14:32:00Z',
        lastInteractionAt: '2026-03-29T18:10:00Z',
        interactionCount: 3,
        timeline: [
            {
                id: 'int_1',
                timestamp: '2026-03-28 14:32',
                type: 'comment_detected',
                title: 'Comentou no Reel "Como triplicar seu faturamento"',
                description: 'Comentário recebido: "QUERO muito esse checklist!"'
            },
            {
                id: 'int_2',
                timestamp: '2026-03-28 14:32',
                type: 'dm_sent',
                title: 'DM Oficial da Meta enviada com sucesso',
                description: 'Mensagem privada disparada com link do checklist.',
                metadata: {
                    keyword: 'QUERO',
                    messageSent: 'Olá, Camila! Vi que você comentou QUERO no nosso Reel...'
                }
            },
            {
                id: 'int_3',
                timestamp: '2026-03-29 18:10',
                type: 'status_change',
                title: 'Lead qualificado pela equipe',
                description: 'Interagiu positivamente e clicou no link de demonstração.'
            }
        ],
        notes: 'Cliente em potencial com agência de tráfego pago querendo automatizar DMs de 12 contas.',
        attributedValue: 2490
    },
    {
        id: 'lead_ig_02',
        organizationId: 'tenant_org_01',
        name: 'Rodrigo Siqueira',
        instagramUsername: 'rodrigo.invest',
        instagramUserId: 'ig_user_443219',
        profilePicUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        status: 'Oportunidade',
        tags: ['Instagram Lead', 'B2B', 'Planilha Mestra'],
        originPlatform: 'instagram',
        sourcePostId: 'post_carrossel_102',
        sourcePostTitle: '5 Passos infalíveis para qualificar leads no automático',
        campaign: 'Carrossel Planilha Q3',
        triggerKeyword: 'ABRIR',
        automationId: 'auto_2',
        firstInteractionAt: '2026-03-29T09:15:00Z',
        lastInteractionAt: '2026-03-30T11:45:00Z',
        interactionCount: 2,
        timeline: [
            {
                id: 'int_4',
                timestamp: '2026-03-29 09:15',
                type: 'comment_detected',
                title: 'Comentou no Carrossel "5 Passos infalíveis"',
                description: 'Comentário recebido: "abrir por favor!"'
            },
            {
                id: 'int_5',
                timestamp: '2026-03-29 09:15',
                type: 'dm_sent',
                title: 'DM Oficial da Meta enviada com sucesso',
                description: 'Link da planilha mestra enviado no Direct.',
                metadata: {
                    keyword: 'ABRIR'
                }
            }
        ],
        notes: 'Demonstrou interesse no plano anual da Bexly.',
        attributedValue: 4980
    }
];

const initialLogs: AutomationRunLog[] = [
    {
        id: 'log_01',
        timestamp: '2026-03-30 18:45:12',
        automationId: 'auto_1',
        automationName: 'Material Gratuito — Checklist de Escala',
        instagramUsername: 'lucas_mkt_digital',
        commentText: 'Quero esse material agora!!',
        matchedKeyword: 'QUERO',
        status: 'Executado',
        dmMessage: 'Olá, Lucas! 👋 Vi que você comentou "QUERO"...',
        leadId: 'lead_ig_03',
        idempotencyKey: 'meta_comment_evt_17849129031'
    },
    {
        id: 'log_02',
        timestamp: '2026-03-30 18:32:05',
        automationId: 'auto_2',
        automationName: 'Entrega Isca Digital — Planilha Mestra',
        instagramUsername: 'ana.empreendedora',
        commentText: 'ABRIR!',
        matchedKeyword: 'ABRIR',
        status: 'Executado',
        dmMessage: 'E aí Ana, tudo bem? 🎯 Aqui está a Planilha Mestra...',
        leadId: 'lead_ig_04',
        idempotencyKey: 'meta_comment_evt_17849129028'
    },
    {
        id: 'log_03',
        timestamp: '2026-03-30 17:15:40',
        automationId: 'auto_1',
        automationName: 'Material Gratuito — Checklist de Escala',
        instagramUsername: 'pedro_random',
        commentText: 'Parabéns pelo vídeo, muito bom!',
        matchedKeyword: '',
        status: 'Ignorado',
        dmMessage: 'Nenhuma ação executada (palavra-chave não encontrada)',
        leadId: '',
        idempotencyKey: 'meta_comment_evt_17849128912',
        errorReason: 'Comentário sem a palavra-chave configurada'
    }
];

const InstagramAutomationContext = createContext<InstagramAutomationContextType | undefined>(undefined);

export const InstagramAutomationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Account starts null; fetched from backend on mount
    const [account, setAccount] = useState<InstagramAccount | null>(null);
    const [accountLoading, setAccountLoading] = useState(true);

    const [posts] = useState<InstagramPost[]>(initialPosts);

    const [automations, setAutomations] = useState<Automation[]>(() => {
        const saved = localStorage.getItem('bexly_ig_automations');
        return saved ? JSON.parse(saved) : initialAutomations;
    });

    const [leads, setLeads] = useState<NativeLead[]>(() => {
        const saved = localStorage.getItem('bexly_native_leads');
        return saved ? JSON.parse(saved) : initialLeads;
    });

    const [logs, setLogs] = useState<AutomationRunLog[]>(() => {
        const saved = localStorage.getItem('bexly_ig_logs');
        return saved ? JSON.parse(saved) : initialLogs;
    });

    // Processed comment event idempotency cache
    const [processedEventKeys, setProcessedEventKeys] = useState<Set<string>>(new Set());

    // Fetch connected Instagram account from backend on mount
    const refreshAccount = async () => {
        setAccountLoading(true);
        try {
            const data = await api.getAccounts();
            // Backend returns array or { accounts: [...] }; take first connected account
            const rawAccounts: any[] = Array.isArray(data) ? data : data?.accounts || [];
            const raw = rawAccounts.find((a: any) => (a.connectionStatus === 'connected' || a.connection_status === 'connected')) || rawAccounts[0] || null;
            if (raw) {
                const acc: InstagramAccount = {
                    id: raw.id,
                    username: raw.username,
                    name: raw.name || raw.username,
                    profilePictureUrl: raw.profilePictureUrl || raw.profile_picture_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
                    followersCount: raw.followersCount ?? raw.followers_count ?? 0,
                    mediaCount: raw.mediaCount ?? raw.media_count ?? 0,
                    connectionStatus: raw.connectionStatus || raw.connection_status || 'connected',
                    tokenExpiresAt: raw.tokenExpiresAt || raw.token_expires_at || '',
                    connectedAt: raw.connectedAt || raw.connected_at || new Date().toISOString(),
                    instagramBusinessId: raw.instagramBusinessId || raw.instagram_user_id || raw.id
                };
                setAccount(acc);
                localStorage.setItem('bexly_ig_account', JSON.stringify(acc));
                setAccountLoading(false);
                return;
            }
        } catch {
            // Backend offline or no accounts
        }

        // Fallback: check localStorage
        const savedAccount = localStorage.getItem('bexly_ig_account');
        if (savedAccount) {
            try {
                setAccount(JSON.parse(savedAccount));
            } catch {
                setAccount(null);
            }
        } else {
            setAccount(null);
        }
        setAccountLoading(false);
    };

    useEffect(() => {
        refreshAccount();
    }, []);

    useEffect(() => {
        if (account) {
            localStorage.setItem('bexly_ig_account', JSON.stringify(account));
        }
    }, [account]);

    useEffect(() => {
        localStorage.setItem('bexly_ig_automations', JSON.stringify(automations));
    }, [automations]);

    useEffect(() => {
        localStorage.setItem('bexly_native_leads', JSON.stringify(leads));
    }, [leads]);

    useEffect(() => {
        localStorage.setItem('bexly_ig_logs', JSON.stringify(logs));
    }, [logs]);

    /** Launch the real Meta OAuth flow */
    const reconnectInstagram = async () => {
        try {
            let authUrl: string | undefined;
            try {
                const data = await api.getAuthUrl();
                if (data && typeof data === 'object' && typeof data.url === 'string') {
                    authUrl = data.url;
                }
            } catch (err) {
                console.warn('API backend auth-url não respondeu, usando gerador dinâmico de OAuth:', err);
            }

            // Client-side dynamic OAuth fallback (works universally on Vercel, localhost, and custom domains!)
            if (!authUrl) {
                const clientId = import.meta.env.VITE_META_APP_ID || '28710878855238960';
                const redirectUri = `${window.location.origin}/integrations/instagram/callback`;
                const scopes = [
                    'instagram_business_basic',
                    'instagram_business_manage_comments',
                    'instagram_business_manage_messages'
                ].join(',');
                const state = btoa(JSON.stringify({ origin: window.location.origin, timestamp: Date.now() }));

                const params = new URLSearchParams({
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    scope: scopes,
                    response_type: 'code',
                    state: state
                });
                authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`;
            }

            if (authUrl) {
                window.location.href = authUrl;
                return;
            }

            alert('Não foi possível obter a URL de autorização do Instagram. Verifique as credenciais da Meta.');
        } catch (err: any) {
            console.error('Erro ao iniciar OAuth do Instagram:', err);
            alert(`Falha na conexão: ${err.message || err}`);
        }
    };

    /** Connect using a Meta Graph API Access Token directly */
    const connectWithToken = async (token: string): Promise<{ success: boolean; message?: string }> => {
        try {
            setAccountLoading(true);
            const res = await api.connectToken(token);
            if (res?.success && res?.account) {
                setAccount({
                    id: res.account.id,
                    username: res.account.username,
                    name: res.account.name || res.account.username,
                    profilePictureUrl: res.account.profile_picture_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
                    followersCount: res.account.followers_count || 0,
                    mediaCount: res.account.media_count || 0,
                    connectionStatus: 'connected',
                    tokenExpiresAt: res.account.token_expires_at,
                    connectedAt: new Date().toISOString(),
                    instagramBusinessId: res.account.id
                });
                return { success: true };
            }
            return { success: false, message: 'A Meta não retornou dados para este token.' };
        } catch (err: any) {
            console.error('Erro ao conectar via token:', err);
            const msg = err.response?.data?.message || err.message || 'Falha ao validar token do Instagram.';
            return { success: false, message: msg };
        } finally {
            setAccountLoading(false);
        }
    };

    /** Connect official account directly by username/profile */
    const connectDirectAccount = async (data: {
        username: string;
        name?: string;
        profilePictureUrl?: string;
        followersCount?: number;
    }): Promise<{ success: boolean; message?: string }> => {
        try {
            setAccountLoading(true);
            const res = await api.connectCustom(data);
            if (res?.success && res?.account) {
                setAccount({
                    id: res.account.id,
                    username: res.account.username,
                    name: res.account.name || res.account.username,
                    profilePictureUrl: res.account.profile_picture_url,
                    followersCount: res.account.followers_count || 1250,
                    mediaCount: res.account.media_count || 24,
                    connectionStatus: 'connected',
                    tokenExpiresAt: res.account.token_expires_at,
                    connectedAt: new Date().toISOString(),
                    instagramBusinessId: res.account.id
                });
                return { success: true };
            }
            return { success: false, message: 'Não foi possível vincular a conta informada.' };
        } catch (err: any) {
            console.error('Erro ao vincular conta direta:', err);
            const msg = err.response?.data?.message || err.message || 'Erro ao salvar conta do Instagram.';
            return { success: false, message: msg };
        } finally {
            setAccountLoading(false);
        }
    };

    const disconnectInstagram = () => {
        setAccount(null);
        // Optionally call backend to revoke token
        if (account?.id) {
            api.disconnectAccount(account.id).catch(console.warn);
        }
    };

    const createAutomation = (data: Omit<Automation, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Automation => {
        const newAuto: Automation = {
            ...data,
            id: `auto_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metrics: {
                commentsDetected: 0,
                keywordMatches: 0,
                dmsSent: 0,
                leadsGenerated: 0,
                conversionRate: 0,
                attributedRevenue: 0
            }
        };

        setAutomations(prev => [newAuto, ...prev]);
        return newAuto;
    };

    const toggleAutomationStatus = (id: string) => {
        setAutomations(prev => prev.map(a => {
            if (a.id === id) {
                return {
                    ...a,
                    status: a.status === 'active' ? 'paused' : 'active',
                    updatedAt: new Date().toISOString()
                };
            }
            return a;
        }));
    };

    const deleteAutomation = (id: string) => {
        setAutomations(prev => prev.filter(a => a.id !== id));
    };

    // Idempotent Event Processor: Webhook simulation and evaluation
    const simulateCommentEvent = ({
        username,
        fullName,
        postId,
        commentText,
        simulatedAt = new Date().toISOString()
    }: {
        username: string;
        fullName: string;
        postId: string;
        commentText: string;
        simulatedAt?: string;
    }) => {
        // Idempotency verification
        const idempotencyKey = `evt_${username.toLowerCase()}_${postId}_${commentText.trim().toLowerCase()}`;
        if (processedEventKeys.has(idempotencyKey)) {
            return {
                success: false,
                matched: false,
                reason: 'Evento duplicado ignorado pelo mecanismo de idempotência da Bexly.'
            };
        }
        setProcessedEventKeys(prev => new Set(prev).add(idempotencyKey));

        // Find active automation that matches post and keyword
        const matchingAuto = automations.find(auto => {
            if (auto.status !== 'active') return false;

            // Trigger post check
            const postMatches = auto.trigger.postId === 'all' || auto.trigger.postId === postId;
            if (!postMatches) return false;

            // Condition check
            return auto.conditions.some(cond => {
                const targetComment = cond.caseSensitive ? commentText : commentText.toLowerCase();
                const targetKeyword = cond.caseSensitive ? cond.keyword : cond.keyword.toLowerCase();

                if (cond.operator === 'exact') {
                    return targetComment.trim() === targetKeyword.trim();
                } else {
                    return targetComment.includes(targetKeyword.trim());
                }
            });
        });

        const selectedPost = posts.find(p => p.id === postId) || posts[0];

        if (!matchingAuto) {
            // Log unmatched comment
            const logEntry: AutomationRunLog = {
                id: `log_${Date.now()}`,
                timestamp: new Date().toLocaleString('pt-BR'),
                automationId: 'none',
                automationName: 'Nenhuma automação correspondente',
                instagramUsername: username,
                commentText,
                matchedKeyword: '',
                status: 'Ignorado',
                dmMessage: 'Nenhuma ação executada',
                leadId: '',
                idempotencyKey,
                errorReason: 'Nenhuma automação ativa ou palavra-chave não correspondida'
            };
            setLogs(prev => [logEntry, ...prev]);

            return {
                success: false,
                matched: false,
                reason: 'Nenhuma automação ativa encontrou correspondência para este comentário e publicação.'
            };
        }

        // Matched! Generate personalized DM content
        const matchedCond = matchingAuto.conditions[0];
        const action = matchingAuto.actions[0];
        const nowFormatted = new Date().toLocaleDateString('pt-BR');
        const ctaUrl = action.ctaButton?.url || 'https://bexly.com.br';

        let personalizedMessage = action.messageTemplate
            .replace(/\{\{nome\}\}/gi, fullName.split(' ')[0] || username)
            .replace(/\{\{username\}\}/gi, `@${username}`)
            .replace(/\{\{palavra_chave\}\}/gi, matchedCond.keyword)
            .replace(/\{\{post\}\}/gi, selectedPost.caption.substring(0, 30) + '...')
            .replace(/\{\{data\}\}/gi, nowFormatted)
            .replace(/\{\{link\}\}/gi, ctaUrl);

        // Native Lead Creation & Deduplication
        const existingLeadIndex = leads.findIndex(
            l => l.instagramUsername.toLowerCase() === username.toLowerCase()
        );

        let finalLead: NativeLead;

        if (existingLeadIndex >= 0) {
            // Update existing lead (deduplication)
            const existing = leads[existingLeadIndex];
            const updatedTimeline: LeadInteraction[] = [
                {
                    id: `int_${Date.now()}`,
                    timestamp: new Date().toLocaleString('pt-BR'),
                    type: 'comment_detected',
                    title: `Nova interação no post "${selectedPost.caption.substring(0, 30)}..."`,
                    description: `Comentou: "${commentText}". Palavra-chave: "${matchedCond.keyword}".`,
                    metadata: {
                        postId,
                        keyword: matchedCond.keyword,
                        automationId: matchingAuto.id
                    }
                },
                {
                    id: `int_${Date.now() + 1}`,
                    timestamp: new Date().toLocaleString('pt-BR'),
                    type: 'dm_sent',
                    title: 'Mensagem privada enviada via Meta API',
                    description: personalizedMessage,
                    metadata: {
                        messageSent: personalizedMessage
                    }
                },
                ...existing.timeline
            ];

            finalLead = {
                ...existing,
                lastInteractionAt: simulatedAt,
                interactionCount: existing.interactionCount + 1,
                campaign: matchingAuto.campaignName,
                triggerKeyword: matchedCond.keyword,
                timeline: updatedTimeline
            };

            setLeads(prev => {
                const copy = [...prev];
                copy[existingLeadIndex] = finalLead;
                return copy;
            });
        } else {
            // Create new Native Lead
            finalLead = {
                id: `lead_ig_${Date.now()}`,
                organizationId: matchingAuto.organizationId,
                name: fullName,
                instagramUsername: username,
                instagramUserId: `ig_user_${Math.floor(100000 + Math.random() * 900000)}`,
                profilePicUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=120&auto=format&fit=crop&q=80`,
                status: 'Novo',
                tags: ['Instagram Lead', matchingAuto.campaignName],
                originPlatform: 'instagram',
                sourcePostId: postId,
                sourcePostTitle: selectedPost.caption.substring(0, 45) + '...',
                campaign: matchingAuto.campaignName,
                triggerKeyword: matchedCond.keyword,
                automationId: matchingAuto.id,
                firstInteractionAt: simulatedAt,
                lastInteractionAt: simulatedAt,
                interactionCount: 1,
                timeline: [
                    {
                        id: `int_${Date.now()}`,
                        timestamp: new Date().toLocaleString('pt-BR'),
                        type: 'comment_detected',
                        title: `Primeiro contato via Instagram Post`,
                        description: `Comentou: "${commentText}" na publicação "${selectedPost.caption.substring(0, 30)}...". Palavra-chave identificada: "${matchedCond.keyword}".`
                    },
                    {
                        id: `int_${Date.now() + 1}`,
                        timestamp: new Date().toLocaleString('pt-BR'),
                        type: 'dm_sent',
                        title: 'DM Automática Oficial enviada',
                        description: personalizedMessage,
                        metadata: {
                            messageSent: personalizedMessage
                        }
                    }
                ]
            };

            setLeads(prev => [finalLead, ...prev]);
        }

        // Update automation metrics
        setAutomations(prev => prev.map(a => {
            if (a.id === matchingAuto.id) {
                const newComments = a.metrics.commentsDetected + 1;
                const newMatches = a.metrics.keywordMatches + 1;
                const newDms = a.metrics.dmsSent + 1;
                const newLeads = existingLeadIndex >= 0 ? a.metrics.leadsGenerated : a.metrics.leadsGenerated + 1;
                return {
                    ...a,
                    metrics: {
                        ...a.metrics,
                        commentsDetected: newComments,
                        keywordMatches: newMatches,
                        dmsSent: newDms,
                        leadsGenerated: newLeads,
                        conversionRate: Number(((newLeads / newComments) * 100).toFixed(1))
                    }
                };
            }
            return a;
        }));

        // Log execution
        const logEntry: AutomationRunLog = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toLocaleString('pt-BR'),
            automationId: matchingAuto.id,
            automationName: matchingAuto.name,
            instagramUsername: username,
            commentText,
            matchedKeyword: matchedCond.keyword,
            status: 'Executado',
            dmMessage: personalizedMessage,
            leadId: finalLead.id,
            idempotencyKey
        };

        setLogs(prev => [logEntry, ...prev]);

        return {
            success: true,
            matched: true,
            automation: matchingAuto,
            lead: finalLead,
            sentDm: personalizedMessage,
            log: logEntry
        };
    };

    const updateLeadStatus = (leadId: string, status: NativeLead['status']) => {
        setLeads(prev => prev.map(l => {
            if (l.id === leadId) {
                const statusInteraction: LeadInteraction = {
                    id: `int_${Date.now()}`,
                    timestamp: new Date().toLocaleString('pt-BR'),
                    type: 'status_change',
                    title: `Status alterado para "${status}"`,
                    description: `Atualizado pelo operador no painel de leads da Bexly.`
                };
                return {
                    ...l,
                    status,
                    timeline: [statusInteraction, ...l.timeline]
                };
            }
            return l;
        }));
    };

    const addLeadNote = (leadId: string, note: string) => {
        setLeads(prev => prev.map(l => {
            if (l.id === leadId) {
                return {
                    ...l,
                    notes: note
                };
            }
            return l;
        }));
    };

    return (
        <InstagramAutomationContext.Provider value={{
            account,
            setAccount,
            accountLoading,
            posts,
            automations,
            leads,
            logs,
            reconnectInstagram,
            connectWithToken,
            connectDirectAccount,
            disconnectInstagram,
            refreshAccount,
            createAutomation,
            toggleAutomationStatus,
            deleteAutomation,
            simulateCommentEvent,
            updateLeadStatus,
            addLeadNote
        }}>
            {children}
        </InstagramAutomationContext.Provider>
    );
};

export const useInstagramAutomation = () => {
    const context = useContext(InstagramAutomationContext);
    if (!context) {
        throw new Error('useInstagramAutomation must be used within an InstagramAutomationProvider');
    }
    return context;
};
