import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Component } from "@/pages/Builder";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Loader2,
  Lightbulb,
  Wand2,
  Code2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantProps {
  components: Component[];
  onUpdateComponent: (id: string, updates: Partial<Component>) => void;
  onAddComponent: (type: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant = ({ components, onUpdateComponent, onAddComponent }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you build your app, suggest improvements, generate code, and answer questions. What would you like to create today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue, components);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Execute any actions from the AI response
      if (aiResponse.actions) {
        aiResponse.actions.forEach(action => {
          if (action.type === 'addComponent') {
            onAddComponent(action.componentType);
          } else if (action.type === 'updateComponent') {
            // Find and update component
            const component = components.find(c => c.type === action.componentType);
            if (component && action.updates) {
              onUpdateComponent(component.id, action.updates);
            }
          }
        });
        
        toast({
          title: "AI Action Completed",
          description: aiResponse.actionDescription || "I've made the requested changes."
        });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const quickActions = [
    { text: "Add a hero section", icon: Lightbulb },
    { text: "Improve the design", icon: Wand2 },
    { text: "Generate React code", icon: Code2 },
  ];

  return (
    <Card className="h-full flex flex-col bg-builder-panel border-builder-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-builder-text">
          <div className="w-8 h-8 bg-gradient-ai rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          AI Assistant
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-builder-bg border border-builder-border text-builder-text mr-4'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Assistant</span>
                  </div>
                )}
                <p className="leading-relaxed">{message.content}</p>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-builder-text/50'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-builder-bg border border-builder-border rounded-lg p-3 mr-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-builder-text">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-builder-border">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction(action.text)}
                  className="whitespace-nowrap hover:bg-builder-border text-builder-text"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {action.text}
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-builder-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about building your app..."
              disabled={isLoading}
              className="flex-1 bg-builder-bg border-builder-border text-builder-text placeholder:text-builder-text/50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="btn-ai px-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-builder-text/50 mt-2">
            Pro tip: Try asking me to "add a contact form" or "make the buttons more colorful"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple AI response generator (in a real app, this would connect to an AI service)
const generateAIResponse = (input: string, components: Component[]) => {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('hero') || lowerInput.includes('header')) {
    return {
      content: "I'll add a hero section to your page! A hero section is perfect for grabbing attention with a compelling headline and call-to-action. I'm adding a heading component that you can customize.",
      actions: [{ type: 'addComponent', componentType: 'heading' }],
      actionDescription: "Added a hero heading component"
    };
  }
  
  if (lowerInput.includes('button')) {
    return {
      content: "Great idea! Buttons are essential for user interaction. I've added a button component for you. You can customize its text, colors, and styling in the properties panel.",
      actions: [{ type: 'addComponent', componentType: 'button' }],
      actionDescription: "Added a button component"
    };
  }
  
  if (lowerInput.includes('improve') || lowerInput.includes('better')) {
    if (components.length === 0) {
      return {
        content: "To improve your design, let's start with the basics! I recommend adding a hero section first, then some content cards, and interactive buttons. Would you like me to add these components?",
        actions: null
      };
    }
    return {
      content: "I can see your current components. Here are some suggestions: 1) Use consistent spacing between elements, 2) Add complementary colors, 3) Ensure good contrast for accessibility. Try updating the colors in the properties panel!",
      actions: null
    };
  }
  
  if (lowerInput.includes('code') || lowerInput.includes('export')) {
    return {
      content: "I can help you export your design as React code! Click the 'Export' button in the toolbar to copy the generated React component to your clipboard. The code will be clean, modern, and ready for production.",
      actions: null
    };
  }
  
  if (lowerInput.includes('color') || lowerInput.includes('style')) {
    return {
      content: "Colors are crucial for great design! I recommend using a consistent color palette. Try using your brand colors, or go with a modern palette like blues and purples for a tech feel. You can adjust colors in the properties panel when you select a component.",
      actions: null
    };
  }
  
  // Default responses
  const defaultResponses = [
    "That's an interesting request! I can help you add components, modify styles, or generate code. What specific component would you like to work on?",
    "I'm here to help you build amazing apps! You can ask me to add components like buttons, headers, images, or cards. What would you like to add next?",
    "Great question! I can assist with design suggestions, component creation, and code generation. Try asking me to 'add a contact form' or 'improve the layout'.",
    "I love helping founders build their dreams! What specific feature or component would you like to add to your app?"
  ];
  
  return {
    content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
    actions: null
  };
};