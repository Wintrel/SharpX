import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, Rect, Circle, Triangle, Line, TPointerEventInfo } from 'fabric';
import { Tool, TPointerEvent } from './types';
import { generateId } from './utils';

export const useDrawing = (
    fabricCanvas: FabricCanvas | null,
    selectedTool: Tool,
    setSelectedTool: (t: Tool) => void,
    saveState: (c: FabricCanvas) => void,
    updateLayers: (c: FabricCanvas) => void
) => {
    const isDrawing = useRef(false);
    const startPoint = useRef<{ x: number; y: number } | null>(null);
    const currentShape = useRef<Rect | Circle | Triangle | Line | null>(null);

    useEffect(() => {
        if (!fabricCanvas) return;

        const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
            const drawingTools = ['rectangle', 'square', 'circle', 'triangle', 'line'];
            if(!drawingTools.includes(selectedTool)) return;

            isDrawing.current = true;
            const pointer = fabricCanvas.getPointer(opt.e);
            startPoint.current = { x: pointer.x, y: pointer.y };
            fabricCanvas.discardActiveObject();

            let shape: Rect | Circle | Triangle | Line | null = null;
            const commonProps = {
                left: pointer.x, top: pointer.y,
                fill: '#e4e4e7', stroke: '#18181b', strokeWidth: 2,
                selectable: false, evented: false, 
                originX: 'left', originY: 'top',
            };

            if (selectedTool === 'rectangle' || selectedTool === 'square') shape = new Rect({ ...commonProps, width: 0, height: 0 });
            else if (selectedTool === 'circle') shape = new Circle({ ...commonProps, radius: 0 });
            else if (selectedTool === 'triangle') shape = new Triangle({ ...commonProps, width: 0, height: 0 });
            else if (selectedTool === 'line') shape = new Line([pointer.x, pointer.y, pointer.x, pointer.y], { ...commonProps, fill: undefined });

            if (shape) {
                // @ts-ignore
                shape.id = generateId(selectedTool, fabricCanvas);
                fabricCanvas.add(shape);
                currentShape.current = shape;
            }
        };
        
        const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
            if (!isDrawing.current || !currentShape.current || !startPoint.current) return;
            const pointer = fabricCanvas.getPointer(opt.e);
            const {x:startX, y:startY} = startPoint.current;
            
            if (['rectangle', 'square', 'triangle', 'circle'].includes(selectedTool)){
                let width = Math.abs(pointer.x - startX);
                let height = Math.abs(pointer.y - startY);
                let left = Math.min(pointer.x, startX);
                let top = Math.min(pointer.y, startY);

                if (selectedTool === 'square') {
                     const size = Math.max(width, height);
                     if (pointer.x < startX) left = startX - size;
                     if (pointer.y < startY) top = startY - size;
                     width = size; height = size;
                }
                
                if (selectedTool === 'circle') {
                    const radius = Math.max(width, height) / 2;
                    (currentShape.current as Circle).set({ radius: radius, left: left, top: top });
                } else {
                    currentShape.current.set({ width, height, left, top });
                }
            } else if (selectedTool === 'line'){
                (currentShape.current as Line).set({ x2: pointer.x, y2: pointer.y });
            }
            fabricCanvas.requestRenderAll();
        };

        const handleMouseUp = () => {
            if (isDrawing.current && currentShape.current) {
                currentShape.current.setCoords();
                if ((currentShape.current.width || 0) < 5 && (currentShape.current.height || 0) < 5 && selectedTool !== 'line') {
                    fabricCanvas.remove(currentShape.current);
                } else {
                    saveState(fabricCanvas);
                    updateLayers(fabricCanvas);
                }
                setSelectedTool('select'); 
            }
            isDrawing.current = false;
            currentShape.current = null;
        };
        
        fabricCanvas.on('mouse:down', handleMouseDown);
        fabricCanvas.on('mouse:move', handleMouseMove);
        fabricCanvas.on('mouse:up', handleMouseUp);
        
        return () => {
            fabricCanvas.off('mouse:down', handleMouseDown);
            fabricCanvas.off('mouse:move', handleMouseMove);
            fabricCanvas.off('mouse:up', handleMouseUp);
        };
    }, [fabricCanvas, selectedTool, saveState, updateLayers, setSelectedTool]);
};