import { Object as FabricObject } from 'fabric';

export type Tool = 'select' | 'rectangle' | 'square' | 'circle' | 'triangle' | 'line' | 'text' | 'image' | 'hand';

export type TPointerEvent = MouseEvent | TouchEvent;

export interface Layer {
    id: string;
    name: string;
    type: string;
    visible: boolean;
    locked: boolean;
}

export interface CanvasHandle {
    setTool: (tool: Tool) => void;
    setBackgroundColor: (color: string) => void;
    updateSelectedObject: (props: any) => void;
    setFillMode: (mode: 'solid' | 'gradient' | 'image', value: any, style?: 'cover' | 'tile') => void;
    addText: (text?: string) => void;
    addImage: (file: File) => void;
    deleteSelected: () => void;
    duplicateSelected: () => void;
    alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
    undo: () => void;
    download: () => void;
    clear: () => void;
    toggleLayerVisibility: (index: number) => void;
    toggleLayerLock: (index: number) => void;
    moveLayer: (index: number, direction: 'up' | 'down') => void;
}

export interface CanvasProps {
    initialData?: any; 
    onSave?: (data: any) => void; 
    onSelectionChange?: (obj: FabricObject | null) => void;
    onLayerChange?: (layers: Layer[]) => void;
}