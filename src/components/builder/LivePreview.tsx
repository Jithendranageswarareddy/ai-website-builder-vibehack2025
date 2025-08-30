import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Maximize, 
  RefreshCw,
  ExternalLink,
  Code,
  Eye
} from "lucide-react";
import { CanvasBlock } from "./CanvasBuilder";
import { useToast } from "@/hooks/use-toast";

interface LivePreviewProps {
  blocks: CanvasBlock[];
  projectName?: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export const LivePreview = ({ blocks, projectName = "My App" }: LivePreviewProps) => {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');
  const [generatedCode, setGeneratedCode] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const viewportSizes = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  useEffect(() => {
    generatePreview();
  }, [blocks, viewport]);

  const generatePreview = () => {
    const html = generateHTML(blocks, projectName);
    setGeneratedCode(html);
    updateIframe(html);
  };

  const updateIframe = (html: string) => {
    if (iframeRef.current) {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      
      // Clean up the previous blob URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    generatePreview();
    setTimeout(() => setIsRefreshing(false), 500);
    toast({
      title: "Preview Refreshed",
      description: "Live preview has been updated"
    });
  };

  const openInNewWindow = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(generatedCode);
      newWindow.document.close();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Code Copied",
      description: "HTML code has been copied to clipboard"
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Controls */}
      <div className="p-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <h3 className="font-semibold">Live Preview</h3>
            <Badge variant="secondary" className="text-xs">
              {blocks.length} blocks
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={openInNewWindow}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[
              { id: 'desktop', label: 'Desktop', icon: Monitor },
              { id: 'tablet', label: 'Tablet', icon: Tablet },
              { id: 'mobile', label: 'Mobile', icon: Smartphone }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                size="sm"
                variant={viewport === id ? "default" : "ghost"}
                onClick={() => setViewport(id as ViewportSize)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>

          <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-1">
                <Code className="w-3 h-3" />
                Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {previewMode === 'preview' ? (
          <div className="h-full flex items-center justify-center p-4 bg-gray-100">
            <div 
              className="bg-white shadow-lg transition-all duration-300 ease-in-out"
              style={{
                width: viewportSizes[viewport].width,
                height: viewportSizes[viewport].height,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0 rounded"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <div className="h-full p-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Generated HTML</h4>
                <Button size="sm" onClick={copyCode}>
                  Copy Code
                </Button>
              </div>
              <div className="flex-1 bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {generatedCode}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Stats */}
      <div className="p-3 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Viewport: {viewport} ({viewportSizes[viewport].width})</span>
          <span>Blocks: {blocks.length} | Size: {Math.round(generatedCode.length / 1024)}KB</span>
        </div>
      </div>
    </div>
  );
};

// HTML Generation Function
const generateHTML = (blocks: CanvasBlock[], projectName: string): string => {
  const styles = generateCSS(blocks);
  const bodyContent = generateBlocksHTML(blocks);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #ffffff;
        }
        
        .container {
            position: relative;
            width: 100%;
            min-height: 100vh;
        }
        
        .block {
            position: absolute;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        
        .block:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        button {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s ease;
        }
        
        button:hover {
            background-color: #2563eb;
        }
        
        input, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 14px;
            margin-bottom: 12px;
        }
        
        input:focus, textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        th {
            background-color: #f9fafb;
            font-weight: 600;
        }
        
        .hero {
            text-align: center;
            padding: 60px 20px;
        }
        
        .hero h1 {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero p {
            font-size: 20px;
            color: #6b7280;
            margin-bottom: 30px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .form-container {
            padding: 30px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .form-container h3 {
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: 700;
        }
        
        .auth-form {
            max-width: 400px;
            margin: 0 auto;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .text-block {
            padding: 20px;
        }
        
        .text-block h3 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 16px;
        }
        
        .text-block p {
            font-size: 16px;
            color: #6b7280;
            line-height: 1.7;
        }
        
        ${styles}
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 36px;
            }
            
            .hero p {
                font-size: 18px;
            }
            
            .block {
                position: static !important;
                width: 100% !important;
                margin-bottom: 20px;
            }
            
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${bodyContent}
    </div>
    
    <script>
        // Simple form handling
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Form submitted! (This is a preview)');
            });
        });
        
        // Button click handlers
        document.querySelectorAll('button[type="button"]').forEach(button => {
            button.addEventListener('click', function() {
                alert('Button clicked! (This is a preview)');
            });
        });
    </script>
</body>
</html>`;
};

const generateCSS = (blocks: CanvasBlock[]): string => {
  return blocks.map(block => {
    const { id, properties } = block;
    let css = `#block-${id} {`;
    
    if (properties.backgroundColor) {
      css += `background-color: ${properties.backgroundColor};`;
    }
    
    if (properties.textColor) {
      css += `color: ${properties.textColor};`;
    }
    
    if (properties.fontSize) {
      css += `font-size: ${properties.fontSize};`;
    }
    
    if (properties.textAlign) {
      css += `text-align: ${properties.textAlign};`;
    }
    
    if (properties.borderRadius) {
      const radiusMap = {
        'none': '0',
        'sm': '4px',
        'default': '8px',
        'lg': '12px',
        'full': '50%'
      };
      css += `border-radius: ${radiusMap[properties.borderRadius as keyof typeof radiusMap] || '8px'};`;
    }
    
    if (properties.shadow) {
      const shadowMap = {
        'none': 'none',
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.15)'
      };
      css += `box-shadow: ${shadowMap[properties.shadow as keyof typeof shadowMap] || 'none'};`;
    }
    
    if (properties.padding) {
      const paddingMap = {
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px'
      };
      css += `padding: ${paddingMap[properties.padding as keyof typeof paddingMap] || '16px'};`;
    }
    
    css += '}';
    return css;
  }).join('\n');
};

const generateBlocksHTML = (blocks: CanvasBlock[]): string => {
  return blocks.map(block => {
    const style = `left: ${block.x}px; top: ${block.y}px; width: ${block.width}px; height: ${block.height}px;`;
    
    return `<div id="block-${block.id}" class="block" style="${style}">
      ${generateBlockContent(block)}
    </div>`;
  }).join('\n');
};

const generateBlockContent = (block: CanvasBlock): string => {
  switch (block.type) {
    case 'hero':
      return `
        <div class="hero">
          <h1>${block.properties.title || 'Hero Title'}</h1>
          <p>${block.properties.subtitle || 'Hero subtitle text goes here'}</p>
          <button type="button">${block.properties.buttonText || 'Get Started'}</button>
        </div>
      `;
      
    case 'form':
      const fields = block.properties.fields || [];
      const fieldHTML = fields.map(field => {
        if (field.type === 'textarea') {
          return `
            <label>${field.label}${field.required ? ' *' : ''}</label>
            <textarea placeholder="${field.label}" ${field.required ? 'required' : ''}></textarea>
          `;
        }
        return `
          <label>${field.label}${field.required ? ' *' : ''}</label>
          <input type="${field.type}" placeholder="${field.label}" ${field.required ? 'required' : ''}>
        `;
      }).join('');
      
      return `
        <div class="form-container">
          <h3>${block.properties.title || 'Contact Form'}</h3>
          <form>
            ${fieldHTML}
            <button type="submit">${block.properties.buttonText || 'Submit'}</button>
          </form>
        </div>
      `;
      
    case 'table':
      const columns = block.properties.columns || [];
      const headerHTML = columns.map(col => `<th>${col.title}</th>`).join('');
      const sampleRowHTML = columns.map(() => '<td>Sample Data</td>').join('');
      
      return `
        <div>
          <h3>${block.properties.title || 'Data Table'}</h3>
          <table>
            <thead>
              <tr>${headerHTML}</tr>
            </thead>
            <tbody>
              <tr>${sampleRowHTML}</tr>
              <tr>${sampleRowHTML}</tr>
            </tbody>
          </table>
        </div>
      `;
      
    case 'auth-form':
      const authType = block.properties.authType || 'login';
      const formTitle = authType === 'register' ? 'Sign Up' : 
                       authType === 'reset' ? 'Reset Password' : 'Sign In';
      const buttonText = authType === 'register' ? 'Create Account' : 
                        authType === 'reset' ? 'Reset Password' : 'Sign In';
      
      return `
        <div class="auth-form">
          <h3>${formTitle}</h3>
          <form>
            <input type="email" placeholder="Email" required>
            <input type="password" placeholder="Password" required>
            ${authType === 'register' ? '<input type="password" placeholder="Confirm Password" required>' : ''}
            <button type="submit">${buttonText}</button>
          </form>
        </div>
      `;
      
    case 'text':
      return `
        <div class="text-block">
          <h3>${block.properties.title || 'Text Block'}</h3>
          <p>${block.properties.subtitle || 'Your text content goes here.'}</p>
        </div>
      `;
      
    case 'button':
      return `
        <div style="text-align: center;">
          <button type="button">${block.properties.buttonText || 'Click Me'}</button>
        </div>
      `;
      
    default:
      return '<div>Unknown block type</div>';
  }
};
