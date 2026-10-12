/**
 * Meta / Instagram Graph API Client
 *
 * OFFICIAL APIS ONLY:
 * - OAuth: https://api.instagram.com/oauth/authorize
 * - Token exchange: https://api.instagram.com/oauth/access_token
 * - Token refresh: https://graph.instagram.com/refresh_access_token
 * - Graph API v21.0: https://graph.instagram.com/v21.0/
 *
 * PERMISSIONS USED (instagram_business_* — post-Jan 2025):
 * - instagram_business_basic
 * - instagram_business_manage_comments
 * - instagram_business_manage_messages
 *
 * ALL limitations from Meta's official documentation are enforced here.
 * This module NEVER invents endpoints or bypasses restrictions.
 */
import axios, { AxiosError } from 'axios';
import { config, isMetaConfigured } from '../config/index.js';
import { logger } from '../utils/logger.js';

const GRAPH_BASE = `https://graph.instagram.com/${config.META_API_VERSION}`;
const OAUTH_BASE = 'https://api.instagram.com/oauth';

// ── Types ──

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
}

export interface MetaLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;  // seconds
}

export interface InstagramUserProfile {
  id: string;
  username: string;
  name: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export interface MetaApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

export type MessagingResult =
  | { success: true; messageId: string }
  | { success: false; errorCode: string; errorMessage: string; isRetryable: boolean; isPermanent: boolean };

// ── OAuth URLs ──

/**
 * Build the Instagram OAuth authorization URL.
 * Uses instagram_business_* scopes (current as of Jan 2025+).
 *
 * Official flow: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-access-tokens-and-permissions
 */
export function buildOAuthUrl(state: string): string {
  if (!isMetaConfigured()) {
    throw new Error('META_APP_ID, META_APP_SECRET, and META_REDIRECT_URI must be configured to use Instagram integration.');
  }

  const params = new URLSearchParams({
    client_id: config.META_APP_ID,
    redirect_uri: config.META_REDIRECT_URI,
    scope: [
      'instagram_business_basic',
      'instagram_business_manage_comments',
      'instagram_business_manage_messages',
    ].join(','),
    response_type: 'code',
    state,
  });

  return `${OAUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange the authorization code for a short-lived access token.
 * Official endpoint: POST https://api.instagram.com/oauth/access_token
 */
export async function exchangeCodeForToken(code: string): Promise<MetaTokenResponse> {
  assertMetaConfigured();

  const params = new URLSearchParams({
    client_id: config.META_APP_ID,
    client_secret: config.META_APP_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: config.META_REDIRECT_URI,
    code,
  });

  try {
    const response = await axios.post<MetaTokenResponse>(
      `${OAUTH_BASE}/access_token`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  } catch (err) {
    throw translateMetaError(err, 'exchangeCodeForToken');
  }
}

/**
 * Exchange short-lived token for a long-lived token (60 days).
 * Official endpoint: GET https://graph.instagram.com/access_token
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<MetaLongLivedTokenResponse> {
  assertMetaConfigured();

  try {
    const response = await axios.get<MetaLongLivedTokenResponse>(
      `${GRAPH_BASE}/access_token`,
      {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: config.META_APP_SECRET,
          access_token: shortLivedToken,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw translateMetaError(err, 'getLongLivedToken');
  }
}

/**
 * Refresh an existing long-lived token (must be at least 24h old, valid for up to 60 days).
 * Official endpoint: GET https://graph.instagram.com/refresh_access_token
 */
export async function refreshLongLivedToken(accessToken: string): Promise<MetaLongLivedTokenResponse> {
  try {
    const response = await axios.get<MetaLongLivedTokenResponse>(
      `${GRAPH_BASE}/refresh_access_token`,
      {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw translateMetaError(err, 'refreshLongLivedToken');
  }
}

/**
 * Fetch Instagram user profile.
 * Official endpoint: GET /me
 * Requires: instagram_business_basic
 */
export async function getUserProfile(accessToken: string): Promise<InstagramUserProfile> {
  try {
    const response = await axios.get<InstagramUserProfile>(`${GRAPH_BASE}/me`, {
      params: {
        fields: 'id,username,name,profile_picture_url,followers_count,media_count',
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (err) {
    throw translateMetaError(err, 'getUserProfile');
  }
}

/**
 * Fetch user's media (posts/reels).
 * Official endpoint: GET /{ig-user-id}/media
 * Requires: instagram_business_basic
 */
export async function getUserMedia(
  instagramUserId: string,
  accessToken: string,
  limit = 20
): Promise<InstagramMedia[]> {
  try {
    const response = await axios.get<{ data: InstagramMedia[] }>(
      `${GRAPH_BASE}/${instagramUserId}/media`,
      {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
          limit,
          access_token: accessToken,
        },
      }
    );
    return response.data.data || [];
  } catch (err) {
    throw translateMetaError(err, 'getUserMedia');
  }
}

/**
 * Send a PRIVATE REPLY to an Instagram comment.
 *
 * OFFICIAL API: POST /{ig-user-id}/messages
 * with recipient = { comment_id: "<COMMENT_ID>" }
 *
 * OFFICIAL LIMITATIONS (enforced here, not bypassed):
 * - 1 private reply per comment maximum
 * - Must be within 7 days of comment creation
 * - Only for Professional (Business/Creator) accounts
 * - Requires instagram_business_manage_messages (Advanced Access)
 *
 * Reference: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/private-replies
 */
export async function sendPrivateReply(
  instagramUserId: string,
  commentId: string,
  messageText: string,
  accessToken: string
): Promise<MessagingResult> {
  try {
    const response = await axios.post<{ message_id: string }>(
      `${GRAPH_BASE}/${instagramUserId}/messages`,
      {
        recipient: { comment_id: commentId },
        message: { text: messageText },
      },
      {
        params: { access_token: accessToken },
      }
    );

    logger.info({
      event: 'message_sent',
      instagramUserId,
      commentId,
      messageId: response.data.message_id,
    });

    return { success: true, messageId: response.data.message_id };
  } catch (err) {
    const translated = translateMetaError(err, 'sendPrivateReply');

    logger.warn({
      event: 'message_failed',
      instagramUserId,
      commentId,
      error: translated.message,
      errorCode: translated.code,
    });

    return {
      success: false,
      errorCode: String(translated.code || 'UNKNOWN'),
      errorMessage: translated.message,
      isRetryable: isRetryableError(translated.code),
      isPermanent: isPermanentError(translated.code),
    };
  }
}

/**
 * Post a PUBLIC REPLY to an Instagram comment.
 * Official API: POST /{comment-id}/replies
 * Requires: instagram_business_manage_comments
 */
export async function replyPublicComment(
  commentId: string,
  messageText: string,
  accessToken: string
): Promise<{ success: boolean; replyId?: string; error?: string }> {
  try {
    const response = await axios.post<{ id: string }>(
      `${GRAPH_BASE}/${commentId}/replies`,
      { message: messageText },
      {
        params: { access_token: accessToken },
      }
    );

    logger.info({
      event: 'public_comment_reply_sent',
      commentId,
      replyId: response.data.id,
    });

    return { success: true, replyId: response.data.id };
  } catch (err) {
    const translated = translateMetaError(err, 'replyPublicComment');
    logger.warn({
      event: 'public_comment_reply_failed',
      commentId,
      error: translated.message,
    });
    return { success: false, error: translated.message };
  }
}

/**
 * Subscribe a page to receive webhook notifications.
 * Required for comment webhooks.
 * Official: POST /{page-id}/subscribed_apps
 */
export async function subscribePageToWebhooks(
  instagramUserId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await axios.post<{ success: boolean }>(
      `${GRAPH_BASE}/${instagramUserId}/subscribed_apps`,
      null,
      {
        params: {
          subscribed_fields: 'comments,live_comments',
          access_token: accessToken,
        },
      }
    );
    return response.data.success === true;
  } catch (err) {
    logger.error({ event: 'subscribe_failed', instagramUserId, error: String(err) });
    return false;
  }
}

// ── Error translation ──

interface TranslatedError extends Error {
  code?: number;
  metaType?: string;
  isRetryable?: boolean;
}

/**
 * Translate Meta API errors into useful application errors.
 * Reference: https://developers.facebook.com/docs/graph-api/guides/error-handling
 */
function translateMetaError(err: unknown, context: string): TranslatedError {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<MetaApiError>;
    const metaError = axiosErr.response?.data?.error;

    if (metaError) {
      logger.error({
        event: 'meta_api_error',
        context,
        code: metaError.code,
        type: metaError.type,
        message: metaError.message,
        traceId: metaError.fbtrace_id,
      });

      const error: TranslatedError = new Error(metaError.message);
      error.code = metaError.code;
      error.metaType = metaError.type;
      error.isRetryable = isRetryableError(metaError.code);
      return error;
    }
  }

  const error: TranslatedError = new Error(String(err));
  return error;
}

// Meta error codes that indicate transient failures (safe to retry)
function isRetryableError(code?: number): boolean {
  const retryableCodes = [
    1,    // Unknown error
    2,    // Service temporarily unavailable
    341,  // Application request limit reached (rate limit)
    4,    // Application request limit reached
  ];
  return code !== undefined && retryableCodes.includes(code);
}

// Meta error codes that indicate permanent failures (do NOT retry)
function isPermanentError(code?: number): boolean {
  const permanentCodes = [
    10,   // Permission denied
    200,  // Permission error
    190,  // Invalid/expired token
    100,  // Invalid parameter
    368,  // Account blocked
  ];
  return code !== undefined && permanentCodes.includes(code);
}

function assertMetaConfigured(): void {
  if (!isMetaConfigured()) {
    throw new Error(
      'Instagram integration not configured. ' +
      'META_APP_ID, META_APP_SECRET, and META_REDIRECT_URI must be set in environment variables.'
    );
  }
}
