export type UserRole = 'creator' | 'brand';

export interface User {
  _id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'pending';
  isVerified: boolean;
  isProfileComplete: boolean;
  authProvider: 'local' | 'google';
  creatorProfile?: string;
  brandProfile?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptime: string;
  environment: string;
  server: {
    status: string;
  };
  database: {
    connected: boolean;
    status: string;
    host?: string;
    databaseName?: string;
  };
}

export interface PortfolioItem {
  _id: string;
  userId: string;
  creatorId: string;
  title: string;
  description?: string;
  category: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  tags: string[];
  toolsUsed: string[];
  projectRole: string;
  clientContext?: string;
  completionDate?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  duration?: number;
  aiInvolvement: 'Full Generative' | 'Hybrid AI-VFX' | 'AI Assisted';
  workflowDescription?: string;
  commercialLicensing: 'Commercial Buyout' | 'Personal Non-Commercial' | 'Exclusive Rights';
  visibility: 'public' | 'private' | 'draft';
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverableItem {
  description: string;
  mediaType: 'image' | 'video';
  quantity: number;
  aspectRatio: string;
  resolution: string;
  duration?: number;
  fileFormats: string[];
  sourceFilesRequired: boolean;
}

export interface ReferenceAsset {
  url: string;
  publicId: string;
  mediaType: 'image' | 'video';
  originalName: string;
  size: number;
  uploadedAt: string;
}

export interface CreativeDirection {
  id?: string;
  directionName: string;
  concept: string;
  mood: string;
  palette: string[];
  composition: string;
  lighting: string;
  visualTreatment: string;
  mediaFormat: string;
  audienceImpact: string;
  constraints?: string;
}

export interface CampaignBrief {
  _id: string;
  userId: string;
  brandId: string | BrandProfile;
  title: string;
  summary: string;
  objective: string;
  description: string;
  targetAudience: string;
  category: string;
  distributionPlatforms: string[];
  brandPersonality: string;
  desiredOutcome: string;
  visualStyle: string;
  mood: string;
  colorPreferences: string[];
  lighting: string;
  subjectInfo: string;
  requiredElements: string[];
  excludedElements: string[];
  inspirationLinks: string[];
  selectedDirection?: CreativeDirection;
  referenceAssets: ReferenceAsset[];
  deliverables: DeliverableItem[];
  budget: {
    amount: number;
    currency: string;
    flexibility: 'Fixed' | 'Negotiable' | 'Range';
  };
  deadline?: string;
  milestones: string[];
  revisionLimit: number;
  acceptanceCriteria: string[];
  licensingPreferences: string;
  exclusivity: boolean;
  attribution: boolean;
  status: 'draft' | 'published' | 'closed' | 'archived';
  publishedAt?: string;
  closedAt?: string;
  version: number;
  aiMetadata?: {
    isAiGenerated: boolean;
    isFallback: boolean;
    provider?: string;
    generatedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatorProfile {
  _id?: string;
  id?: string;
  userId?: string;
  name: string;
  handle: string;
  email?: string;
  role: 'creator';
  avatarUrl?: string;
  bio?: string;
  specialty?: string;
  specialtyCategory?: string;
  specialties?: string[];
  aiTools: string[];
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  portfolioIntro?: string;
  portfolioUrls?: string[];
  portfolioSamples: Array<{
    id: string;
    title: string;
    imageUrl: string;
    category: string;
  }>;
  hourlyRate: string;
  availability?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Unavailable';
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    artstation?: string;
    github?: string;
  };
  matchScore?: number;
  matchReasons?: string[];
  rating: number;
  completedCampaigns: number;
  verified: boolean;
  isPublic?: boolean;
  isDemo?: boolean;
}

export interface BrandProfile {
  _id?: string;
  id?: string;
  userId?: string;
  companyName: string;
  industry: string;
  email: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  targetAudience?: string;
  brandPersonality?: string;
  preferredVisualStyles?: string[];
  primaryBrandColors?: string[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
  };
  typicalCampaignBudget?: string;
  role: 'brand';
  verified: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface MatchComponent {
  dimension: string;
  score: number;
  weight: number;
  weightedScore: number;
  reason: string;
  coverage: number;
}

export interface CreatorMatchResult {
  briefId: string;
  creatorUserId: string;
  creatorProfileId: string;
  overallScore: number;
  dataCoverage: number;
  algorithmVersion: string;
  components: MatchComponent[];
  positiveEvidence: string[];
  mismatchesAndGaps: string[];
  missingInformation: string[];
}

export interface ProposalMilestone {
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
}

export interface Proposal {
  _id: string;
  briefId: string | CampaignBrief;
  creatorUserId: string;
  creatorProfileId: string | CreatorProfile;
  brandUserId: string;
  brandProfileId: string | BrandProfile;
  title: string;
  coverMessage: string;
  proposedApproach?: string;
  relevantPortfolioItemIds?: PortfolioItem[];
  deliverables: Array<{
    description: string;
    mediaType: string;
    quantity: number;
    format?: string;
  }>;
  proposedBudget: number;
  currency: string;
  proposedTimeline: string;
  milestones: ProposalMilestone[];
  revisionTerms?: string;
  licensingAcknowledgement: boolean;
  status: 'draft' | 'submitted' | 'revision_requested' | 'resubmitted' | 'accepted' | 'rejected' | 'withdrawn';
  revisionRequestMessage?: string;
  decisionReason?: string;
  submittedAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  _id: string;
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
  sequence: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'revision_requested' | 'approved' | 'cancelled';
  submissionNotes?: string;
  submissionMediaUrl?: string;
  submittedAt?: string;
  reviewNotes?: string;
  revisionCount: number;
  reviewedAt?: string;
  paymentState: 'unfunded' | 'funded_simulated' | 'funded_verified' | 'released_simulated' | 'released_verified';
}

export interface Project {
  _id: string;
  briefId: string | CampaignBrief;
  proposalId: string;
  brandUserId: string;
  brandProfileId: string | BrandProfile;
  creatorUserId: string;
  creatorProfileId: string | CreatorProfile;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  licensingTerms: string;
  revisionLimit: number;
  status: 'awaiting_funding' | 'ready' | 'in_progress' | 'in_review' | 'revision_requested' | 'completed' | 'cancelled' | 'disputed';
  milestones: ProjectMilestone[];
  agreementSnapshot: {
    briefTitle: string;
    proposalTitle: string;
    acceptedAt: string;
    acceptedBudget: number;
    currency: string;
  };
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialLedgerEntry {
  _id: string;
  projectId: string;
  milestoneId?: string;
  eventType: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
  verificationStatus: 'simulated' | 'verified' | 'pending' | 'failed';
  isSimulation: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  projectId: string | Project;
  briefId: string | CampaignBrief;
  participants: Array<{
    _id: string;
    displayName: string;
    role: string;
    avatarUrl?: string;
  }>;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCountBrand: number;
  unreadCountCreator: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageItem {
  _id: string;
  conversationId: string;
  projectId: string;
  senderUserId: string;
  recipientUserId: string;
  text: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipientUserId: string;
  senderUserId?: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
}

