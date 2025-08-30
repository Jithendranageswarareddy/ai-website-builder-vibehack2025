import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  MessageSquare, 
  Send,
  UserPlus,
  Crown,
  Eye,
  Edit,
  Clock,
  Bell,
  Settings,
  Link,
  Copy,
  Share2,
  Globe,
  Lock,
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'offline' | 'idle';
  lastSeen: Date;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    canExport: boolean;
  };
}

interface Comment {
  id: string;
  author: Collaborator;
  content: string;
  timestamp: Date;
  resolved: boolean;
  replies: Comment[];
  blockId?: string;
  position?: { x: number; y: number };
}

interface ActivityEvent {
  id: string;
  type: 'edit' | 'comment' | 'invite' | 'join' | 'leave';
  author: Collaborator;
  description: string;
  timestamp: Date;
  metadata?: any;
}

interface CollaborationPanelProps {
  projectId: string;
  currentUser: Collaborator;
  onInviteUser?: (email: string, role: string) => void;
  onUpdatePermissions?: (userId: string, permissions: any) => void;
}

export const CollaborationPanel = ({
  projectId,
  currentUser,
  onInviteUser,
  onUpdatePermissions
}: CollaborationPanelProps) => {
  const [activeTab, setActiveTab] = useState('team');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      status: 'online',
      lastSeen: new Date(),
      permissions: {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canExport: true
      }
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'editor',
      status: 'online',
      lastSeen: new Date(Date.now() - 300000),
      permissions: {
        canEdit: true,
        canDelete: false,
        canInvite: false,
        canExport: true
      }
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'viewer',
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000),
      permissions: {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canExport: false
      }
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: collaborators[1],
      content: 'This hero section looks great! Maybe we could add a call-to-action button?',
      timestamp: new Date(Date.now() - 1800000),
      resolved: false,
      replies: [
        {
          id: '1-1',
          author: collaborators[0],
          content: 'Good idea! I\'ll add one now.',
          timestamp: new Date(Date.now() - 1500000),
          resolved: false,
          replies: []
        }
      ]
    }
  ]);

  const [activities, setActivities] = useState<ActivityEvent[]>([
    {
      id: '1',
      type: 'edit',
      author: collaborators[1],
      description: 'Updated hero section styling',
      timestamp: new Date(Date.now() - 600000)
    },
    {
      id: '2',
      type: 'comment',
      author: collaborators[1],
      description: 'Added comment on hero section',
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: '3',
      type: 'join',
      author: collaborators[2],
      description: 'Joined the project',
      timestamp: new Date(Date.now() - 7200000)
    }
  ]);

  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'viewer',
    message: ''
  });

  const [newComment, setNewComment] = useState('');
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowComments: true,
    requireAuth: true,
    shareLink: `https://builder.app/shared/${projectId}`
  });

  const { toast } = useToast();

  const inviteUser = () => {
    if (!newInvite.email.trim()) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Mock invitation
    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: newInvite.email.split('@')[0],
      email: newInvite.email,
      role: newInvite.role as any,
      status: 'offline',
      lastSeen: new Date(),
      permissions: {
        canEdit: newInvite.role !== 'viewer',
        canDelete: newInvite.role === 'owner',
        canInvite: newInvite.role === 'owner',
        canExport: newInvite.role !== 'viewer'
      }
    };

    setCollaborators(prev => [...prev, newCollaborator]);

    // Add activity
    const inviteActivity: ActivityEvent = {
      id: Date.now().toString(),
      type: 'invite',
      author: currentUser,
      description: `Invited ${newInvite.email} as ${newInvite.role}`,
      timestamp: new Date()
    };
    setActivities(prev => [inviteActivity, ...prev]);

    setNewInvite({ email: '', role: 'viewer', message: '' });

    toast({
      title: "Invitation Sent",
      description: `Invited ${newInvite.email} to collaborate.`,
    });

    onInviteUser?.(newInvite.email, newInvite.role);
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: currentUser,
      content: newComment,
      timestamp: new Date(),
      resolved: false,
      replies: []
    };

    setComments(prev => [comment, ...prev]);

    // Add activity
    const commentActivity: ActivityEvent = {
      id: Date.now().toString(),
      type: 'comment',
      author: currentUser,
      description: 'Added a new comment',
      timestamp: new Date()
    };
    setActivities(prev => [commentActivity, ...prev]);

    setNewComment('');

    toast({
      title: "Comment Added",
      description: "Your comment has been posted.",
    });
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, resolved: true }
          : comment
      )
    );

    toast({
      title: "Comment Resolved",
      description: "Comment marked as resolved.",
    });
  };

  const updateUserRole = (userId: string, newRole: string) => {
    setCollaborators(prev =>
      prev.map(user =>
        user.id === userId
          ? {
              ...user,
              role: newRole as any,
              permissions: {
                canEdit: newRole !== 'viewer',
                canDelete: newRole === 'owner',
                canInvite: newRole === 'owner',
                canExport: newRole !== 'viewer'
              }
            }
          : user
      )
    );

    const user = collaborators.find(u => u.id === userId);
    toast({
      title: "Role Updated",
      description: `${user?.name} is now a ${newRole}.`,
    });
  };

  const removeUser = (userId: string) => {
    const user = collaborators.find(u => u.id === userId);
    setCollaborators(prev => prev.filter(u => u.id !== userId));

    toast({
      title: "User Removed",
      description: `${user?.name} has been removed from the project.`,
    });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareSettings.shareLink);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'editor': return <Edit className="w-3 h-3 text-blue-500" />;
      case 'viewer': return <Eye className="w-3 h-3 text-gray-500" />;
      default: return <Eye className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatLastSeen = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (diff < 300000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Collaboration
          <Badge variant="secondary" className="text-xs">
            {collaborators.length} members
          </Badge>
          <Badge variant="outline" className="text-xs">
            {collaborators.filter(c => c.status === 'online').length} online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4">
            <TabsTrigger value="team" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Team
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="sharing" className="text-xs">
              <Share2 className="w-3 h-3 mr-1" />
              Sharing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="flex-1 m-0">
            <div className="flex flex-col h-full">
              {/* Invite Section */}
              <div className="p-4 border-b space-y-3">
                <h3 className="font-medium">Invite Team Members</h3>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Email address"
                      value={newInvite.email}
                      onChange={(e) => setNewInvite(prev => ({ 
                        ...prev, 
                        email: e.target.value 
                      }))}
                    />
                    <select
                      value={newInvite.role}
                      onChange={(e) => setNewInvite(prev => ({ 
                        ...prev, 
                        role: e.target.value 
                      }))}
                      className="border rounded px-3 py-2 text-sm"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                  
                  <Button size="sm" onClick={inviteUser}>
                    <UserPlus className="w-3 h-3 mr-1" />
                    Send Invite
                  </Button>
                </div>
              </div>

              {/* Team Members List */}
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-4">
                  {collaborators.map((user) => (
                    <Card key={user.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {user.name}
                            </span>
                            {getRoleIcon(user.role)}
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{user.email}</span>
                            <span>•</span>
                            <span>{formatLastSeen(user.lastSeen)}</span>
                          </div>
                        </div>
                        
                        {currentUser.permissions.canInvite && user.id !== currentUser.id && (
                          <div className="flex gap-1">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="owner">Owner</option>
                            </select>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeUser(user.id)}
                            >
                              ×
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Permissions */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {user.permissions.canEdit && (
                          <Badge variant="secondary" className="text-xs">
                            <Edit className="w-2 h-2 mr-1" />
                            Edit
                          </Badge>
                        )}
                        {user.permissions.canDelete && (
                          <Badge variant="secondary" className="text-xs">
                            <Settings className="w-2 h-2 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {user.permissions.canExport && (
                          <Badge variant="secondary" className="text-xs">
                            <Share2 className="w-2 h-2 mr-1" />
                            Export
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 m-0">
            <div className="flex flex-col h-full">
              {/* Add Comment */}
              <div className="p-4 border-b space-y-3">
                <h3 className="font-medium">Comments & Feedback</h3>
                
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment or feedback..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="h-20"
                  />
                  <Button size="sm" onClick={addComment}>
                    <Send className="w-3 h-3 mr-1" />
                    Add Comment
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {comments.map((comment) => (
                    <Card key={comment.id} className={`p-3 ${comment.resolved ? 'opacity-60' : ''}`}>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={comment.author.avatar} />
                            <AvatarFallback className="text-xs">
                              {comment.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.author.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatLastSeen(comment.timestamp)}
                              </span>
                              {comment.resolved && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="w-2 h-2 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          
                          {!comment.resolved && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => resolveComment(comment.id)}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="ml-8 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={reply.author.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {reply.author.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs">
                                      {reply.author.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatLastSeen(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-xs">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {comments.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No comments yet</p>
                      <p className="text-xs">Start a conversation with your team</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-3 py-4">
                <h3 className="font-medium px-0">Recent Activity</h3>
                
                {activities.map((activity) => (
                  <Card key={activity.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={activity.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {activity.author.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatLastSeen(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {activities.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No activity yet</p>
                    <p className="text-xs">Team actions will appear here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sharing" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Project Sharing</h3>
                <p className="text-sm text-muted-foreground">
                  Control how your project can be shared and accessed.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Share Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareSettings.shareLink}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button size="sm" onClick={copyShareLink}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Sharing Settings</Label>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={shareSettings.isPublic}
                        onChange={(e) => setShareSettings(prev => ({
                          ...prev,
                          isPublic: e.target.checked
                        }))}
                      />
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span className="text-sm">Public access</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={shareSettings.allowComments}
                        onChange={(e) => setShareSettings(prev => ({
                          ...prev,
                          allowComments: e.target.checked
                        }))}
                      />
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-sm">Allow comments</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={shareSettings.requireAuth}
                        onChange={(e) => setShareSettings(prev => ({
                          ...prev,
                          requireAuth: e.target.checked
                        }))}
                      />
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span className="text-sm">Require authentication</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start gap-2">
                    <Bell className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-800">
                        Sharing Status
                      </p>
                      <p className="text-xs text-blue-600">
                        {shareSettings.isPublic 
                          ? 'Anyone with the link can view this project'
                          : 'Only invited team members can access this project'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
