import { Canvas as FabricCanvas } from 'fabric';

export const generateId = (type: string, canvas: FabricCanvas) => {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${canvas.getObjects().length + 1}`;
};