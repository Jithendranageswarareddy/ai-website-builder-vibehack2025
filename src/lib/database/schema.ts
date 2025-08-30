import { z } from 'zod';

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3).max(20),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  avatar: z.string().url().optional(),
  role: z.enum(['user', 'admin', 'premium']),
  subscription: z.enum(['free', 'pro', 'enterprise']),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
  isEmailVerified: z.boolean(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    notifications: z.boolean(),
    autoSave: z.boolean(),
    defaultView: z.enum(['canvas', 'preview', 'collaboration'])
  }).optional()
});

// Website/Project Schema
export const WebsiteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  slug: z.string().min(1).max(50),
  domain: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  components: z.array(z.object({
    id: z.string(),
    type: z.string(),
    content: z.string(),
    style: z.record(z.any()),
    position: z.object({
      x: z.number(),
      y: z.number()
    })
  })),
  seoData: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional()
  }).optional(),
  analytics: z.object({
    views: z.number(),
    uniqueVisitors: z.number(),
    lastVisited: z.date().optional()
  }).optional(),
  isPublic: z.boolean(),
  templateId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional()
});

// Collaboration Schema
export const CollaborationSchema = z.object({
  id: z.string(),
  websiteId: z.string(),
  userId: z.string(),
  role: z.enum(['owner', 'editor', 'viewer']),
  permissions: z.array(z.enum(['read', 'write', 'delete', 'share', 'admin'])),
  invitedBy: z.string(),
  invitedAt: z.date(),
  acceptedAt: z.date().optional(),
  status: z.enum(['pending', 'accepted', 'declined', 'revoked'])
});

// Analytics Log Schema
export const AnalyticsLogSchema = z.object({
  id: z.string(),
  websiteId: z.string(),
  userId: z.string().optional(),
  event: z.enum(['page_view', 'component_add', 'component_edit', 'component_delete', 'publish', 'share']),
  data: z.record(z.any()),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  timestamp: z.date()
});

// Template Schema
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['business', 'portfolio', 'ecommerce', 'blog', 'landing', 'personal']),
  tags: z.array(z.string()),
  preview: z.string().url(),
  isPremium: z.boolean(),
  rating: z.number().min(0).max(5),
  downloads: z.number(),
  components: z.array(z.object({
    type: z.string(),
    props: z.record(z.any())
  })),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Export types
export type User = z.infer<typeof UserSchema>;
export type Website = z.infer<typeof WebsiteSchema>;
export type Collaboration = z.infer<typeof CollaborationSchema>;
export type AnalyticsLog = z.infer<typeof AnalyticsLogSchema>;
export type Template = z.infer<typeof TemplateSchema>;

// Database connection interface
export interface DatabaseInterface {
  // User operations
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;

  // Website operations
  createWebsite(website: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): Promise<Website>;
  getWebsiteById(id: string): Promise<Website | null>;
  getWebsitesByUserId(userId: string): Promise<Website[]>;
  updateWebsite(id: string, updates: Partial<Website>): Promise<Website>;
  deleteWebsite(id: string): Promise<boolean>;

  // Collaboration operations
  createCollaboration(collaboration: Omit<Collaboration, 'id' | 'invitedAt'>): Promise<Collaboration>;
  getCollaborationsByWebsiteId(websiteId: string): Promise<Collaboration[]>;
  updateCollaboration(id: string, updates: Partial<Collaboration>): Promise<Collaboration>;

  // Analytics operations
  logEvent(log: Omit<AnalyticsLog, 'id' | 'timestamp'>): Promise<AnalyticsLog>;
  getAnalytics(websiteId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsLog[]>;

  // Template operations
  getTemplates(category?: string, isPremium?: boolean): Promise<Template[]>;
  getTemplateById(id: string): Promise<Template | null>;
}
