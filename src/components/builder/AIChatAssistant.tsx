import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Code, 
  Palette,
  Layout,
  Wand2,
  Sparkles,
  Copy,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CanvasBlock } from "./CanvasBuilder";

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  suggestion?: ComponentSuggestion;
  codeOptimization?: CodeOptimization;
}

interface ComponentSuggestion {
  type: 'component' | 'layout' | 'style';
  component?: string;
  description: string;
  preview?: string;
  confidence: number;
}

interface CodeOptimization {
  type: 'formatting' | 'performance' | 'accessibility';
  description: string;
  before: string;
  after: string;
  impact: 'low' | 'medium' | 'high';
}

interface AIChatAssistantProps {
  blocks: CanvasBlock[];
  setBlocks: (blocks: CanvasBlock[]) => void;
  selectedBlockId: string | null;
  onUpdateBlock: (blockId: string, updates: Partial<CanvasBlock>) => void;
  onAddBlock: (block: CanvasBlock) => void;
  projectContext?: {
    tables: any[];
    endpoints: any[];
    authConfig: any;
  };
}

export const AIChatAssistant = ({
  blocks,
  setBlocks,
  selectedBlockId,
  onUpdateBlock,
  onAddBlock,
  projectContext
}: AIChatAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you build your website with natural language commands like "Make the hero title blue" or "Add a contact form below the hero section".',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [suggestions, setSuggestions] = useState<ComponentSuggestion[]>([]);
  const [optimizations, setOptimizations] = useState<CodeOptimization[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate smart suggestions based on current content
  useEffect(() => {
    generateSmartSuggestions();
  }, [blocks]);

  const generateSmartSuggestions = () => {
    const newSuggestions: ComponentSuggestion[] = [];

    // Analyze current blocks and suggest improvements
    const hasHero = blocks.some(block => block.type === 'hero');
    const hasForm = blocks.some(block => block.type === 'form');
    const hasTable = blocks.some(block => block.type === 'table');

    if (!hasHero) {
      newSuggestions.push({
        type: 'component',
        component: 'hero',
        description: 'Add a hero section to make a strong first impression',
        preview: 'Large title with call-to-action button',
        confidence: 0.9
      });
    }

    if (hasHero && !hasForm) {
      newSuggestions.push({
        type: 'component',
        component: 'form',
        description: 'Add a contact form to capture leads',
        preview: 'Name, email, and message fields',
        confidence: 0.8
      });
    }

    if (blocks.length > 3 && !hasTable) {
      newSuggestions.push({
        type: 'component',
        component: 'table',
        description: 'Display data in an organized table format',
        preview: 'Sortable columns with pagination',
        confidence: 0.7
      });
    }

    // Layout suggestions
    if (blocks.length > 2) {
      newSuggestions.push({
        type: 'layout',
        description: 'Organize components in a grid layout for better visual hierarchy',
        confidence: 0.75
      });
    }

    // Style suggestions
    const colorVariety = new Set(blocks.map(block => block.properties.backgroundColor)).size;
    if (colorVariety < 2 && blocks.length > 1) {
      newSuggestions.push({
        type: 'style',
        description: 'Add color variety to make your design more engaging',
        confidence: 0.6
      });
    }

    setSuggestions(newSuggestions);
  };

  const generateCodeOptimizations = () => {
    const newOptimizations: CodeOptimization[] = [];

    // Check for accessibility improvements
    blocks.forEach(block => {
      if (block.type === 'button' && block.properties.buttonText) {
        newOptimizations.push({
          type: 'accessibility',
          description: 'Add ARIA labels for better accessibility',
          before: `<button>${block.properties.buttonText}</button>`,
          after: `<button aria-label="${block.properties.buttonText}">${block.properties.buttonText}</button>`,
          impact: 'medium'
        });
      }
    });

    // Performance optimizations
    if (blocks.length > 5) {
      newOptimizations.push({
        type: 'performance',
        description: 'Consider lazy loading for better performance',
        before: '<img src="large-image.jpg" />',
        after: '<img src="large-image.jpg" loading="lazy" />',
        impact: 'high'
      });
    }

    setOptimizations(newOptimizations);
  };

  const processAICommand = async (command: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing (in real implementation, this would call your AI API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const lowerCommand = command.toLowerCase();
      let response = '';
      let actionPerformed = false;

      // Color changes
      if (lowerCommand.includes('blue') && lowerCommand.includes('title')) {
        const heroBlock = blocks.find(block => block.type === 'hero');
        if (heroBlock) {
          onUpdateBlock(heroBlock.id, {
            properties: { ...heroBlock.properties, textColor: '#3b82f6' }
          });
          response = 'I\'ve changed the hero title color to blue!';
          actionPerformed = true;
        } else {
          response = 'I don\'t see a hero section to modify. Would you like me to add one?';
        }
      }
      
      // Add components
      else if (lowerCommand.includes('add') && lowerCommand.includes('form')) {
        const newForm: CanvasBlock = {
          id: `form-${Date.now()}`,
          type: 'form',
          x: 50,
          y: blocks.length * 120 + 50,
          width: 400,
          height: 300,
          properties: {
            title: 'Contact Form',
            fields: [
              { name: 'name', type: 'text', label: 'Name', required: true },
              { name: 'email', type: 'email', label: 'Email', required: true },
              { name: 'message', type: 'textarea', label: 'Message', required: false }
            ],
            buttonText: 'Send Message',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            borderRadius: '8px'
          }
        };
        onAddBlock(newForm);
        response = 'I\'ve added a contact form to your page!';
        actionPerformed = true;
      }
      
      // Style changes
      else if (lowerCommand.includes('background') && lowerCommand.includes('gradient')) {
        const selectedBlock = blocks.find(block => block.id === selectedBlockId);
        if (selectedBlock) {
          onUpdateBlock(selectedBlock.id, {
            properties: { 
              ...selectedBlock.properties, 
              backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            }
          });
          response = 'I\'ve applied a beautiful gradient background to the selected component!';
          actionPerformed = true;
        } else {
          response = 'Please select a component first, then I can apply the gradient background.';
        }
      }
      
      // Layout changes
      else if (lowerCommand.includes('center') || lowerCommand.includes('align')) {
        const selectedBlock = blocks.find(block => block.id === selectedBlockId);
        if (selectedBlock) {
          onUpdateBlock(selectedBlock.id, {
            properties: { ...selectedBlock.properties, textAlign: 'center' }
          });
          response = 'I\'ve centered the content in the selected component!';
          actionPerformed = true;
        }
      }
      
      // Default responses for unrecognized commands
      else {
        response = `I understand you want to: "${command}". Here are some commands I can help with:
        
• "Make the hero title blue"
• "Add a contact form"
• "Apply gradient background"
• "Center the text"
• "Make the button larger"

Select a component and try one of these commands!`;
      }

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      if (actionPerformed) {
        toast({
          title: "AI Action Completed",
          description: response,
        });
      }

    } catch (error) {
      console.error('AI processing error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');

    // Process AI command
    await processAICommand(currentMessage);
  };

  const applySuggestion = (suggestion: ComponentSuggestion) => {
    if (suggestion.component) {
      let newBlock: CanvasBlock;
      
      switch (suggestion.component) {
        case 'hero':
          newBlock = {
            id: `hero-${Date.now()}`,
            type: 'hero',
            x: 50,
            y: 50,
            width: 600,
            height: 200,
            properties: {
              title: 'Welcome to Our Website',
              subtitle: 'Build amazing experiences with our platform',
              buttonText: 'Get Started',
              backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textColor: '#ffffff'
            }
          };
          break;
        case 'form':
          newBlock = {
            id: `form-${Date.now()}`,
            type: 'form',
            x: 50,
            y: blocks.length * 120 + 50,
            width: 400,
            height: 300,
            properties: {
              title: 'Contact Us',
              fields: [
                { name: 'name', type: 'text', label: 'Name', required: true },
                { name: 'email', type: 'email', label: 'Email', required: true },
                { name: 'message', type: 'textarea', label: 'Message', required: false }
              ],
              buttonText: 'Send Message',
              backgroundColor: '#ffffff',
              textColor: '#000000'
            }
          };
          break;
        default:
          return;
      }
      
      onAddBlock(newBlock);
      toast({
        title: "Component Added",
        description: `${suggestion.component} component has been added to your page.`,
      });
    }
  };

  const applyOptimization = (optimization: CodeOptimization) => {
    // In a real implementation, this would apply the code optimization
    toast({
      title: "Optimization Applied",
      description: optimization.description,
    });
  };

  const copyOptimization = (optimization: CodeOptimization) => {
    navigator.clipboard.writeText(optimization.after);
    toast({
      title: "Code Copied",
      description: "Optimized code copied to clipboard!",
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4">
            <TabsTrigger value="chat" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-xs">
              <Lightbulb className="w-3 h-3 mr-1" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="optimize" className="text-xs">
              <Wand2 className="w-3 h-3 mr-1" />
              Optimize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0">
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Bot className="w-4 h-4 mt-0.5 text-primary" />
                        )}
                        {message.role === 'user' && (
                          <User className="w-4 h-4 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Try: 'Make hero title blue' or 'Add a contact form'"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isProcessing}
                  size="sm"
                >
                  {isProcessing ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-3 py-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {suggestion.type === 'component' && <Layout className="w-4 h-4 text-blue-500" />}
                          {suggestion.type === 'layout' && <Code className="w-4 h-4 text-green-500" />}
                          {suggestion.type === 'style' && <Palette className="w-4 h-4 text-purple-500" />}
                          <Badge variant="outline" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{suggestion.description}</p>
                        {suggestion.preview && (
                          <p className="text-xs text-muted-foreground">{suggestion.preview}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applySuggestion(suggestion)}
                        className="ml-2"
                      >
                        Apply
                      </Button>
                    </div>
                  </Card>
                ))}
                
                {suggestions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No suggestions yet. Keep building and I'll provide smart recommendations!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="optimize" className="flex-1 m-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <Button
                  onClick={generateCodeOptimizations}
                  size="sm"
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Analyze & Optimize Code
                </Button>
              </div>
              
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-4">
                  {optimizations.map((optimization, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                optimization.impact === 'high' ? 'destructive' :
                                optimization.impact === 'medium' ? 'default' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {optimization.impact} impact
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {optimization.type}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyOptimization(optimization)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => applyOptimization(optimization)}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm font-medium">{optimization.description}</p>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Before:</p>
                            <code className="text-xs bg-muted p-2 rounded block">
                              {optimization.before}
                            </code>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">After:</p>
                            <code className="text-xs bg-green-50 p-2 rounded block">
                              {optimization.after}
                            </code>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {optimizations.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Click "Analyze & Optimize Code" to get improvement suggestions!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
