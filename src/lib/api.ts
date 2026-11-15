/**
 * Bexly Client API
 * Connects frontend with the Node.js / Express backend (port 3001)
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Dynamic Interceptor: Automatically attaches authenticated user & organization identity
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const currentSessionStr = localStorage.getItem('bexly_current_user');
    if (currentSessionStr) {
      try {
        const parsed = JSON.parse(currentSessionStr);
        if (parsed.id) {
          config.headers['x-user-id'] = parsed.id;
        }
        if (parsed.email) {
          config.headers['x-user-email'] = parsed.email;
        }
        if (parsed.organization_id) {
          config.headers['x-organization-id'] = parsed.organization_id;
        }
      } catch {
        // Ignored
      }
    }
  }
  return config;
});

export const api = {
  // Health
  async getHealth() {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Instagram
  async getAuthUrl(params?: { mode?: 'facebook' | 'instagram'; redirect_uri?: string }) {
    const res = await apiClient.get('/instagram/auth-url', { params });
    return res.data;
  },

  async handleCallback(code: string, state?: string) {
    const res = await apiClient.post('/instagram/callback', { code, state });
    return res.data;
  },

  async connectToken(token: string) {
    const res = await apiClient.post('/instagram/connect-token', { token });
    return res.data;
  },

  async connectCustom(data: { username: string; name?: string; profilePictureUrl?: string; followersCount?: number }) {
    const res = await apiClient.post('/instagram/connect-custom', data);
    return res.data;
  },

  async syncLocalAccount(data: any) {
    const res = await apiClient.post('/instagram/sync-local-account', data);
    return res.data;
  },

  async getAccounts() {
    const res = await apiClient.get('/instagram/accounts');
    return res.data;
  },

  async getAccountMedia(accountId: string) {
    const res = await apiClient.get(`/instagram/accounts/${accountId}/media`);
    return res.data;
  },

  async testAccountConnection(accountId: string) {
    const res = await apiClient.post(`/instagram/accounts/${accountId}/test`);
    return res.data;
  },

  async disconnectAccount(accountId: string) {
    const res = await apiClient.delete(`/instagram/accounts/${accountId}`);
    return res.data;
  },

  // Automations
  async getAutomations() {
    const res = await apiClient.get('/automations');
    return res.data;
  },

  async getAutomation(id: string) {
    const res = await apiClient.get(`/automations/${id}`);
    return res.data;
  },

  async createAutomation(data: any) {
    const res = await apiClient.post('/automations', data);
    return res.data;
  },

  async updateAutomation(id: string, data: any) {
    const res = await apiClient.put(`/automations/${id}`, data);
    return res.data;
  },

  async toggleAutomationStatus(id: string, status: 'active' | 'paused' | 'archived') {
    const res = await apiClient.patch(`/automations/${id}/status`, { status });
    return res.data;
  },

  async deleteAutomation(id: string) {
    const res = await apiClient.delete(`/automations/${id}`);
    return res.data;
  },

  async testTrigger(data: {
    instagram_account_id: string;
    post_id?: string;
    comment_text: string;
    commenter_username?: string;
  }) {
    const res = await apiClient.post('/automations/test-trigger', data);
    return res.data;
  },

  // Leads
  async getLeads(params?: { status?: string; search?: string; limit?: number; offset?: number }) {
    const res = await apiClient.get('/leads', { params });
    return res.data;
  },

  async getLeadsStats() {
    const res = await apiClient.get('/leads/stats');
    return res.data;
  },

  async getLead(id: string) {
    const res = await apiClient.get(`/leads/${id}`);
    return res.data;
  },

  async updateLeadStatus(id: string, status: string) {
    const res = await apiClient.patch(`/leads/${id}/status`, { status });
    return res.data;
  },

  async addLeadTag(id: string, tag: string) {
    const res = await apiClient.post(`/leads/${id}/tags`, { tag });
    return res.data;
  },

  // Auth & Multi-Tenancy (Bexly Database sync)
  async syncUser(userData: { id: string; email: string; name?: string }) {
    const res = await apiClient.post('/auth/sync-user', userData);
    return res.data;
  },

  async getCurrentUser() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  async getAdminUsers() {
    const res = await apiClient.get('/auth/admin/users');
    return res.data;
  },
};
