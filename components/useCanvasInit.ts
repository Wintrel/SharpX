import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Point, TEvent, Textbox } from 'fabric';
import { Tool } from './types';
import { generateId } from './utils';

// Matching keys from useHistory
const JSON_KEYS = [
    'id', 'selectable', 'evented', 
    'lockMovementX', 'lockMovementY', 
    'lockRotation', 'lockScalingX', 'lockScalingY',
    'viewportTransform',
    'lockUniScaling'
];

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
            canvas.loadFromJSON(initialData).then(() => {
                if (initialData.viewportTransform) {
                    canvas.setViewportTransform(initialData.viewportTransform);
                }
                
                // Ensure IDs exist
                canvas.forEachObject((obj) => {
                    // @ts-ignore
                    if (!obj.id) {
                        // @ts-ignore
                        obj.id = generateId(obj.type, canvas);
                    }
                    if (obj.type === 'textbox') {
                        obj.set('lockUniScaling', true);
                    }
                });

                canvas.renderAll();
                
                const initialObj = (canvas as any).toJSON(JSON_KEYS);
                if (canvas.viewportTransform) initialObj.viewportTransform = canvas.viewportTransform;
                
                setHistory([JSON.stringify(initialObj)]);
                updateLayers(canvas);
            });
        } else {
            const initialObj = (canvas as any).toJSON(JSON_KEYS);
            if (canvas.viewportTransform) initialObj.viewportTransform = canvas.viewportTransform;
            setHistory([JSON.stringify(initialObj)]);
        }

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

        const handleSelection = (e: Partial<TEvent>) => {
            // @ts-ignore
           const obj = e.selected ? e.selected[0] : null;
           if (onSelectionChange) onSelectionChange(obj);
       };
       
       const handleChange = (e?: any) => { 
           // Normalize Text Scaling
           const obj = e?.target;
           if (obj && obj.type === 'textbox') {
                const scaleX = obj.scaleX || 1;
                const scaleY = obj.scaleY || 1;
                if (Math.abs(scaleX - 1) > 0.001 || Math.abs(scaleY - 1) > 0.001) {
                    const maxScale = Math.max(scaleX, scaleY);
                    obj.set({
                        fontSize: (obj.fontSize || 20) * maxScale,
                        width: (obj.width || 0) * scaleX, 
                        scaleX: 1,
                        scaleY: 1
                    });
                    obj.setCoords();
                }
           }
           saveState(fabricCanvas); 
           updateLayers(fabricCanvas); 
       };

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
            const isMiddleClick = (evt as MouseEvent).button === 1;

            if (selectedTool === 'hand' || isMiddleClick || (evt as MouseEvent).buttons === 4) {
                if (isMiddleClick) {
                    evt.preventDefault();
                    evt.stopPropagation();
                }
                
                isPanning.current = true;
                fabricCanvas.selection = false; 
                
                const clientX = (evt as MouseEvent).clientX || (evt as TouchEvent).touches?.[0]?.clientX || 0;
                const clientY = (evt as MouseEvent).clientY || (evt as TouchEvent).touches?.[0]?.clientY || 0;
                lastPosX.current = clientX;
                lastPosY.current = clientY;
                fabricCanvas.defaultCursor = 'grabbing';
            }
        });

        // Pan Logic Move
        fabricCanvas.on('mouse:move', (opt) => {
            if (isPanning.current) {
                const e = opt.e;
                const vpt = fabricCanvas.viewportTransform;
                if(vpt) {
                    const clientX = (e as MouseEvent).clientX || (e as TouchEvent).touches?.[0]?.clientX || 0;
                    const clientY = (e as MouseEvent).clientY || (e as TouchEvent).touches?.[0]?.clientY || 0;
                    vpt[4] += clientX - lastPosX.current;
                    vpt[5] += clientY - lastPosY.current;
                    fabricCanvas.requestRenderAll();
                    lastPosX.current = clientX;
                    lastPosY.current = clientY;
                }
            }
        });

        // Pan Logic Up
        fabricCanvas.on('mouse:up', () => {
            if (isPanning.current) {
                saveState(fabricCanvas);
            }
            isPanning.current = false;
            if (selectedTool === 'select') fabricCanvas.selection = true;
            
            if (selectedTool === 'hand') fabricCanvas.defaultCursor = 'grab';
            else if (selectedTool === 'select') fabricCanvas.defaultCursor = 'default';
            else fabricCanvas.defaultCursor = 'crosshair';
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