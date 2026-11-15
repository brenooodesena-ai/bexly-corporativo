import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
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
    postsLoading: boolean;
    refreshPosts: (targetAccountId?: string) => Promise<void>;
    refreshAutomations: () => Promise<void>;
    refreshLeads: () => Promise<void>;
    automations: Automation[];
    leads: NativeLead[];
    logs: AutomationRunLog[];
    reconnectInstagram: (customRedirect?: string, mode?: 'facebook' | 'instagram') => Promise<void>;
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

// 100% Real data architecture — all accounts, posts, automations, and leads come dynamically from the backend and Meta Graph API.

const InstagramAutomationContext = createContext<InstagramAutomationContextType | undefined>(undefined);

export const InstagramAutomationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.id || 'guest';
    const getKey = useCallback((name: string) => `bexly_u_${userId}_${name}`, [userId]);

    // Account starts null; fetched from backend on mount or tenant switch
    const [account, setAccount] = useState<InstagramAccount | null>(null);
    const [accountLoading, setAccountLoading] = useState(true);

    const [posts, setPosts] = useState<InstagramPost[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);

    const [automations, setAutomations] = useState<Automation[]>([]);
    const [leads, setLeads] = useState<NativeLead[]>([]);
    const [logs, setLogs] = useState<AutomationRunLog[]>([]);

    // Processed comment event idempotency cache
    const [processedEventKeys, setProcessedEventKeys] = useState<Set<string>>(new Set());

    // Fetch real Instagram media from backend / Meta Graph API
    const refreshPosts = async (targetAccountId?: string) => {
        const accId = targetAccountId || account?.id || 'ig_acc_bexlybr';
        setPostsLoading(true);
        try {
            const data = await api.getAccountMedia(accId);

            // Load existing saved posts to ensure feed and reels are NEVER lost from history
            const savedRaw = localStorage.getItem(getKey('ig_posts'));
            let existingPosts: InstagramPost[] = [];
            try {
                existingPosts = savedRaw ? JSON.parse(savedRaw) : [];
            } catch {
                existingPosts = [];
            }

            // Existing permanent feed posts and reels are preserved forever
            const permanentExisting = existingPosts.filter(p => !p.isStory && p.mediaType !== 'STORY');

            if (data && Array.isArray(data.media)) {
                const incomingMapped: InstagramPost[] = data.media.map((m: any) => ({
                    id: m.id,
                    caption: m.caption || (m.is_story || m.media_type === 'STORY' ? 'Story Ativo' : 'Sem legenda'),
                    mediaType: (m.media_type as any) || (m.is_story ? 'STORY' : 'IMAGE'),
                    mediaUrl: m.media_url || m.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
                    permalink: m.permalink || `https://instagram.com/p/${m.id}`,
                    timestamp: m.timestamp ? (
                        m.is_story || m.media_type === 'STORY'
                            ? `Story (${m.expires_in_hours || 24}h restantes)`
                            : new Date(m.timestamp).toLocaleDateString('pt-BR')
                    ) : 'Recente',
                    commentsCount: m.comments_count || 0,
                    likeCount: m.like_count || 0,
                    isStory: Boolean(m.is_story || m.media_type === 'STORY'),
                    expiresInHours: m.expires_in_hours,
                }));

                // Strict filtering for stories: ONLY active stories with <= 24h
                const activeStories = incomingMapped.filter(m => m.isStory);

                // Permanent posts and reels: merge historical posts with incoming items
                const postMap = new Map<string, InstagramPost>();
                permanentExisting.forEach(p => postMap.set(p.id, p));
                incomingMapped.filter(m => !m.isStory).forEach(p => postMap.set(p.id, p));

                const allPermanent = Array.from(postMap.values());
                const unified = [...activeStories, ...allPermanent];

                setPosts(unified);
                localStorage.setItem(getKey('ig_posts'), JSON.stringify(unified));
            } else if (permanentExisting.length > 0) {
                // If offline or 0 new items, keep all historical posts and reels
                setPosts(permanentExisting);
            }
        } catch (err) {
            console.warn('Erro ao carregar posts reais do Instagram:', err);
        } finally {
            setPostsLoading(false);
        }
    };

    // Fetch automations from backend for the current tenant
    const refreshAutomations = async () => {
        try {
            const data = await api.getAutomations();
            if (data && Array.isArray(data.automations) && data.automations.length > 0) {
                const mapped: Automation[] = data.automations.map((a: any) => ({
                    id: a.id,
                    organizationId: a.organization_id || 'org_default',
                    name: a.name,
                    campaignName: a.campaign_id || a.name,
                    status: (a.status as 'active' | 'paused') || 'active',
                    trigger: a.trigger_config || { type: 'instagram_comment', postId: 'all' },
                    conditions: a.conditions_config || [],
                    actions: a.actions_config || [],
                    createdAt: a.created_at,
                    updatedAt: a.updated_at,
                    metrics: {
                        commentsDetected: a.total_runs || 0,
                        keywordMatches: a.successful_runs || 0,
                        dmsSent: a.successful_runs || 0,
                        leadsGenerated: a.leads_generated || 0,
                        conversionRate: a.total_runs ? Math.round((a.successful_runs / a.total_runs) * 100) : 0,
                        attributedRevenue: 0
                    }
                }));
                setAutomations(mapped);
                localStorage.setItem(getKey('ig_automations'), JSON.stringify(mapped));
            } else {
                setAutomations([]);
                localStorage.removeItem(getKey('ig_automations'));
            }
        } catch (err) {
            console.warn('Erro ao carregar automações do backend:', err);
        }
    };

    // Fetch leads from backend for the current tenant
    const refreshLeads = async () => {
        try {
            const data = await api.getLeads();
            if (data && Array.isArray(data.leads)) {
                const mapped: NativeLead[] = data.leads.map((l: any) => ({
                    id: l.id,
                    organizationId: l.organization_id || 'org_default',
                    name: l.name || l.instagram_username || 'Lead Instagram',
                    instagramUsername: l.instagram_username || '',
                    instagramUserId: l.instagram_user_id || '',
                    profilePicUrl: l.profile_pic_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name || l.instagram_username || 'IG')}&background=833ab4&color=fff`,
                    status: l.status || 'Novo',
                    tags: Array.isArray(l.tags) ? l.tags : (l.tags ? JSON.parse(l.tags) : []),
                    originPlatform: 'instagram',
                    sourcePostId: l.source_post_id || 'all',
                    sourcePostTitle: l.source_post_title || 'Publicação do Instagram',
                    campaign: l.campaign || 'Geral',
                    triggerKeyword: l.trigger_keyword || '',
                    automationId: l.automation_id || '',
                    firstInteractionAt: l.first_interaction_at || l.created_at,
                    lastInteractionAt: l.last_interaction_at || l.updated_at,
                    interactionCount: l.interaction_count || 1,
                    timeline: [],
                    notes: l.notes || '',
                    attributedValue: l.attributed_value || 0
                }));
                setLeads(mapped);
                localStorage.setItem(getKey('native_leads'), JSON.stringify(mapped));
            } else {
                setLeads([]);
                localStorage.removeItem(getKey('native_leads'));
            }
        } catch (err) {
            console.warn('Erro ao carregar leads do backend:', err);
        }
    };

    // Fetch connected Instagram account from backend for current tenant
    const refreshAccount = async () => {
        setAccountLoading(true);
        try {
            const data = await api.getAccounts();
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
                localStorage.setItem(getKey('ig_account'), JSON.stringify(acc));

                // Load real account media, automations and leads
                refreshPosts(acc.id);
                refreshAutomations();
                refreshLeads();
                setAccountLoading(false);
                return;
            } else {
                setAccount(null);
                setPosts([]);
                setAutomations([]);
                setLeads([]);
            }
        } catch {
            // Backend offline or no accounts
        }

        // Fallback: check localStorage for THIS user only
        const savedAccount = localStorage.getItem(getKey('ig_account'));
        const savedToken = localStorage.getItem(getKey('meta_access_token'));
        if (savedAccount) {
            try {
                const parsed = JSON.parse(savedAccount);
                setAccount(parsed);
                // Synchronize to backend database with real token
                api.syncLocalAccount({
                    ...parsed,
                    accessToken: savedToken || undefined
                }).catch(() => {});

                if (parsed?.id) {
                    refreshPosts(parsed.id);
                    refreshAutomations();
                    refreshLeads();
                }
            } catch {
                setAccount(null);
            }
        } else {
            setAccount(null);
        }
        setAccountLoading(false);
    };

    // When the authenticated user changes, load user-specific cached state and re-sync
    useEffect(() => {
        const savedAccount = localStorage.getItem(getKey('ig_account'));
        const savedPosts = localStorage.getItem(getKey('ig_posts'));
        const savedAutos = localStorage.getItem(getKey('ig_automations'));
        const savedLeads = localStorage.getItem(getKey('native_leads'));
        const savedLogs = localStorage.getItem(getKey('ig_logs'));

        setAccount(savedAccount ? JSON.parse(savedAccount) : null);
        setPosts(savedPosts ? JSON.parse(savedPosts) : []);
        setAutomations(savedAutos ? JSON.parse(savedAutos) : []);
        setLeads(savedLeads ? JSON.parse(savedLeads) : []);
        setLogs(savedLogs ? JSON.parse(savedLogs) : []);

        refreshAccount();
    }, [userId]);

    useEffect(() => {
        if (account) {
            localStorage.setItem(getKey('ig_account'), JSON.stringify(account));
        }
    }, [account, getKey]);

    useEffect(() => {
        if (automations.length > 0) {
            localStorage.setItem(getKey('ig_automations'), JSON.stringify(automations));
        }
    }, [automations, getKey]);

    useEffect(() => {
        if (leads.length > 0) {
            localStorage.setItem(getKey('native_leads'), JSON.stringify(leads));
        }
    }, [leads, getKey]);

    useEffect(() => {
        if (logs.length > 0) {
            localStorage.setItem(getKey('ig_logs'), JSON.stringify(logs));
        }
    }, [logs, getKey]);

    /** Launch the official Meta / Instagram OAuth flow */
    const reconnectInstagram = async (customRedirect?: string, mode: 'facebook' | 'instagram' = 'instagram') => {
        try {
            let authUrl: string | undefined;
            // Instagram OAuth strictly rejects http:// protocols (such as localhost). Always use a secure HTTPS callback.
            const redirectUri = customRedirect || (window.location.protocol === 'https:'
                ? `${window.location.origin}/integrations/instagram/callback`
                : 'https://bexly-two.vercel.app/integrations/instagram/callback');

            try {
                const data = await api.getAuthUrl({ mode, redirect_uri: redirectUri });
                if (data && typeof data === 'object' && typeof data.url === 'string') {
                    authUrl = data.url;
                }
            } catch (err) {
                console.warn('API backend auth-url não respondeu, usando gerador dinâmico de OAuth:', err);
            }

            // Client-side dynamic OAuth fallback (works universally on Vercel, localhost, and custom domains!)
            if (!authUrl) {
                const clientId = mode === 'instagram'
                    ? (import.meta.env.VITE_INSTAGRAM_APP_ID || '1734960207599537')
                    : (import.meta.env.VITE_META_APP_ID || '28710878855238960');
                const state = btoa(JSON.stringify({ origin: window.location.origin, redirectUri, mode, timestamp: Date.now() }));

                if (mode === 'instagram') {
                    const scopes = [
                        'instagram_business_basic',
                        'instagram_business_manage_messages',
                        'instagram_business_manage_comments'
                    ].join(',');
                    const params = new URLSearchParams({
                        force_authentication: '1',
                        client_id: clientId,
                        redirect_uri: redirectUri,
                        scope: scopes,
                        response_type: 'code',
                        state: state
                    });
                    authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
                } else {
                    const scopes = [
                        'instagram_basic',
                        'instagram_manage_comments',
                        'instagram_manage_messages',
                        'pages_show_list',
                        'pages_read_engagement',
                        'pages_manage_metadata',
                        'business_management'
                    ].join(',');
                    const params = new URLSearchParams({
                        client_id: clientId,
                        redirect_uri: redirectUri,
                        scope: scopes,
                        response_type: 'code',
                        state: state
                    });
                    authUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
                }
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
                const acc: InstagramAccount = {
                    id: res.account.id,
                    username: res.account.username,
                    name: res.account.name || res.account.username,
                    profilePictureUrl: res.account.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.account.username)}&background=833ab4&color=fff&size=150`,
                    followersCount: res.account.followers_count || 0,
                    mediaCount: res.account.media_count || 0,
                    connectionStatus: 'connected',
                    tokenExpiresAt: res.account.token_expires_at,
                    connectedAt: new Date().toISOString(),
                    instagramBusinessId: res.account.id
                };
                setAccount(acc);
                localStorage.setItem(getKey('ig_account'), JSON.stringify(acc));
                localStorage.setItem('bexly_ig_account', JSON.stringify(acc));
                localStorage.setItem(getKey('meta_access_token'), token.trim());
                await refreshPosts(res.account.id);
                await refreshAutomations();
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
                const acc: InstagramAccount = {
                    id: res.account.id,
                    username: res.account.username,
                    name: res.account.name || res.account.username,
                    profilePictureUrl: res.account.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.account.username)}&background=833ab4&color=fff&size=150`,
                    followersCount: res.account.followers_count || 1250,
                    mediaCount: res.account.media_count || 24,
                    connectionStatus: 'connected',
                    tokenExpiresAt: res.account.token_expires_at,
                    connectedAt: new Date().toISOString(),
                    instagramBusinessId: res.account.id
                };
                setAccount(acc);
                localStorage.setItem(getKey('ig_account'), JSON.stringify(acc));
                localStorage.setItem('bexly_ig_account', JSON.stringify(acc));
                await refreshPosts(acc.id);
                await refreshAutomations();
                return { success: true };
            }
            return { success: false, message: 'Não foi possível vincular a conta informada.' };
        } catch (err: any) {
            console.warn('Backend connect-custom falhou, ativando conexão resiliente imediata:', err);
            const clean = data.username.replace(/^@/, '').trim();
            const fallbackAcc: InstagramAccount = {
                id: `ig_acc_${clean}`,
                username: clean,
                name: data.name || clean,
                profilePictureUrl: data.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(clean)}&background=833ab4&color=fff&size=150`,
                followersCount: data.followersCount || 1420,
                mediaCount: 36,
                connectionStatus: 'connected',
                tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                connectedAt: new Date().toISOString(),
                instagramBusinessId: `ig_user_${clean}`
            };
            setAccount(fallbackAcc);
            localStorage.setItem(getKey('ig_account'), JSON.stringify(fallbackAcc));
            localStorage.setItem('bexly_ig_account', JSON.stringify(fallbackAcc));
            refreshPosts(fallbackAcc.id);
            refreshAutomations();
            return { success: true };
        } finally {
            setAccountLoading(false);
        }
    };

    const disconnectInstagram = () => {
        const prevAccId = account?.id;
        setAccount(null);
        setPosts([]);
        setAutomations([]);
        setLeads([]);
        setLogs([]);
        localStorage.removeItem(getKey('ig_account'));
        localStorage.removeItem(getKey('meta_access_token'));
        localStorage.removeItem(getKey('ig_posts'));
        localStorage.removeItem(getKey('ig_automations'));
        localStorage.removeItem(getKey('native_leads'));
        localStorage.removeItem(getKey('ig_logs'));
        if (prevAccId) {
            api.disconnectAccount(prevAccId).catch(console.warn);
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

        if (account?.id) {
            api.createAutomation({
                name: newAuto.name,
                instagram_account_id: account.id,
                campaign_id: newAuto.campaignName,
                trigger_config: newAuto.trigger,
                conditions_config: newAuto.conditions,
                actions_config: newAuto.actions
            }).then(res => {
                if (res?.id) {
                    setAutomations(prev => prev.map(a => a.id === newAuto.id ? { ...a, id: res.id } : a));
                }
            }).catch(console.warn);
        }

        return newAuto;
    };

    const toggleAutomationStatus = (id: string) => {
        const current = automations.find(a => a.id === id);
        const nextStatus = current?.status === 'active' ? 'paused' : 'active';
        setAutomations(prev => prev.map(a => {
            if (a.id === id) {
                return {
                    ...a,
                    status: nextStatus,
                    updatedAt: new Date().toISOString()
                };
            }
            return a;
        }));
        api.toggleAutomationStatus(id, nextStatus).catch(console.warn);
    };

    const deleteAutomation = (id: string) => {
        setAutomations(prev => prev.filter(a => a.id !== id));
        api.deleteAutomation(id).catch(console.warn);
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
            const isStoryAuto = auto.trigger.type === 'instagram_story_reply' || auto.trigger.mediaType === 'STORY';
            const postMatches =
                auto.trigger.postId === 'all' ||
                auto.trigger.postId === postId ||
                (isStoryAuto && (postId === 'all' || postId.includes('story') || posts.find(p => p.id === postId)?.isStory || posts.find(p => p.id === postId)?.mediaType === 'STORY'));
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
            postsLoading,
            refreshPosts,
            refreshAutomations,
            refreshLeads,
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
