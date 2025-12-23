import { useRef, useState, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Tool, CanvasHandle, CanvasProps } from './types';
import { useHistory } from './useHistory';
import { useCanvasInit } from './useCanvasInit';
import { useDrawing } from './useDrawing';
import { useActions } from './useActions';

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(({ onSelectionChange, onLayerChange, initialData, onSave }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
    // 1. State Management
    const [selectedTool, setSelectedTool] = useState<Tool>('select');
    const { history, setHistory, saveState, undo } = useHistory(onSave);

    // 2. Helpers
    const updateLayers = useCallback((canvas: FabricCanvas) => {
        if (!onLayerChange) return;
        const objs = canvas.getObjects();
        const layers = objs.map((obj, i) => ({
            // @ts-ignore
            id: obj.id || i.toString(), 
            // @ts-ignore
            name: obj.id || `${obj.type} ${i + 1}`, 
            type: obj.type,
            visible: obj.visible,
            locked: !!obj.lockMovementX
        })).reverse(); 
        onLayerChange(layers);
    }, [onLayerChange]);

    // 3. Initialize Canvas & Events
    const fabricCanvas = useCanvasInit({
        containerRef,
        canvasRef,
        initialData,
        selectedTool,
        saveState,
        updateLayers,
        onSelectionChange,
        setHistory
    });

    // 4. Drawing Logic
    useDrawing(fabricCanvas, selectedTool, setSelectedTool, saveState, updateLayers);

    // 5. Canvas Actions
    const actions = useActions(fabricCanvas, saveState, updateLayers);

    // 6. External API
    useImperativeHandle(ref, () => ({
        setTool: (tool: Tool) => {
            setSelectedTool(tool);
            if (!fabricCanvas) return;
            fabricCanvas.discardActiveObject();
            fabricCanvas.requestRenderAll();
        },
        undo: () => undo(fabricCanvas!, updateLayers),
        ...actions 
    }));

    // 7. Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!fabricCanvas) return;
            if ((e.key === 'Delete' || e.key === 'Backspace')) {
                actions.deleteSelected();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo(fabricCanvas, updateLayers);
            }
            if((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                actions.duplicateSelected();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fabricCanvas, actions, undo, updateLayers]);

    return (
        <div ref={containerRef} className="w-full h-full relative bg-zinc-100 overflow-hidden">
            <canvas ref={canvasRef} className="block" />
        </div>
    );
});
Canvas.displayName = "Canvas";