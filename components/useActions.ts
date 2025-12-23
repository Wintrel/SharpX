import { Canvas as FabricCanvas, Textbox, FabricImage, Gradient, Pattern, Rect, ActiveSelection } from 'fabric';
import { generateId } from './utils';

export const useActions = (
    fabricCanvas: FabricCanvas | null,
    saveState: (c: FabricCanvas) => void,
    updateLayers: (c: FabricCanvas) => void
) => {
    
    const setBackgroundColor = (color: string) => {
        if (!fabricCanvas) return;
        fabricCanvas.backgroundColor = color;
        fabricCanvas.requestRenderAll();
        saveState(fabricCanvas);
    };

    const addText = (text = "Type here") => {
        if(!fabricCanvas) return;
        const textbox = new Textbox(text, {
            left: fabricCanvas.getCenter().left - 50,
            top: fabricCanvas.getCenter().top,
            fontFamily: 'Inter, sans-serif',
            fill: '#333',
            fontSize: 32,
            width: 200,
            splitByGrapheme: true
        });
        // @ts-ignore
        textbox.id = generateId('Text', fabricCanvas);
        fabricCanvas.add(textbox);
        fabricCanvas.setActiveObject(textbox);
        textbox.enterEditing();
        textbox.selectAll();
        saveState(fabricCanvas);
        updateLayers(fabricCanvas);
    };

    const addImage = (file: File) => {
        if(!fabricCanvas) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            const data = f.target?.result as string;
            const imgObj = new Image();
            imgObj.src = data;
            imgObj.onload = () => {
                const imgInstance = new FabricImage(imgObj);
                const scale = Math.min(
                    (fabricCanvas.width! * 0.5) / imgInstance.width!, 
                    (fabricCanvas.height! * 0.5) / imgInstance.height!
                );
                imgInstance.scale(scale);
                const center = fabricCanvas.getVpCenter();
                imgInstance.set({
                    left: center.x - (imgInstance.getScaledWidth() / 2),
                    top: center.y - (imgInstance.getScaledHeight() / 2)
                });
                // @ts-ignore
                imgInstance.id = generateId('Image', fabricCanvas);
                fabricCanvas.add(imgInstance);
                fabricCanvas.setActiveObject(imgInstance);
                saveState(fabricCanvas);
                updateLayers(fabricCanvas);
            };
        };
        reader.readAsDataURL(file);
    };

    const setFillMode = (mode: 'solid' | 'gradient' | 'image', value: any, style: 'cover' | 'tile' = 'cover') => {
        if(!fabricCanvas) return;
        const obj = fabricCanvas.getActiveObject();
        if(!obj) return;

        if (mode === 'solid') {
            if (obj.type === 'line' || obj.type === 'path') obj.set({ stroke: value });
            else obj.set({ fill: value });
        } 
        else if (mode === 'gradient') {
            const gradient = new Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: obj.width || 0, y2: obj.height || 0 },
                colorStops: [
                    { offset: 0, color: value.start },
                    { offset: 1, color: value.end }
                ]
            });
            obj.set('fill', gradient);
        } 
        else if (mode === 'image') {
            const reader = new FileReader();
            reader.onload = (f) => {
                const imgObj = new Image();
                imgObj.src = f.target?.result as string;
                imgObj.onload = () => {
                    let matrix = undefined;
                    if (style === 'cover') {
                        const objW = obj.width || 0;
                        const objH = obj.height || 0;
                        const imgW = imgObj.width;
                        const imgH = imgObj.height;
                        const scaleX = objW / imgW;
                        const scaleY = objH / imgH;
                        const scale = Math.max(scaleX, scaleY);
                        const w = imgW * scale;
                        const h = imgH * scale;
                        const dx = (objW - w) / 2;
                        const dy = (objH - h) / 2;
                        matrix = [scale, 0, 0, scale, dx, dy];
                    }
                    const pattern = new Pattern({
                        source: imgObj,
                        repeat: style === 'tile' ? 'repeat' : 'no-repeat',
                        // @ts-ignore
                        patternTransform: matrix 
                    });
                    obj.set('fill', pattern);
                    fabricCanvas.requestRenderAll();
                    saveState(fabricCanvas);
                }
            };
            if (value instanceof File) reader.readAsDataURL(value);
            return;
        }
        fabricCanvas.requestRenderAll();
        saveState(fabricCanvas);
    };

    const updateSelectedObject = (props: any) => {
        if (!fabricCanvas) return;
        const activeObj = fabricCanvas.getActiveObject();
        if (activeObj) {
            activeObj.set(props);
            if (props.cornerRadius !== undefined && activeObj.type === 'rect') {
                (activeObj as Rect).set({ rx: props.cornerRadius, ry: props.cornerRadius });
            }
            fabricCanvas.requestRenderAll();
            saveState(fabricCanvas);
        }
    };

    const deleteSelected = () => {
        if (!fabricCanvas) return;
        const activeObj = fabricCanvas.getActiveObject();
        if (activeObj && !(activeObj instanceof Textbox && activeObj.isEditing)) {
            const objects = activeObj instanceof ActiveSelection ? activeObj.getObjects() : [activeObj];
            objects.forEach(obj => fabricCanvas.remove(obj));
            fabricCanvas.discardActiveObject();
            fabricCanvas.requestRenderAll();
            updateLayers(fabricCanvas);
            saveState(fabricCanvas);
        }
    };

    const deleteLayer = (id: string) => {
        if (!fabricCanvas) return;
        // @ts-ignore
        const obj = fabricCanvas.getObjects().find(o => o.id === id);
        if (obj) {
            if (fabricCanvas.getActiveObject() === obj) {
                fabricCanvas.discardActiveObject();
            }
            fabricCanvas.remove(obj);
            fabricCanvas.requestRenderAll();
            updateLayers(fabricCanvas);
            saveState(fabricCanvas);
        }
    };

    const duplicateSelected = async () => {
        if (!fabricCanvas) return;
        const activeObj = fabricCanvas.getActiveObject();
        if (!activeObj) return;

        const cloned = await activeObj.clone();
        fabricCanvas.discardActiveObject();
        cloned.set({
            left: (cloned.left || 0) + 20,
            top: (cloned.top || 0) + 20,
            evented: true,
        });

        if (cloned instanceof ActiveSelection) {
            cloned.canvas = fabricCanvas;
            cloned.forEachObject((obj) => {
                fabricCanvas.add(obj);
                // @ts-ignore
                if (!obj.id) obj.id = generateId(obj.type, fabricCanvas);
            });
            cloned.setCoords();
        } else {
            // @ts-ignore
            cloned.id = generateId(cloned.type, fabricCanvas);
            fabricCanvas.add(cloned);
        }
        
        fabricCanvas.setActiveObject(cloned);
        fabricCanvas.requestRenderAll();
        updateLayers(fabricCanvas);
        saveState(fabricCanvas);
    };

    const alignSelected = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
        if (!fabricCanvas) return;
        const activeObj = fabricCanvas.getActiveObject();
        if (!activeObj) return;
        
        const canvasW = fabricCanvas.width || 0;
        const canvasH = fabricCanvas.height || 0;
        const objW = activeObj.getScaledWidth();
        const objH = activeObj.getScaledHeight();

        switch (alignment) {
            case 'left': activeObj.set({ left: 0 }); break;
            case 'center': activeObj.set({ left: (canvasW - objW) / 2 }); break;
            case 'right': activeObj.set({ left: canvasW - objW }); break;
            case 'top': activeObj.set({ top: 0 }); break;
            case 'middle': activeObj.set({ top: (canvasH - objH) / 2 }); break;
            case 'bottom': activeObj.set({ top: canvasH - objH }); break;
        }
        activeObj.setCoords();
        fabricCanvas.requestRenderAll();
        saveState(fabricCanvas);
    };

    const toggleLayerVisibility = (index: number) => {
        if (!fabricCanvas) return;
        const objs = fabricCanvas.getObjects();
        const obj = objs[objs.length - 1 - index];
        if(obj) {
            obj.visible = !obj.visible;
            if(!obj.visible) fabricCanvas.discardActiveObject();
            fabricCanvas.requestRenderAll();
            updateLayers(fabricCanvas);
        }
    };

    const toggleLayerLock = (index: number) => {
        if (!fabricCanvas) return;
        const objs = fabricCanvas.getObjects();
        const obj = objs[objs.length - 1 - index];
        if(obj) {
            const isLocked = !obj.lockMovementX; 
            obj.set({
                lockMovementX: isLocked, lockMovementY: isLocked,
                lockRotation: isLocked, lockScalingX: isLocked, lockScalingY: isLocked,
                selectable: !isLocked, evented: !isLocked
            });
            fabricCanvas.discardActiveObject();
            fabricCanvas.requestRenderAll();
            updateLayers(fabricCanvas);
        }
    };

    const moveLayer = (index: number, direction: 'up' | 'down') => {
        if (!fabricCanvas) return;
        const objs = fabricCanvas.getObjects();
        const obj = objs[objs.length - 1 - index];
        if(!obj) return;

        if (direction === 'up') fabricCanvas.bringObjectForward(obj);
        else fabricCanvas.sendObjectBackwards(obj);
        
        fabricCanvas.requestRenderAll();
        requestAnimationFrame(() => {
            updateLayers(fabricCanvas);
            saveState(fabricCanvas);
        });
    };

    const download = () => {
        if (!fabricCanvas) return;
        const dataURL = fabricCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 3 });
        const link = document.createElement('a');
        link.download = `canvas_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
   };

   const clear = () => {
       if (!fabricCanvas) return;
       if (!fabricCanvas.getContext()) return;
       
       // FIX: Save the current background color before clearing
       const currentBg = fabricCanvas.backgroundColor;
       
       fabricCanvas.clear();
       
       // FIX: Restore the background color instead of resetting to white
       fabricCanvas.backgroundColor = currentBg || '#ffffff';
       
       fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]); 
       fabricCanvas.renderAll();
       saveState(fabricCanvas);
       updateLayers(fabricCanvas);
   };

   return {
       setBackgroundColor,
       addText,
       addImage,
       setFillMode,
       updateSelectedObject,
       deleteSelected,
       deleteLayer,
       duplicateSelected,
       alignSelected,
       toggleLayerVisibility,
       toggleLayerLock,
       moveLayer,
       download,
       clear
   };
};