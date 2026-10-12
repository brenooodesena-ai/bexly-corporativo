// Types and interfaces for Bexly's Native Instagram Automation & Lead Engine

export type InstagramConnectionStatus = 'connected' | 'disconnected' | 'token_expired' | 'error';

export interface InstagramAccount {
    id: string;
    username: string;
    name: string;
    profilePictureUrl: string;
    followersCount: number;
    mediaCount: number;
    connectionStatus: InstagramConnectionStatus;
    tokenExpiresAt: string;
    connectedAt: string;
    instagramBusinessId: string;
}

export interface InstagramPost {
    id: string;
    caption: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL';
    mediaUrl: string;
    permalink: string;
    timestamp: string;
    commentsCount: number;
    likeCount: number;
}

export type KeywordMatchType = 'exact' | 'contains';

export interface AutomationTrigger {
    type: 'instagram_comment';
    postId: string; // 'all' or specific post id
    postTitle?: string;
}

export interface AutomationCondition {
    field: 'comment_text';
    operator: KeywordMatchType;
    keyword: string;
    caseSensitive: boolean;
}

export interface AutomationAction {
    type: 'send_instagram_dm';
    messageTemplate: string;
    ctaButton?: {
        text: string;
        url: string;
    };
    publicCommentReply?: {
        enabled: boolean;
        replyTemplates: string[];
    };
}

export interface Automation {
    id: string;
    organizationId: string;
    name: string;
    campaignName: string;
    status: 'active' | 'paused';
    trigger: AutomationTrigger;
    conditions: AutomationCondition[];
    actions: AutomationAction[];
    createdAt: string;
    updatedAt: string;
    metrics: {
        commentsDetected: number;
        keywordMatches: number;
        dmsSent: number;
        leadsGenerated: number;
        conversionRate: number; // percentage
        attributedRevenue?: number;
    };
}

export type LeadStatus = 'Novo' | 'Contatado' | 'Qualificado' | 'Oportunidade' | 'Cliente' | 'Perdido';

export interface LeadInteraction {
    id: string;
    timestamp: string;
    type: 'comment_detected' | 'dm_sent' | 'reply_received' | 'link_clicked' | 'status_change' | 'sale_completed';
    title: string;
    description: string;
    metadata?: {
        postId?: string;
        postTitle?: string;
        keyword?: string;
        automationId?: string;
        messageSent?: string;
        amount?: number;
    };
}

export interface NativeLead {
    id: string;
    organizationId: string;
    name: string;
    instagramUsername: string;
    instagramUserId: string;
    profilePicUrl?: string;
    status: LeadStatus;
    tags: string[];
    originPlatform: 'instagram';
    sourcePostId: string;
    sourcePostTitle: string;
    campaign: string;
    triggerKeyword: string;
    automationId: string;
    firstInteractionAt: string;
    lastInteractionAt: string;
    interactionCount: number;
    timeline: LeadInteraction[];
    notes?: string;
    attributedValue?: number;
}

export interface AutomationRunLog {
    id: string;
    timestamp: string;
    automationId: string;
    automationName: string;
    instagramUsername: string;
    commentText: string;
    matchedKeyword: string;
    status: 'Executado' | 'Ignorado' | 'Falhou' | 'Bloqueado por limitação da API';
    dmMessage: string;
    leadId: string;
    idempotencyKey: string;
    errorReason?: string;
}
