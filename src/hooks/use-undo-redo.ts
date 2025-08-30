import { useState, useCallback, useRef } from "react";

interface HistoryState<T> {
  data: T;
  timestamp: Date;
  action: string;
  id: string;
}

interface UseUndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

export const useUndoRedo = <T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
) => {
  const {
    maxHistorySize = 50,
    debounceMs = 500
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<HistoryState<T>[]>([
    {
      data: initialState,
      timestamp: new Date(),
      action: 'Initial state',
      id: 'initial'
    }
  ]);

  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingStateRef = useRef<T | null>(null);
  const pendingActionRef = useRef<string>('');

  const getCurrentState = useCallback(() => {
    return history[currentIndex]?.data || initialState;
  }, [history, currentIndex, initialState]);

  const pushToHistory = useCallback((newState: T, action: string, immediate = false) => {
    const executeAdd = () => {
      setHistory(prevHistory => {
        const newEntry: HistoryState<T> = {
          data: newState,
          timestamp: new Date(),
          action,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        // Remove any future states if we're not at the end
        const truncatedHistory = prevHistory.slice(0, currentIndex + 1);
        
        // Add new state
        const newHistory = [...truncatedHistory, newEntry];
        
        // Limit history size
        const limitedHistory = newHistory.length > maxHistorySize
          ? newHistory.slice(-maxHistorySize)
          : newHistory;

        return limitedHistory;
      });

      setCurrentIndex(prevIndex => {
        const newHistoryLength = Math.min(history.length + 1, maxHistorySize);
        return newHistoryLength - 1;
      });
    };

    if (immediate || debounceMs === 0) {
      executeAdd();
    } else {
      // Store pending state for debouncing
      pendingStateRef.current = newState;
      pendingActionRef.current = action;

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        if (pendingStateRef.current !== null) {
          executeAdd();
          pendingStateRef.current = null;
          pendingActionRef.current = '';
        }
      }, debounceMs);
    }
  }, [currentIndex, history.length, maxHistorySize, debounceMs]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
      return history[currentIndex - 1]?.data;
    }
    return getCurrentState();
  }, [currentIndex, history, getCurrentState]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
      return history[currentIndex + 1]?.data;
    }
    return getCurrentState();
  }, [currentIndex, history, getCurrentState]);

  const goToState = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      setCurrentIndex(index);
      return history[index]?.data;
    }
    return getCurrentState();
  }, [history, getCurrentState]);

  const clearHistory = useCallback((newInitialState?: T) => {
    const initialData = newInitialState || initialState;
    setHistory([{
      data: initialData,
      timestamp: new Date(),
      action: 'History cleared',
      id: 'cleared_' + Date.now()
    }]);
    setCurrentIndex(0);
  }, [initialState]);

  const getHistoryInfo = useCallback(() => {
    return {
      canUndo: currentIndex > 0,
      canRedo: currentIndex < history.length - 1,
      currentIndex,
      historyLength: history.length,
      currentAction: history[currentIndex]?.action || '',
      undoAction: currentIndex > 0 ? history[currentIndex - 1]?.action : null,
      redoAction: currentIndex < history.length - 1 ? history[currentIndex + 1]?.action : null
    };
  }, [currentIndex, history]);

  const getFullHistory = useCallback(() => {
    return history.map((state, index) => ({
      ...state,
      isCurrent: index === currentIndex
    }));
  }, [history, currentIndex]);

  return {
    currentState: getCurrentState(),
    pushToHistory,
    undo,
    redo,
    goToState,
    clearHistory,
    getHistoryInfo,
    getFullHistory,
    history: getFullHistory()
  };
};

// Hook for managing canvas block operations with undo/redo
export const useCanvasHistory = (initialBlocks: any[] = []) => {
  const {
    currentState: blocks,
    pushToHistory,
    undo,
    redo,
    getHistoryInfo,
    getFullHistory,
    clearHistory
  } = useUndoRedo(initialBlocks, {
    maxHistorySize: 100,
    debounceMs: 1000
  });

  const updateBlocks = useCallback((newBlocks: any[], action: string) => {
    pushToHistory(newBlocks, action);
  }, [pushToHistory]);

  const addBlock = useCallback((block: any) => {
    const newBlocks = [...blocks, block];
    pushToHistory(newBlocks, `Added ${block.type} block`, true);
    return newBlocks;
  }, [blocks, pushToHistory]);

  const removeBlock = useCallback((blockId: string) => {
    const blockToRemove = blocks.find(b => b.id === blockId);
    const newBlocks = blocks.filter(b => b.id !== blockId);
    pushToHistory(newBlocks, `Removed ${blockToRemove?.type || 'block'}`, true);
    return newBlocks;
  }, [blocks, pushToHistory]);

  const updateBlock = useCallback((blockId: string, updates: any) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    const block = blocks.find(b => b.id === blockId);
    pushToHistory(newBlocks, `Updated ${block?.type || 'block'}`);
    return newBlocks;
  }, [blocks, pushToHistory]);

  const moveBlock = useCallback((blockId: string, newPosition: { x: number; y: number }) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId 
        ? { ...block, position: newPosition }
        : block
    );
    pushToHistory(newBlocks, 'Moved block', true);
    return newBlocks;
  }, [blocks, pushToHistory]);

  const duplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find(b => b.id === blockId);
    if (blockToDuplicate) {
      const duplicatedBlock = {
        ...blockToDuplicate,
        id: `${blockToDuplicate.id}_copy_${Date.now()}`,
        position: {
          x: blockToDuplicate.position.x + 20,
          y: blockToDuplicate.position.y + 20
        }
      };
      const newBlocks = [...blocks, duplicatedBlock];
      pushToHistory(newBlocks, `Duplicated ${blockToDuplicate.type} block`, true);
      return newBlocks;
    }
    return blocks;
  }, [blocks, pushToHistory]);

  return {
    blocks,
    updateBlocks,
    addBlock,
    removeBlock,
    updateBlock,
    moveBlock,
    duplicateBlock,
    undo,
    redo,
    getHistoryInfo,
    getFullHistory,
    clearHistory
  };
};

// Hook for managing database schema with undo/redo
export const useSchemaHistory = (initialTables: any[] = []) => {
  const {
    currentState: tables,
    pushToHistory,
    undo,
    redo,
    getHistoryInfo,
    getFullHistory,
    clearHistory
  } = useUndoRedo(initialTables, {
    maxHistorySize: 50,
    debounceMs: 1500
  });

  const updateTables = useCallback((newTables: any[], action: string) => {
    pushToHistory(newTables, action);
  }, [pushToHistory]);

  const addTable = useCallback((table: any) => {
    const newTables = [...tables, table];
    pushToHistory(newTables, `Added table ${table.name}`, true);
    return newTables;
  }, [tables, pushToHistory]);

  const removeTable = useCallback((tableId: string) => {
    const tableToRemove = tables.find(t => t.id === tableId);
    const newTables = tables.filter(t => t.id !== tableId);
    pushToHistory(newTables, `Removed table ${tableToRemove?.name || 'unknown'}`, true);
    return newTables;
  }, [tables, pushToHistory]);

  const updateTable = useCallback((tableId: string, updates: any) => {
    const newTables = tables.map(table => 
      table.id === tableId ? { ...table, ...updates } : table
    );
    const table = tables.find(t => t.id === tableId);
    pushToHistory(newTables, `Updated table ${table?.name || 'unknown'}`);
    return newTables;
  }, [tables, pushToHistory]);

  const addColumn = useCallback((tableId: string, column: any) => {
    const newTables = tables.map(table =>
      table.id === tableId
        ? { ...table, columns: [...(table.columns || []), column] }
        : table
    );
    const table = tables.find(t => t.id === tableId);
    pushToHistory(newTables, `Added column ${column.name} to ${table?.name}`, true);
    return newTables;
  }, [tables, pushToHistory]);

  const removeColumn = useCallback((tableId: string, columnId: string) => {
    const table = tables.find(t => t.id === tableId);
    const column = table?.columns?.find((c: any) => c.id === columnId);
    const newTables = tables.map(table =>
      table.id === tableId
        ? { ...table, columns: (table.columns || []).filter((c: any) => c.id !== columnId) }
        : table
    );
    pushToHistory(newTables, `Removed column ${column?.name} from ${table?.name}`, true);
    return newTables;
  }, [tables, pushToHistory]);

  return {
    tables,
    updateTables,
    addTable,
    removeTable,
    updateTable,
    addColumn,
    removeColumn,
    undo,
    redo,
    getHistoryInfo,
    getFullHistory,
    clearHistory
  };
};
