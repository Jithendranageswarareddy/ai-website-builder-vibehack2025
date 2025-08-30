import { 
  DatabaseInterface, 
  User, 
  Website, 
  Collaboration, 
  AnalyticsLog, 
  Template 
} from './schema';

class MockDatabase implements DatabaseInterface {
  private users: Map<string, User> = new Map();
  private websites: Map<string, Website> = new Map();
  private collaborations: Map<string, Collaboration> = new Map();
  private analyticsLogs: Map<string, AnalyticsLog> = new Map();
  private templates: Map<string, Template> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMockData() {
    // Initialize mock templates
    const mockTemplates: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Modern Business',
        description: 'Clean and professional design perfect for corporate websites',
        category: 'business',
        tags: ['professional', 'corporate', 'modern'],
        preview: '/templates/modern-business.jpg',
        isPremium: false,
        rating: 4.8,
        downloads: 1247,
        components: [
          {
            type: 'hero',
            props: {
              title: 'Transform Your Business with Innovation',
              subtitle: 'Leading solutions for modern enterprises',
              backgroundStyle: 'gradient',
              buttonStyle: 'primary'
            }
          }
        ],
        createdBy: 'system'
      },
      {
        name: 'E-Commerce Store',
        description: 'Complete online store template with product showcase',
        category: 'ecommerce',
        tags: ['ecommerce', 'shop', 'products'],
        preview: '/templates/ecommerce-store.jpg',
        isPremium: true,
        rating: 4.7,
        downloads: 2156,
        components: [
          {
            type: 'hero',
            props: {
              title: 'Premium Products, Exceptional Quality',
              subtitle: 'Discover our curated collection',
              backgroundStyle: 'product-showcase'
            }
          }
        ],
        createdBy: 'system'
      }
    ];

    mockTemplates.forEach(template => {
      const id = this.generateId();
      this.templates.set(id, {
        ...template,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }

  // User operations
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = this.generateId();
    const now = new Date();
    const user: User = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Website operations
  async createWebsite(websiteData: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): Promise<Website> {
    const id = this.generateId();
    const now = new Date();
    const website: Website = {
      ...websiteData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.websites.set(id, website);
    return website;
  }

  async getWebsiteById(id: string): Promise<Website | null> {
    return this.websites.get(id) || null;
  }

  async getWebsitesByUserId(userId: string): Promise<Website[]> {
    const websites: Website[] = [];
    for (const website of this.websites.values()) {
      if (website.userId === userId) {
        websites.push(website);
      }
    }
    return websites;
  }

  async updateWebsite(id: string, updates: Partial<Website>): Promise<Website> {
    const website = this.websites.get(id);
    if (!website) {
      throw new Error('Website not found');
    }

    const updatedWebsite = {
      ...website,
      ...updates,
      updatedAt: new Date()
    };

    this.websites.set(id, updatedWebsite);
    return updatedWebsite;
  }

  async deleteWebsite(id: string): Promise<boolean> {
    return this.websites.delete(id);
  }

  // Collaboration operations
  async createCollaboration(collaborationData: Omit<Collaboration, 'id' | 'invitedAt'>): Promise<Collaboration> {
    const id = this.generateId();
    const collaboration: Collaboration = {
      ...collaborationData,
      id,
      invitedAt: new Date()
    };
    
    this.collaborations.set(id, collaboration);
    return collaboration;
  }

  async getCollaborationsByWebsiteId(websiteId: string): Promise<Collaboration[]> {
    const collaborations: Collaboration[] = [];
    for (const collaboration of this.collaborations.values()) {
      if (collaboration.websiteId === websiteId) {
        collaborations.push(collaboration);
      }
    }
    return collaborations;
  }

  async updateCollaboration(id: string, updates: Partial<Collaboration>): Promise<Collaboration> {
    const collaboration = this.collaborations.get(id);
    if (!collaboration) {
      throw new Error('Collaboration not found');
    }

    const updatedCollaboration = {
      ...collaboration,
      ...updates
    };

    this.collaborations.set(id, updatedCollaboration);
    return updatedCollaboration;
  }

  // Analytics operations
  async logEvent(logData: Omit<AnalyticsLog, 'id' | 'timestamp'>): Promise<AnalyticsLog> {
    const id = this.generateId();
    const log: AnalyticsLog = {
      ...logData,
      id,
      timestamp: new Date()
    };
    
    this.analyticsLogs.set(id, log);
    return log;
  }

  async getAnalytics(websiteId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsLog[]> {
    const logs: AnalyticsLog[] = [];
    for (const log of this.analyticsLogs.values()) {
      if (log.websiteId === websiteId) {
        if (startDate && log.timestamp < startDate) continue;
        if (endDate && log.timestamp > endDate) continue;
        logs.push(log);
      }
    }
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Template operations
  async getTemplates(category?: string, isPremium?: boolean): Promise<Template[]> {
    const templates: Template[] = [];
    for (const template of this.templates.values()) {
      if (category && template.category !== category) continue;
      if (isPremium !== undefined && template.isPremium !== isPremium) continue;
      templates.push(template);
    }
    return templates.sort((a, b) => b.downloads - a.downloads);
  }

  async getTemplateById(id: string): Promise<Template | null> {
    return this.templates.get(id) || null;
  }

  // Utility methods for development
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllWebsites(): Promise<Website[]> {
    return Array.from(this.websites.values());
  }

  async clearAllData(): Promise<void> {
    this.users.clear();
    this.websites.clear();
    this.collaborations.clear();
    this.analyticsLogs.clear();
    // Keep templates as they're system data
  }
}

// Singleton instance
let dbInstance: MockDatabase | null = null;

export const getDatabase = (): MockDatabase => {
  if (!dbInstance) {
    dbInstance = new MockDatabase();
  }
  return dbInstance;
};

export { MockDatabase };
