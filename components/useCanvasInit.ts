import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Point, IEvent } from 'fabric';
import { Tool } from './types';

interface UseCanvasInitProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    initialData?: any;
    selectedTool: Tool;
    saveState: (canvas: FabricCanvas) => void;
    updateLayers: (canvas: FabricCanvas) => void;
    onSelectionChange?: (obj: any) => void;
    setHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useCanvasInit = ({
    containerRef,
    canvasRef,
    initialData,
    selectedTool,
    saveState,
    updateLayers,
    onSelectionChange,
    setHistory
}: UseCanvasInitProps) => {
    const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
    const isPanning = useRef(false);
    const lastPosX = useRef(0);
    const lastPosY = useRef(0);

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;
        
        const canvas = new FabricCanvas(canvasRef.current, {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            backgroundColor: '#ffffff',
            selection: true,
            controlsAboveOverlay: true,
            preserveObjectStacking: true, 
        });

        setFabricCanvas(canvas);

        if (initialData) {
            canvas.loadFromJSON(initialData, () => {
                canvas.renderAll();
                const initialJson = JSON.stringify(canvas.toJSON(['id', 'backgroundColor']));
                setHistory([initialJson]);
                updateLayers(canvas);
            });
        } else {
            setHistory([JSON.stringify(canvas.toJSON(['id', 'backgroundColor']))]);
        }

        // Cleanup
        return () => {
            canvas.dispose();
        }
    }, [initialData, canvasRef, containerRef, setHistory]); // eslint-disable-line react-hooks/exhaustive-deps

    // Event Listeners (Zoom, Pan, Resize, Selection)
    useEffect(() => {
        if (!fabricCanvas || !containerRef.current) return;

        const handleResize = () => {
             if(!containerRef.current) return;
             fabricCanvas.setDimensions({ 
                 width: containerRef.current.clientWidth, 
                 height: containerRef.current.clientHeight 
             });
        };

        const handleSelection = (e: Partial<IEvent>) => {
            // @ts-ignore
           const obj = e.selected ? e.selected[0] : null;
           if (onSelectionChange) onSelectionChange(obj);
       };
       
       const handleChange = () => { 
           saveState(fabricCanvas); 
           updateLayers(fabricCanvas); 
       };

        // Attach listeners
        window.addEventListener('resize', handleResize);
        fabricCanvas.on('selection:created', handleSelection);
        fabricCanvas.on('selection:updated', handleSelection);
        fabricCanvas.on('selection:cleared', () => onSelectionChange && onSelectionChange(null));
        
        fabricCanvas.on('object:modified', handleChange);
        fabricCanvas.on('object:added', handleChange);
        fabricCanvas.on('object:removed', handleChange);
        fabricCanvas.on('path:created', handleChange);

        // Zoom Logic
        fabricCanvas.on('mouse:wheel', (opt) => {
            const evt = opt.e;
            if (evt.ctrlKey || evt.metaKey) {
                evt.preventDefault();
                evt.stopPropagation();
                let delta = evt.deltaY;
                let zoom = fabricCanvas.getZoom();
                zoom *= 0.999 ** delta;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;
                fabricCanvas.zoomToPoint(new Point(evt.offsetX, evt.offsetY), zoom);
            } else {
                evt.preventDefault();
                evt.stopPropagation();
                const vpt = fabricCanvas.viewportTransform;
                if(!vpt) return;
                vpt[4] -= evt.deltaX;
                vpt[5] -= evt.deltaY;
                fabricCanvas.requestRenderAll();
            }
        });

        // Pan Logic Down
        fabricCanvas.on('mouse:down', (opt) => {
            const evt = opt.e;
            if (selectedTool === 'hand' || (evt as MouseEvent).buttons === 4) {
                isPanning.current = true;
                fabricCanvas.selection = false;
                lastPosX.current = evt.clientX;
                lastPosY.current = evt.clientY;
                fabricCanvas.defaultCursor = 'grabbing';
            }
        });

        // Pan Logic Move
        fabricCanvas.on('mouse:move', (opt) => {
            if (isPanning.current) {
                const e = opt.e;
                const vpt = fabricCanvas.viewportTransform;
                if(vpt) {
                    vpt[4] += e.clientX - lastPosX.current;
                    vpt[5] += e.clientY - lastPosY.current;
                    fabricCanvas.requestRenderAll();
                    lastPosX.current = e.clientX;
                    lastPosY.current = e.clientY;
                }
            }
        });

        // Pan Logic Up
        fabricCanvas.on('mouse:up', () => {
            isPanning.current = false;
            if (selectedTool === 'hand') fabricCanvas.defaultCursor = 'grab';
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            fabricCanvas.off('selection:created', handleSelection);
            fabricCanvas.off('selection:updated', handleSelection);
            fabricCanvas.off('selection:cleared');
            fabricCanvas.off('object:modified', handleChange);
            fabricCanvas.off('object:added', handleChange);
            fabricCanvas.off('object:removed', handleChange);
            fabricCanvas.off('path:created', handleChange);
            fabricCanvas.off('mouse:wheel');
            fabricCanvas.off('mouse:down');
            fabricCanvas.off('mouse:move');
            fabricCanvas.off('mouse:up');
        }
    }, [fabricCanvas, selectedTool, saveState, updateLayers, onSelectionChange, containerRef]);

    // Handle Tool Cursors and Selectability
    useEffect(() => {
        if (!fabricCanvas) return;
        fabricCanvas.selection = selectedTool === 'select';
        fabricCanvas.forEachObject((obj) => {
            if (selectedTool === 'hand') { obj.selectable = false; obj.evented = false; }
            else if (selectedTool !== 'select') { obj.selectable = false; obj.evented = false; }
            else if (!obj.lockMovementX) { obj.selectable = true; obj.evented = true; }
        });
        
        if (selectedTool === 'hand') fabricCanvas.defaultCursor = 'grab';
        else if (selectedTool === 'select') fabricCanvas.defaultCursor = 'default';
        else fabricCanvas.defaultCursor = 'crosshair';
        
        fabricCanvas.requestRenderAll();
    }, [selectedTool, fabricCanvas]);

    return fabricCanvas;
};