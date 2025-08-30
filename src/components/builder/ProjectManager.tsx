import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, 
  FolderOpen, 
  Upload, 
  Download,
  Copy,
  Trash2,
  Share2,
  Clock,
  Users,
  FileText,
  Star,
  Archive,
  RefreshCw,
  History,
  GitBranch,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectSchema {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isStarred: boolean;
  canvasBlocks: any[];
  tables: any[];
  endpoints: any[];
  authConfig: any;
  environmentVariables: Record<string, string>;
  metadata: {
    author: string;
    collaborators: string[];
    lastModifiedBy: string;
    projectType: string;
    framework: string;
  };
}

interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  timestamp: Date;
  changes: string;
  schema: Partial<ProjectSchema>;
  author: string;
}

interface ProjectManagerProps {
  currentProject: {
    canvasBlocks: any[];
    tables: any[];
    endpoints: any[];
    authConfig: any;
    environmentVariables: Record<string, string>;
  };
  onLoadProject: (project: ProjectSchema) => void;
  onProjectUpdate: () => void;
}

export const ProjectManager = ({
  currentProject,
  onLoadProject,
  onProjectUpdate
}: ProjectManagerProps) => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<ProjectSchema[]>([]);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectSchema | null>(null);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    tags: '',
    author: 'Current User'
  });

  const [importSchema, setImportSchema] = useState('');
  const { toast } = useToast();

  // Load projects from localStorage on component mount
  useEffect(() => {
    loadProjectsFromStorage();
    loadVersionsFromStorage();
  }, []);

  const loadProjectsFromStorage = () => {
    try {
      const savedProjects = localStorage.getItem('ai-builder-projects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
        setProjects(parsedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Load Error",
        description: "Failed to load saved projects.",
        variant: "destructive"
      });
    }
  };

  const loadVersionsFromStorage = () => {
    try {
      const savedVersions = localStorage.getItem('ai-builder-versions');
      if (savedVersions) {
        const parsedVersions = JSON.parse(savedVersions).map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp)
        }));
        setVersions(parsedVersions);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const saveProjectsToStorage = (projectsToSave: ProjectSchema[]) => {
    try {
      localStorage.setItem('ai-builder-projects', JSON.stringify(projectsToSave));
    } catch (error) {
      console.error('Error saving projects:', error);
      toast({
        title: "Save Error",
        description: "Failed to save projects to storage.",
        variant: "destructive"
      });
    }
  };

  const saveVersionsToStorage = (versionsToSave: ProjectVersion[]) => {
    try {
      localStorage.setItem('ai-builder-versions', JSON.stringify(versionsToSave));
    } catch (error) {
      console.error('Error saving versions:', error);
    }
  };

  const generateProjectId = () => {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const generateVersion = (projectId: string) => {
    const projectVersions = versions.filter(v => v.projectId === projectId);
    const latestVersion = projectVersions.length > 0 
      ? Math.max(...projectVersions.map(v => parseInt(v.version.split('.')[2])))
      : 0;
    return `1.0.${latestVersion + 1}`;
  };

  const saveCurrentProject = () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive"
      });
      return;
    }

    const projectId = currentProjectId || generateProjectId();
    const isNewProject = !currentProjectId;
    
    const projectSchema: ProjectSchema = {
      id: projectId,
      name: newProject.name,
      description: newProject.description,
      version: generateVersion(projectId),
      createdAt: isNewProject ? new Date() : (selectedProject?.createdAt || new Date()),
      updatedAt: new Date(),
      tags: newProject.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isStarred: selectedProject?.isStarred || false,
      canvasBlocks: currentProject.canvasBlocks,
      tables: currentProject.tables,
      endpoints: currentProject.endpoints,
      authConfig: currentProject.authConfig,
      environmentVariables: currentProject.environmentVariables,
      metadata: {
        author: newProject.author,
        collaborators: selectedProject?.metadata.collaborators || [],
        lastModifiedBy: newProject.author,
        projectType: 'web-application',
        framework: 'react-typescript'
      }
    };

    // Save version history
    const versionEntry: ProjectVersion = {
      id: 'ver_' + Date.now(),
      projectId: projectId,
      version: projectSchema.version,
      timestamp: new Date(),
      changes: isNewProject ? 'Initial project creation' : 'Project updated',
      schema: projectSchema,
      author: newProject.author
    };

    const updatedProjects = isNewProject 
      ? [...projects, projectSchema]
      : projects.map(p => p.id === projectId ? projectSchema : p);

    const updatedVersions = [...versions, versionEntry];

    setProjects(updatedProjects);
    setVersions(updatedVersions);
    setCurrentProjectId(projectId);
    setSelectedProject(projectSchema);

    saveProjectsToStorage(updatedProjects);
    saveVersionsToStorage(updatedVersions);

    toast({
      title: isNewProject ? "Project Saved" : "Project Updated",
      description: `${projectSchema.name} (v${projectSchema.version}) saved successfully.`,
    });

    setSaveDialogOpen(false);
    onProjectUpdate();
  };

  const loadProject = (project: ProjectSchema) => {
    setCurrentProjectId(project.id);
    setSelectedProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      tags: project.tags.join(', '),
      author: project.metadata.author
    });

    onLoadProject(project);

    toast({
      title: "Project Loaded",
      description: `${project.name} (v${project.version}) loaded successfully.`,
    });
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    const updatedVersions = versions.filter(v => v.projectId !== projectId);
    
    setProjects(updatedProjects);
    setVersions(updatedVersions);
    
    saveProjectsToStorage(updatedProjects);
    saveVersionsToStorage(updatedVersions);

    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
      setSelectedProject(null);
    }

    toast({
      title: "Project Deleted",
      description: "Project and all versions removed.",
    });
  };

  const toggleStarProject = (projectId: string) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, isStarred: !p.isStarred } : p
    );
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const exportProject = (project: ProjectSchema) => {
    const exportData = {
      ...project,
      exportedAt: new Date(),
      exportVersion: '1.0.0',
      builderVersion: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-schema.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Project Exported",
      description: `${project.name} schema exported successfully.`,
    });
  };

  const importProject = () => {
    try {
      const projectData = JSON.parse(importSchema);
      
      // Validate schema structure
      if (!projectData.name || !projectData.canvasBlocks) {
        throw new Error('Invalid project schema format');
      }

      const importedProject: ProjectSchema = {
        ...projectData,
        id: generateProjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.1'
      };

      const updatedProjects = [...projects, importedProject];
      setProjects(updatedProjects);
      saveProjectsToStorage(updatedProjects);

      setImportSchema('');
      toast({
        title: "Project Imported",
        description: `${importedProject.name} imported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Invalid project schema format.",
        variant: "destructive"
      });
    }
  };

  const rollbackToVersion = (version: ProjectVersion) => {
    if (version.schema) {
      const restoredProject = {
        ...version.schema,
        id: version.projectId,
        version: generateVersion(version.projectId),
        updatedAt: new Date()
      } as ProjectSchema;

      const updatedProjects = projects.map(p => 
        p.id === version.projectId ? restoredProject : p
      );

      // Create rollback version entry
      const rollbackVersion: ProjectVersion = {
        id: 'ver_' + Date.now(),
        projectId: version.projectId,
        version: restoredProject.version,
        timestamp: new Date(),
        changes: `Rolled back to version ${version.version}`,
        schema: restoredProject,
        author: 'Current User'
      };

      const updatedVersions = [...versions, rollbackVersion];

      setProjects(updatedProjects);
      setVersions(updatedVersions);
      saveProjectsToStorage(updatedProjects);
      saveVersionsToStorage(updatedVersions);

      if (currentProjectId === version.projectId) {
        loadProject(restoredProject);
      }

      toast({
        title: "Version Restored",
        description: `Rolled back to version ${version.version}.`,
      });
    }
  };

  const shareProject = (project: ProjectSchema) => {
    const shareUrl = `${window.location.origin}/shared/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Share Link Copied",
      description: "Project share link copied to clipboard.",
    });
    setShareDialogOpen(false);
  };

  const filteredProjects = projects.sort((a, b) => {
    // Starred projects first, then by last updated
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Project Manager
          <Badge variant="secondary" className="text-xs">
            {projects.length} projects
          </Badge>
          {currentProjectId && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4">
            <TabsTrigger value="projects" className="text-xs">
              <FolderOpen className="w-3 h-3 mr-1" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-xs">
              <History className="w-3 h-3 mr-1" />
              Versions
            </TabsTrigger>
            <TabsTrigger value="share" className="text-xs">
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </TabsTrigger>
            <TabsTrigger value="import" className="text-xs">
              <Upload className="w-3 h-3 mr-1" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="flex-1 m-0">
            <div className="flex flex-col h-full">
              {/* Project Actions */}
              <div className="p-4 border-b space-y-3">
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setSaveDialogOpen(true)}>
                    <Save className="w-3 h-3 mr-1" />
                    Save Project
                  </Button>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    New Project
                  </Button>
                </div>

                {/* Save Dialog */}
                {saveDialogOpen && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Save Current Project</h4>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setSaveDialogOpen(false)}
                        >
                          ×
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="project-name">Project Name</Label>
                          <Input
                            id="project-name"
                            value={newProject.name}
                            onChange={(e) => setNewProject(prev => ({ 
                              ...prev, 
                              name: e.target.value 
                            }))}
                            placeholder="My Awesome Project"
                          />
                        </div>
                        <div>
                          <Label htmlFor="project-tags">Tags</Label>
                          <Input
                            id="project-tags"
                            value={newProject.tags}
                            onChange={(e) => setNewProject(prev => ({ 
                              ...prev, 
                              tags: e.target.value 
                            }))}
                            placeholder="react, typescript, api"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea
                          id="project-description"
                          value={newProject.description}
                          onChange={(e) => setNewProject(prev => ({ 
                            ...prev, 
                            description: e.target.value 
                          }))}
                          placeholder="Describe your project..."
                          className="h-20"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveCurrentProject}>
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setSaveDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Projects List */}
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-4">
                  {filteredProjects.map((project) => (
                    <Card 
                      key={project.id} 
                      className={`p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
                        currentProjectId === project.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => loadProject(project)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{project.name}</span>
                              {project.isStarred && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                v{project.version}
                              </Badge>
                              {currentProjectId === project.id && (
                                <Badge variant="default" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {project.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {project.updatedAt.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {project.metadata.author}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStarProject(project.id);
                              }}
                            >
                              <Star className={`w-3 h-3 ${project.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportProject(project);
                              }}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                shareProject(project);
                              }}
                            >
                              <Share2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProject(project.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {projects.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No projects saved</p>
                      <p className="text-xs">Save your current work to get started</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="versions" className="flex-1 m-0">
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Version History</h3>
                  {selectedProject && (
                    <Badge variant="outline">
                      {selectedProject.name}
                    </Badge>
                  )}
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {versions
                      .filter(v => !selectedProject || v.projectId === selectedProject.id)
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map((version) => (
                      <Card key={version.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <GitBranch className="w-4 h-4" />
                              <span className="font-medium">v{version.version}</span>
                              <Badge variant="secondary" className="text-xs">
                                {version.author}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {version.changes}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {version.timestamp.toLocaleString()}
                            </p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rollbackToVersion(version)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {versions.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No version history</p>
                        <p className="text-xs">Save projects to track changes</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="share" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Share Projects</h3>
                <p className="text-sm text-muted-foreground">
                  Export project schemas to share with teammates or import from others.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {filteredProjects.slice(0, 6).map((project) => (
                  <Card key={project.id} className="p-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{project.name}</span>
                        {project.isStarred && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => exportProject(project)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => shareProject(project)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {projects.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No projects to share</p>
                  <p className="text-xs">Save some projects first</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="import" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Import Project Schema</h3>
                <p className="text-sm text-muted-foreground">
                  Paste a project schema JSON to import it into your workspace.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="import-schema">Project Schema JSON</Label>
                <Textarea
                  id="import-schema"
                  placeholder={`{
  "name": "My Project",
  "description": "Project description",
  "canvasBlocks": [...],
  "tables": [...],
  ...
}`}
                  value={importSchema}
                  onChange={(e) => setImportSchema(e.target.value)}
                  className="h-60 font-mono text-xs"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={importProject}
                  disabled={!importSchema.trim()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setImportSchema('')}
                >
                  Clear
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Make sure the schema includes at least 'name' and 'canvasBlocks' properties.
                  Imported projects will get a new ID and version number.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
