import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from '../config/env';
import {
  HealthStatus,
  User,
  CreatorProfile,
  BrandProfile,
  PortfolioItem,
  CampaignBrief,
  CreativeDirection,
  ReferenceAsset,
} from '../types';

export interface AuthResponse {
  user: User;
  token?: string;
  nextStep?: string;
  redirectTo?: string;
}

export interface ProfileResponse {
  role: 'creator' | 'brand';
  profile: CreatorProfile | BrandProfile;
  completionScore: number;
  isComplete: boolean;
}

export interface UploadResult {
  url: string;
  publicId: string;
  mediaType: 'image' | 'video';
  storageProvider: 'cloudinary' | 'local';
}

export interface MyBriefsResponse {
  data: CampaignBrief[];
  counts: {
    all: number;
    draft: number;
    published: number;
    closed: number;
  };
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: config.apiUrl,
      timeout: 15000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.instance.interceptors.request.use((reqConfig) => {
      const token = localStorage.getItem('kampus_auth_token');
      if (token && reqConfig.headers) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.code === 'ERR_NETWORK' || !error.response) {
          console.warn('⚠️ API Backend is currently unreachable or offline.');
        }
        return Promise.reject(error);
      }
    );
  }

  public async getHealth(): Promise<HealthStatus | null> {
    try {
      const response = await this.instance.get<HealthStatus>('/health');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // Auth Endpoints
  public async signup(data: { email: string; password: string; displayName: string; role: 'creator' | 'brand' }) {
    const res = await this.instance.post<{ success: boolean; data: AuthResponse }>('/v1/auth/signup', data);
    if (res.data.data.token) {
      localStorage.setItem('kampus_auth_token', res.data.data.token);
    }
    return res.data.data;
  }

  public async login(data: { email: string; password: string }) {
    const res = await this.instance.post<{ success: boolean; data: AuthResponse }>('/v1/auth/login', data);
    if (res.data.data.token) {
      localStorage.setItem('kampus_auth_token', res.data.data.token);
    }
    return res.data.data;
  }

  public async logout(): Promise<void> {
    try {
      await this.instance.post('/v1/auth/logout');
    } catch (err) {
      // Ignore
    } finally {
      localStorage.removeItem('kampus_auth_token');
    }
  }

  public async getCurrentUser() {
    const res = await this.instance.get<{ success: boolean; data: { user: User; profile: CreatorProfile | BrandProfile } }>('/v1/auth/me');
    return res.data.data;
  }

  // Profile Endpoints
  public async getMyProfile() {
    const res = await this.instance.get<{ success: boolean; data: ProfileResponse }>('/v1/profiles/me');
    return res.data.data;
  }

  public async updateMyProfile(payload: Record<string, unknown>) {
    const res = await this.instance.patch<{ success: boolean; data: ProfileResponse }>('/v1/profiles/me', payload);
    return res.data.data;
  }

  public async getPublicCreator(idOrHandle: string) {
    const res = await this.instance.get<{ success: boolean; data: CreatorProfile }>(`/v1/profiles/creators/${idOrHandle}`);
    return res.data.data;
  }

  public async getPublicBrand(id: string) {
    const res = await this.instance.get<{ success: boolean; data: BrandProfile }>(`/v1/profiles/brands/${id}`);
    return res.data.data;
  }

  // Portfolio Endpoints
  public async uploadMediaFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await this.instance.post<{ success: boolean; data: UploadResult }>('/v1/portfolio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  }

  public async createPortfolioItem(data: Partial<PortfolioItem>) {
    const res = await this.instance.post<{ success: boolean; data: PortfolioItem }>('/v1/portfolio', data);
    return res.data.data;
  }

  public async getMyPortfolioItems() {
    const res = await this.instance.get<{ success: boolean; data: PortfolioItem[] }>('/v1/portfolio/mine');
    return res.data.data;
  }

  public async getPublicPortfolioItems(creatorId: string) {
    const res = await this.instance.get<{ success: boolean; data: PortfolioItem[] }>(`/v1/portfolio/creator/${creatorId}`);
    return res.data.data;
  }

  public async getPortfolioItemById(id: string) {
    const res = await this.instance.get<{ success: boolean; data: PortfolioItem }>(`/v1/portfolio/${id}`);
    return res.data.data;
  }

  public async updatePortfolioItem(id: string, payload: Partial<PortfolioItem>) {
    const res = await this.instance.patch<{ success: boolean; data: PortfolioItem }>(`/v1/portfolio/${id}`, payload);
    return res.data.data;
  }

  public async deletePortfolioItem(id: string) {
    const res = await this.instance.delete<{ success: boolean; message: string }>(`/v1/portfolio/${id}`);
    return res.data;
  }

  public async toggleFeatureItem(id: string) {
    const res = await this.instance.patch<{ success: boolean; data: PortfolioItem }>(`/v1/portfolio/${id}/feature`);
    return res.data.data;
  }

  // Campaign Brief Endpoints
  public async createBrief(data: Partial<CampaignBrief>) {
    const res = await this.instance.post<{ success: boolean; data: CampaignBrief }>('/v1/briefs', data);
    return res.data.data;
  }

  public async getMyBriefs(status?: string) {
    const query = status ? `?status=${status}` : '';
    const res = await this.instance.get<{ success: boolean; data: CampaignBrief[]; counts: { all: number; draft: number; published: number; closed: number } }>(`/v1/briefs/mine${query}`);
    return res.data;
  }

  public async getPublicBriefs(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await this.instance.get<{ success: boolean; data: CampaignBrief[] }>(`/v1/briefs/public${queryString}`);
    return res.data.data;
  }

  public async getBriefById(id: string) {
    const res = await this.instance.get<{ success: boolean; data: CampaignBrief }>(`/v1/briefs/${id}`);
    return res.data.data;
  }

  public async updateBrief(id: string, payload: Partial<CampaignBrief>) {
    const res = await this.instance.patch<{ success: boolean; data: CampaignBrief }>(`/v1/briefs/${id}`, payload);
    return res.data.data;
  }

  public async publishBrief(id: string) {
    const res = await this.instance.post<{ success: boolean; data: CampaignBrief }>(`/v1/briefs/${id}/publish`);
    return res.data.data;
  }

  public async closeBrief(id: string) {
    const res = await this.instance.post<{ success: boolean; data: CampaignBrief }>(`/v1/briefs/${id}/close`);
    return res.data.data;
  }

  public async deleteBrief(id: string) {
    const res = await this.instance.delete<{ success: boolean; message: string }>(`/v1/briefs/${id}`);
    return res.data;
  }

  public async uploadReferenceAsset(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await this.instance.post<{ success: boolean; data: ReferenceAsset }>('/v1/briefs/upload-reference', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  }

  public async generateAIBrief(payload: { conceptIdea: string; category?: string; targetAudience?: string; budgetAmount?: number }) {
    const res = await this.instance.post<{ success: boolean; data: any }>('/v1/briefs/generate', payload);
    return res.data.data;
  }

  public async generateTimeMachineDirections(payload: { conceptIdea: string; category?: string }) {
    const res = await this.instance.post<{ success: boolean; data: CreativeDirection[] }>('/v1/briefs/time-machine', payload);
    return res.data.data;
  }
}

export const apiClient = new ApiClient();

export const briefApi = {
  createBrief: (data: Partial<CampaignBrief>) => apiClient.createBrief(data),
  getMyBriefs: async (params?: { status?: string; search?: string }) => {
    const res = await apiClient.getMyBriefs(params?.status);
    return { data: { briefs: res.data, counts: res.counts } };
  },
  getPublishedBriefs: async (params?: { category?: string; search?: string }) => {
    const data = await apiClient.getPublicBriefs(params?.category, params?.search);
    return { data: { briefs: data } };
  },
  getBriefById: async (id: string) => {
    const data = await apiClient.getBriefById(id);
    return { data: { brief: data } };
  },
  updateBrief: (id: string, payload: Partial<CampaignBrief>) => apiClient.updateBrief(id, payload),
  publishBrief: async (id: string) => {
    const data = await apiClient.publishBrief(id);
    return { data: { brief: data } };
  },
  closeBrief: async (id: string) => {
    const data = await apiClient.closeBrief(id);
    return { data: { brief: data } };
  },
  reopenBrief: async (id: string) => {
    const data = await apiClient.updateBrief(id, { status: 'published' });
    return { data: { brief: data } };
  },
  deleteBrief: (id: string) => apiClient.deleteBrief(id),
  uploadReferenceAsset: (file: File) => apiClient.uploadReferenceAsset(file),
  generateBrief: async (payload: { campaignIdea: string; category?: string; targetAudience?: string; budgetAmount?: number }) => {
    const data = await apiClient.generateAIBrief({ conceptIdea: payload.campaignIdea, category: payload.category, targetAudience: payload.targetAudience, budgetAmount: payload.budgetAmount });
    return { data: { draft: data } };
  },
  generateTimeMachine: async (payload: { campaignConcept: string; category?: string }) => {
    const data = await apiClient.generateTimeMachineDirections({ conceptIdea: payload.campaignConcept, category: payload.category });
    return { data: { directions: data } };
  }
};

export const matchingApi = {
  getMatchesForBrief: async (briefId: string) => {
    const res = await (apiClient as any).instance.get(`/v1/matching/brief/${briefId}`);
    return res.data.data;
  },
  getMatchesForCreator: async () => {
    const res = await (apiClient as any).instance.get('/v1/matching/me');
    return res.data.data;
  },
};

export const proposalApi = {
  createProposal: async (data: Record<string, unknown>) => {
    const res = await (apiClient as any).instance.post('/v1/proposals', data);
    return res.data.data;
  },
  getMyProposals: async () => {
    const res = await (apiClient as any).instance.get('/v1/proposals/mine');
    return res.data.data;
  },
  getProposalsForBrief: async (briefId: string) => {
    const res = await (apiClient as any).instance.get(`/v1/proposals/brief/${briefId}`);
    return res.data.data;
  },
  getProposalById: async (id: string) => {
    const res = await (apiClient as any).instance.get(`/v1/proposals/${id}`);
    return res.data.data;
  },
  acceptProposal: async (id: string) => {
    const res = await (apiClient as any).instance.post(`/v1/proposals/${id}/accept`);
    return res.data.data;
  },
  rejectProposal: async (id: string, decisionReason?: string) => {
    const res = await (apiClient as any).instance.post(`/v1/proposals/${id}/reject`, { decisionReason });
    return res.data.data;
  },
  withdrawProposal: async (id: string) => {
    const res = await (apiClient as any).instance.post(`/v1/proposals/${id}/withdraw`);
    return res.data.data;
  },
};

export const projectApi = {
  getMyProjects: async () => {
    const res = await (apiClient as any).instance.get('/v1/projects/mine');
    return res.data.data;
  },
  getProjectById: async (id: string) => {
    const res = await (apiClient as any).instance.get(`/v1/projects/${id}`);
    return res.data.data;
  },
  submitMilestoneWork: async (id: string, milestoneId: string, payload: { submissionNotes?: string; submissionMediaUrl?: string }) => {
    const res = await (apiClient as any).instance.post(`/v1/projects/${id}/milestones/${milestoneId}/submit`, payload);
    return res.data.data;
  },
  reviewMilestoneWork: async (id: string, milestoneId: string, payload: { action: 'approve' | 'request_revision'; reviewNotes?: string }) => {
    const res = await (apiClient as any).instance.post(`/v1/projects/${id}/milestones/${milestoneId}/review`, payload);
    return res.data.data;
  },
  fundMilestone: async (id: string, milestoneId: string, payload: { amount: number; currency?: string }) => {
    const res = await (apiClient as any).instance.post(`/v1/projects/${id}/milestones/${milestoneId}/fund`, payload);
    return res.data.data;
  },
  releaseMilestone: async (id: string, milestoneId: string) => {
    const res = await (apiClient as any).instance.post(`/v1/projects/${id}/milestones/${milestoneId}/release`);
    return res.data.data;
  },
};

export const messagingApi = {
  getMyConversations: async () => {
    const res = await (apiClient as any).instance.get('/v1/conversations');
    return res.data.data;
  },
  getConversationByProject: async (projectId: string) => {
    const res = await (apiClient as any).instance.get(`/v1/conversations/project/${projectId}`);
    return res.data.data;
  },
  getMessages: async (conversationId: string) => {
    const res = await (apiClient as any).instance.get(`/v1/conversations/${conversationId}/messages`);
    return res.data.data;
  },
  sendMessage: async (conversationId: string, payload: { text: string; attachmentUrl?: string }) => {
    const res = await (apiClient as any).instance.post(`/v1/conversations/${conversationId}/messages`, payload);
    return res.data.data;
  },
};

export const notificationApi = {
  getMyNotifications: async () => {
    const res = await (apiClient as any).instance.get('/v1/notifications');
    return res.data.data;
  },
  markAsRead: async (id: string) => {
    const res = await (apiClient as any).instance.patch(`/v1/notifications/${id}/read`);
    return res.data;
  },
};

export const disputeApi = {
  createDispute: async (projectId: string, payload: { category?: string; title: string; description: string; requestedResolution: string; milestoneId?: string }) => {
    const res = await (apiClient as any).instance.post(`/v1/projects/${projectId}/disputes`, payload);
    return res.data.data;
  },
  getMyDisputes: async () => {
    const res = await (apiClient as any).instance.get('/v1/disputes/mine');
    return res.data.data;
  },
  getDisputeById: async (id: string) => {
    const res = await (apiClient as any).instance.get(`/v1/disputes/${id}`);
    return res.data.data;
  },
  addResponse: async (id: string, text: string) => {
    const res = await (apiClient as any).instance.post(`/v1/disputes/${id}/respond`, { text });
    return res.data.data;
  },
  submitEvidence: async (id: string, payload: { title: string; description?: string; mediaUrl?: string }) => {
    const res = await (apiClient as any).instance.post(`/v1/disputes/${id}/evidence`, payload);
    return res.data.data;
  },
  proposeSettlement: async (id: string, terms: string) => {
    const res = await (apiClient as any).instance.post(`/v1/disputes/${id}/propose-resolution`, { terms });
    return res.data.data;
  },
  acknowledgeResolution: async (id: string, payload: { accept: boolean; responseNotes?: string }) => {
    const res = await (apiClient as any).instance.post(`/v1/disputes/${id}/acknowledge-resolution`, payload);
    return res.data.data;
  },
  escalate: async (id: string, reason?: string) => {
    const res = await (apiClient as any).instance.post(`/v1/disputes/${id}/escalate`, { reason });
    return res.data.data;
  },
  reopen: async (id: string, reason?: string) => {
    const res = await (apiClient as any).instance.post(`/v1/disputes/${id}/reopen`, { reason });
    return res.data.data;
  },
};

export const callSessionApi = {
  getConversationCalls: async (conversationId: string) => {
    const res = await (apiClient as any).instance.get(`/v1/conversations/${conversationId}/calls`);
    return res.data.data;
  },
  getProjectCalls: async (projectId: string) => {
    const res = await (apiClient as any).instance.get(`/v1/projects/${projectId}/calls`);
    return res.data.data;
  },
};

export const passportApi = {
  getMyPassport: async () => {
    const res = await (apiClient as any).instance.get('/v1/passport/me');
    return res.data.data;
  },
  reanalyzePassport: async () => {
    const res = await (apiClient as any).instance.post('/v1/passport/reanalyze');
    return res.data.data;
  },
  getCreatorPassport: async (creatorId: string) => {
    const res = await (apiClient as any).instance.get(`/v1/passport/creator/${creatorId}`);
    return res.data.data;
  },
};

export const proofApi = {
  submitProof: async (itemId: string, payload: { contributionDescription: string; projectRole?: string; evidenceType?: string; evidenceUrls?: string[] }) => {
    const res = await (apiClient as any).instance.post(`/v1/portfolio/${itemId}/proof`, payload);
    return res.data.data;
  },
  getProofByItem: async (itemId: string) => {
    const res = await (apiClient as any).instance.get(`/v1/portfolio/${itemId}/proof`);
    return res.data.data;
  },
  getAdminPendingProofs: async () => {
    const res = await (apiClient as any).instance.get('/v1/admin/proofs');
    return res.data.data;
  },
  reviewProof: async (id: string, payload: { status: string; reviewerNotes?: string }) => {
    const res = await (apiClient as any).instance.post(`/v1/admin/proofs/${id}/review`, payload);
    return res.data.data;
  },
};

export const availabilityApi = {
  getMyAvailability: async () => {
    const res = await (apiClient as any).instance.get('/v1/availability/me');
    return res.data.data;
  },
  updateMyAvailability: async (payload: { isAcceptingInquiries?: boolean; weeklyCapacityHours?: number; timezone?: string; blockedDates?: string[] }) => {
    const res = await (apiClient as any).instance.patch('/v1/availability/me', payload);
    return res.data.data;
  },
  getCreatorAvailability: async (creatorId: string) => {
    const res = await (apiClient as any).instance.get(`/v1/availability/creators/${creatorId}`);
    return res.data.data;
  },
  sendBookingInquiry: async (payload: { creatorUserId: string; projectTitle: string; startDate: string; endDate: string; offeredBudget?: number; currency?: string; notes?: string }) => {
    const res = await (apiClient as any).instance.post('/v1/availability/requests', payload);
    return res.data.data;
  },
  respondToInquiry: async (id: string, action: 'accept' | 'decline' | 'cancel') => {
    const res = await (apiClient as any).instance.post(`/v1/availability/requests/${id}/respond`, { action });
    return res.data.data;
  },
};

export const shortlistApi = {
  getMyShortlists: async () => {
    const res = await (apiClient as any).instance.get('/v1/shortlists/mine');
    return res.data.data;
  },
  createShortlist: async (payload: { name: string; campaignBriefId?: string; notes?: string }) => {
    const res = await (apiClient as any).instance.post('/v1/shortlists', payload);
    return res.data.data;
  },
  addCreator: async (id: string, creatorUserId: string) => {
    const res = await (apiClient as any).instance.post(`/v1/shortlists/${id}/creators`, { creatorUserId });
    return res.data.data;
  },
  removeCreator: async (id: string, creatorUserId: string) => {
    const res = await (apiClient as any).instance.delete(`/v1/shortlists/${id}/creators/${creatorUserId}`);
    return res.data.data;
  },
};

export const licensingApi = {
  analyzeBrief: async (briefId: string) => {
    const res = await (apiClient as any).instance.post('/v1/licensing/analyze-brief', { briefId });
    return res.data.data;
  },
  analyzeProposal: async (proposalId: string) => {
    const res = await (apiClient as any).instance.post('/v1/licensing/analyze-proposal', { proposalId });
    return res.data.data;
  },
  analyzeProject: async (projectId: string) => {
    const res = await (apiClient as any).instance.post('/v1/licensing/analyze-project', { projectId });
    return res.data.data;
  },
};

export const paymentApi = {
  createOrder: async (payload: { projectId: string; milestoneId: string; idempotencyKey?: string }) => {
    const res = await (apiClient as any).instance.post('/v1/payments/create-order', payload);
    return res.data.data;
  },
  verifyPayment: async (payload: { paymentId: string; providerPaymentId?: string; providerSignature?: string }) => {
    const res = await (apiClient as any).instance.post('/v1/payments/verify', payload);
    return res.data.data;
  },
  getMyPayments: async () => {
    const res = await (apiClient as any).instance.get('/v1/payments/mine');
    return res.data.data;
  },
  refundPayment: async (paymentId: string, reason?: string) => {
    const res = await (apiClient as any).instance.post(`/v1/payments/${paymentId}/refund`, { reason });
    return res.data.data;
  },
};

export const adminApi = {
  getDashboardMetrics: async () => {
    const res = await (apiClient as any).instance.get('/v1/admin/dashboard');
    return res.data.data;
  },
  getUsersList: async () => {
    const res = await (apiClient as any).instance.get('/v1/admin/users');
    return res.data.data;
  },
  updateUserStatus: async (userId: string, payload: { status: string; reason?: string }) => {
    const res = await (apiClient as any).instance.patch(`/v1/admin/users/${userId}/status`, payload);
    return res.data.data;
  },
  triggerReconciliation: async () => {
    const res = await (apiClient as any).instance.post('/v1/admin/reconcile/run');
    return res.data.data;
  },
};



