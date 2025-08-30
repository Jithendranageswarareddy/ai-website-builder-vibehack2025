import { useState, useEffect, useCallback, useRef } from 'react';
import { Component } from '@/pages/Builder';

export interface LivePreviewState {
  components: Component[];
  styles: Record<string, any>;
  isLive: boolean;
  lastUpdate: number;
  previewMode: 'desktop' | 'tablet' | 'mobile';
}

export const useRealtimeLivePreview = (initialComponents: Component[] = []) => {
  const [previewState, setPreviewState] = useState<LivePreviewState>({
    components: initialComponents,
    styles: {},
    isLive: true,
    lastUpdate: Date.now(),
    previewMode: 'desktop'
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Array<{ id: string; updates: Partial<Component> }>>([]);
  
  const updateQueue = useRef<Array<() => void>>([]);
  const animationFrame = useRef<number>();

  // Debounced update system for smooth real-time updates
  const processUpdateQueue = useCallback(() => {
    if (updateQueue.current.length > 0) {
      setIsUpdating(true);
      
      // Process all queued updates in a single batch
      const updates = updateQueue.current.splice(0);
      updates.forEach(update => update());
      
      setPreviewState(prev => ({
        ...prev,
        lastUpdate: Date.now()
      }));

      // Reset updating state after animation
      setTimeout(() => setIsUpdating(false), 100);
    }
  }, []);

  // Schedule update processing
  const scheduleUpdate = useCallback((updateFn: () => void) => {
    updateQueue.current.push(updateFn);
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(() => {
      processUpdateQueue();
    });
  }, [processUpdateQueue]);

  // Update component in real-time
  const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
    scheduleUpdate(() => {
      setPreviewState(prev => ({
        ...prev,
        components: prev.components.map(comp =>
          comp.id === id ? { ...comp, ...updates } : comp
        )
      }));
    });

    // Track pending update for UI feedback
    setPendingUpdates(prev => {
      const filtered = prev.filter(u => u.id !== id);
      return [...filtered, { id, updates }];
    });

    // Clear pending update after a short delay
    setTimeout(() => {
      setPendingUpdates(prev => prev.filter(u => u.id !== id));
    }, 300);
  }, [scheduleUpdate]);

  // Add component with animation
  const addComponent = useCallback((component: Component) => {
    scheduleUpdate(() => {
      setPreviewState(prev => ({
        ...prev,
        components: [...prev.components, component]
      }));
    });
  }, [scheduleUpdate]);

  // Remove component with animation
  const removeComponent = useCallback((id: string) => {
    scheduleUpdate(() => {
      setPreviewState(prev => ({
        ...prev,
        components: prev.components.filter(comp => comp.id !== id)
      }));
    });
  }, [scheduleUpdate]);

  // Bulk update components (for collaboration sync)
  const syncComponents = useCallback((components: Component[]) => {
    scheduleUpdate(() => {
      setPreviewState(prev => ({
        ...prev,
        components
      }));
    });
  }, [scheduleUpdate]);

  // Update global styles
  const updateGlobalStyles = useCallback((styles: Record<string, any>) => {
    scheduleUpdate(() => {
      setPreviewState(prev => ({
        ...prev,
        styles: { ...prev.styles, ...styles }
      }));
    });
  }, [scheduleUpdate]);

  // Change preview mode with smooth transition
  const setPreviewMode = useCallback((mode: LivePreviewState['previewMode']) => {
    setPreviewState(prev => ({
      ...prev,
      previewMode: mode,
      lastUpdate: Date.now()
    }));
  }, []);

  // Toggle live preview
  const toggleLivePreview = useCallback(() => {
    setPreviewState(prev => ({
      ...prev,
      isLive: !prev.isLive,
      lastUpdate: Date.now()
    }));
  }, []);

  // Generate live CSS styles
  const generateLiveCSS = useCallback(() => {
    const componentStyles = previewState.components.map(component => {
      const { id, style } = component;
      const cssProperties = Object.entries(style)
        .map(([key, value]) => {
          // Convert camelCase to kebab-case
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `  ${cssKey}: ${value};`;
        })
        .join('\n');

      return `#${id} {\n${cssProperties}\n}`;
    }).join('\n\n');

    const globalStyles = Object.entries(previewState.styles)
      .map(([selector, styles]) => {
        const cssProperties = Object.entries(styles as Record<string, any>)
          .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `  ${cssKey}: ${value};`;
          })
          .join('\n');
        return `${selector} {\n${cssProperties}\n}`;
      })
      .join('\n\n');

    return `${globalStyles}\n\n${componentStyles}`;
  }, [previewState.components, previewState.styles]);

  // Generate responsive styles based on preview mode
  const getResponsiveStyles = useCallback(() => {
    const baseStyles = {
      transition: 'all 0.3s ease',
      transform: 'scale(1)',
      transformOrigin: 'top left'
    };

    switch (previewState.previewMode) {
      case 'tablet':
        return {
          ...baseStyles,
          width: '768px',
          transform: 'scale(0.8)'
        };
      case 'mobile':
        return {
          ...baseStyles,
          width: '375px',
          transform: 'scale(0.9)'
        };
      default: // desktop
        return {
          ...baseStyles,
          width: '100%'
        };
    }
  }, [previewState.previewMode]);

  // Get component by ID with pending updates applied
  const getComponent = useCallback((id: string): Component | undefined => {
    const component = previewState.components.find(comp => comp.id === id);
    if (!component) return undefined;

    const pendingUpdate = pendingUpdates.find(u => u.id === id);
    return pendingUpdate ? { ...component, ...pendingUpdate.updates } : component;
  }, [previewState.components, pendingUpdates]);

  // Get components with visual indicators for pending updates
  const getComponentsWithStatus = useCallback(() => {
    return previewState.components.map(component => ({
      ...component,
      isPending: pendingUpdates.some(u => u.id === component.id),
      isUpdating: pendingUpdates.some(u => u.id === component.id)
    }));
  }, [previewState.components, pendingUpdates]);

  // Auto-save mechanism
  useEffect(() => {
    if (!previewState.isLive) return;

    const autoSaveInterval = setInterval(() => {
      // Auto-save to localStorage for persistence
      localStorage.setItem('livePreview', JSON.stringify({
        components: previewState.components,
        styles: previewState.styles,
        previewMode: previewState.previewMode
      }));
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [previewState]);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('livePreview');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreviewState(prev => ({
          ...prev,
          ...parsed,
          isLive: true,
          lastUpdate: Date.now()
        }));
      }
    } catch (error) {
      console.warn('Failed to load saved preview state:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return {
    // State
    previewState,
    isUpdating,
    pendingUpdates: pendingUpdates.length,
    
    // Component operations
    updateComponent,
    addComponent,
    removeComponent,
    syncComponents,
    getComponent,
    getComponentsWithStatus,
    
    // Global operations
    updateGlobalStyles,
    setPreviewMode,
    toggleLivePreview,
    
    // CSS generation
    generateLiveCSS,
    getResponsiveStyles,
    
    // Utilities
    clearPreview: () => setPreviewState(prev => ({
      ...prev,
      components: [],
      styles: {},
      lastUpdate: Date.now()
    })),
    
    exportPreview: () => ({
      components: previewState.components,
      styles: previewState.styles,
      css: generateLiveCSS(),
      timestamp: Date.now()
    })
  };
};
