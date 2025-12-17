import { useState, useRef, useCallback } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

export const useHistory = (onSave?: (data: any) => void) => {
    const [history, setHistory] = useState<string[]>([]);
    const isHistoryLocked = useRef(false);
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);

    const saveState = useCallback((canvas: FabricCanvas) => {
        if (isHistoryLocked.current) return;
        
        const jsonObj = canvas.toJSON();
        const jsonString = JSON.stringify(jsonObj);
        
        setHistory((prev) => {
            if (prev.length > 0 && prev[prev.length - 1] === jsonString) return prev;
            const newHistory = [...prev, jsonString];
            if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
            return newHistory;
        });

        if (onSave) {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
            saveTimeout.current = setTimeout(() => {
                onSave(jsonObj);
            }, 1000); 
        }
    }, [onSave]);

    const undo = useCallback((canvas: FabricCanvas, updateLayers: (c: FabricCanvas) => void) => {
        if (!canvas || history.length <= 1) return;
        
        isHistoryLocked.current = true;
        const newHistory = [...history];
        newHistory.pop(); 
        const prevState = newHistory[newHistory.length - 1];
        
        if (prevState) {
            const parsed = JSON.parse(prevState);
            canvas.loadFromJSON(prevState, () => {
                if (!canvas.backgroundColor) canvas.backgroundColor = parsed.backgroundColor || '#ffffff';
                canvas.renderAll();
                setHistory(newHistory);
                updateLayers(canvas);
                isHistoryLocked.current = false;
            });
        } else {
            isHistoryLocked.current = false;
        }
    }, [history]);

    return { history, setHistory, saveState, undo };
};