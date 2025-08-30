import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { getDatabase } from '@/lib/database/mockDatabase';
import { Website } from '@/lib/database/schema';
import { 
  User, 
  Settings, 
  Globe, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Share, 
  Download,
  BarChart3,
  Calendar,
  Crown,
  Star,
  Zap,
  Shield
} from 'lucide-react';

interface UserDashboardProps {
  onCreateWebsite: () => void;
  onEditWebsite: (websiteId: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onCreateWebsite,
  onEditWebsite
}) => {
  const { user, updateProfile } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const db = getDatabase();

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userWebsites = await db.getWebsitesByUserId(user.id);
        setWebsites(userWebsites);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, db]);

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'enterprise': return 'text-purple-600';
      case 'pro': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSubscriptionIcon = (subscription: string) => {
    switch (subscription) {
      case 'enterprise': return Crown;
      case 'pro': return Star;
      default: return Shield;
    }
  };

  const stats = [
    {
      label: 'Websites Created',
      value: websites.length,
      icon: Globe,
      color: 'text-blue-600'
    },
    {
      label: 'Published Sites',
      value: websites.filter(w => w.status === 'published').length,
      icon: Eye,
      color: 'text-green-600'
    },
    {
      label: 'Total Views',
      value: websites.reduce((sum, w) => sum + (w.analytics?.views || 0), 0),
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      label: 'Account Age',
      value: user ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + ' days' : '0 days',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  const recentWebsites = websites
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.firstName}!</h1>
              <p className="text-muted-foreground">
                {user.email} • @{user.username}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="flex items-center gap-1">
                  {React.createElement(getSubscriptionIcon(user.subscription), { 
                    className: `w-3 h-3 ${getSubscriptionColor(user.subscription)}` 
                  })}
                  {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                </Badge>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </div>
          </div>

          <Button onClick={onCreateWebsite} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Website
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="websites">My Websites</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Websites */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Websites</CardTitle>
                    <CardDescription>Your latest projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentWebsites.length > 0 ? (
                      <div className="space-y-4">
                        {recentWebsites.map((website) => (
                          <div key={website.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium">{website.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Updated {new Date(website.updatedAt).toLocaleDateString()}
                                </p>
                                <Badge variant={website.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                                  {website.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditWebsite(website.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No websites yet</p>
                        <Button onClick={onCreateWebsite} className="mt-2">
                          Create your first website
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={onCreateWebsite} className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      New Website
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Import Template
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share className="w-4 h-4 mr-2" />
                      Share Portfolio
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage This Month</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Websites</span>
                        <span>{websites.length}/10</span>
                      </div>
                      <Progress value={(websites.length / 10) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage</span>
                        <span>2.1GB/5GB</span>
                      </div>
                      <Progress value={42} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>AI Generations</span>
                        <span>47/100</span>
                      </div>
                      <Progress value={47} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">My Websites</h2>
                <p className="text-muted-foreground">Manage all your website projects</p>
              </div>
              <Button onClick={onCreateWebsite}>
                <Plus className="w-4 h-4 mr-2" />
                New Website
              </Button>
            </div>

            {websites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {websites.map((website) => (
                  <Card key={website.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{website.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {website.description || 'No description'}
                          </CardDescription>
                        </div>
                        <Badge variant={website.status === 'published' ? 'default' : 'secondary'}>
                          {website.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                          <Globe className="w-8 h-8 text-muted-foreground" />
                        </div>
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Components: {website.components.length}</span>
                          <span>Views: {website.analytics?.views || 0}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => onEditWebsite(website.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No websites yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first website to get started with the AI Website Builder
                    </p>
                    <Button onClick={onCreateWebsite} size="lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Website
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Your website performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {websites.reduce((sum, w) => sum + (w.analytics?.views || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {websites.reduce((sum, w) => sum + (w.analytics?.uniqueVisitors || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Unique Visitors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {websites.filter(w => w.status === 'published').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Published Sites</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Settings panel coming soon. You can update your profile information and preferences here.
                  </p>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
