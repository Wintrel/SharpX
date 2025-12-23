import React, { useState } from 'react';
import { Toolbar } from '../../components/Toolbar';
import { ActionBar } from '../../components/ActionBar';
import { PropertiesPanel } from '../../components/PropertiesPanel';
import { hexToHsl, hslToHex } from '../../components/colorUtils';

export default function Reductor({ children, whiteboardRef }: { children: React.ReactNode; whiteboardRef: React.RefObject<any> }){
    // UI State
	const [showToolsPanel, setShowToolsPanel] = useState(true);
	const [showPropsPanel, setShowPropsPanel] = useState(true);
	const [activeTool, setActiveTool] = useState("select");
	
    // Data State
	const [layers, setLayers] = useState<any[]>([]);
	const [selectedObject, setSelectedObject] = useState<any>(null);
	const [isShapeSelected, setIsShapeSelected] = useState(false);
	
    // Property State
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [cornerRadius, setCornerRadius] = useState(0);
	const [opacity, setOpacity] = useState(100);
    
    // Color & Fill State
    // We lift activeColorTarget here to ensure we know exactly what we are editing
    const [activeColorTarget, setActiveColorTarget] = useState<'background' | 'fill' | 'gradientStart' | 'gradientEnd'>('background');
    const [selectedColor, setSelectedColor] = useState("#ffffff");
    const [customBgColor, setCustomBgColor] = useState("#ffffff");
	const [customHex, setCustomHex] = useState("#ffffff");
	const [hsl, setHsl] = useState({ h: 0, s: 0, l: 100 });
    const [gradientStart, setGradientStart] = useState('#3b82f6');
    const [gradientEnd, setGradientEnd] = useState('#9333ea');
    const [fillMode, setFillMode] = useState<'solid' | 'gradient' | 'image'>('solid');
    const [imageFillStyle, setImageFillStyle] = useState<'cover' | 'tile'>('cover');

    // --- Helpers ---
    const updateCanvasObject = (props: any) => whiteboardRef.current?.updateSelectedObject(props);

    // --- Handlers ---
    const handleSelectionChange = (obj: any) => {
        if (obj) {
            setSelectedObject(obj);
            setIsShapeSelected(true);
            setStrokeWidth(obj.strokeWidth || 0);
            setOpacity((obj.opacity !== undefined ? obj.opacity : 1) * 100);
            setCornerRadius(obj.rx || 0); 
            
            // Sync Colors
            let targetColor = '#ffffff';
            let newTarget: any = 'fill';

            if(typeof obj.fill === 'string' && obj.fill !== 'transparent' && obj.type !== 'image') {
                 setFillMode('solid');
                 targetColor = obj.fill;
            } else if (typeof obj.fill === 'object' && obj.fill !== null) {
                 if (obj.fill.type === 'linear') {
                     setFillMode('gradient');
                     // Sync Gradient colors if possible
                     if (obj.fill.colorStops && obj.fill.colorStops.length >= 2) {
                         setGradientStart(obj.fill.colorStops[0].color);
                         setGradientEnd(obj.fill.colorStops[1].color);
                         targetColor = obj.fill.colorStops[0].color; // Default to start
                         newTarget = 'gradientStart';
                     }
                 } else if (obj.fill.source) {
                     setFillMode('image');
                 }
            } else if (obj.type === 'line' || obj.type === 'path') {
                setFillMode('solid');
                targetColor = obj.stroke || '#000000';
            }
            
            setActiveColorTarget(newTarget);
            setCustomHex(targetColor);
            setHsl(hexToHsl(targetColor));
            setSelectedColor(targetColor);
        } else {
            setSelectedObject(null);
            setIsShapeSelected(false);
            setActiveColorTarget('background');
            setCustomHex(customBgColor); 
            setHsl(hexToHsl(customBgColor));
        }
    };

    // Called when the user clicks a specific color picker target (e.g. "End Color")
    const handleSetActiveColorTarget = (target: 'background' | 'fill' | 'gradientStart' | 'gradientEnd') => {
        setActiveColorTarget(target);
        
        let colorToSync = '#ffffff';
        if (target === 'background') colorToSync = customBgColor;
        if (target === 'fill') colorToSync = selectedColor;
        if (target === 'gradientStart') colorToSync = gradientStart;
        if (target === 'gradientEnd') colorToSync = gradientEnd;
        
        setCustomHex(colorToSync);
        setHsl(hexToHsl(colorToSync));
    };

    const handleColorSelect = (color: string) => {
        setCustomHex(color);
        setHsl(hexToHsl(color));
        setSelectedColor(color);
        
        if (activeColorTarget === 'background') {
            setCustomBgColor(color);
            whiteboardRef.current?.setBackgroundColor(color);
        } else if (activeColorTarget === 'fill') {
            if (selectedObject?.type === 'line') updateCanvasObject({ stroke: color });
            else updateCanvasObject({ fill: color });
        } else if (activeColorTarget === 'gradientStart') {
            setGradientStart(color);
            whiteboardRef.current?.setFillMode('gradient', { start: color, end: gradientEnd });
        } else if (activeColorTarget === 'gradientEnd') {
            setGradientEnd(color);
            whiteboardRef.current?.setFillMode('gradient', { start: gradientStart, end: color });
        }
    };

    const handleHslChange = (field: 'h'|'s'|'l', val: number) => {
        const newHsl = { ...hsl, [field]: val };
        setHsl(newHsl);
        const hex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
        handleColorSelect(hex);
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomHex(val);
        if (/^#[0-9A-F]{6}$/i.test(val)) handleColorSelect(val);
    };

        const handleToolClick = (tool: string) => {
            setActiveTool(tool);
            whiteboardRef.current?.setTool(tool as any); 
        };

        const handleLayerAction = (id: string, action: 'visible' | 'locked' | 'delete') => {
            const index = layers.findIndex(l => l.id === id);
            if (index === -1) return;
            
            if (action === 'visible') whiteboardRef.current?.toggleLayerVisibility(index);
            else if (action === 'locked') whiteboardRef.current?.toggleLayerLock(index);
            else if (action === 'delete') whiteboardRef.current?.deleteLayer(id);
        };

    const handleLayerDragDrop = (dragIndex: number, dropIndex: number) => {
        const distance = dropIndex - dragIndex;
        const direction = distance > 0 ? 'down' : 'up';
        const steps = Math.abs(distance);
        for(let i=0; i<steps; i++) {
            const currentIndex = direction === 'down' ? dragIndex + i : dragIndex - i;
            whiteboardRef.current?.moveLayer(currentIndex, direction);
        }
    };

    const handlePropertyChange = (prop: string, val: any) => {
        if (prop === 'opacity') { setOpacity(val); updateCanvasObject({ opacity: val / 100 }); }
        else if (prop === 'strokeWidth') { setStrokeWidth(val); updateCanvasObject({ strokeWidth: val }); }
        else if (prop === 'cornerRadius') { setCornerRadius(val); updateCanvasObject({ cornerRadius: val }); }
        else if (prop === 'fontFamily' || prop === 'fontWeight' || prop === 'fontStyle' || prop === 'underline') {
            const update: any = {};
            if (prop === 'fontWeight') update.fontWeight = selectedObject?.fontWeight === 'bold' ? 'normal' : 'bold';
            else if (prop === 'fontStyle') update.fontStyle = selectedObject?.fontStyle === 'italic' ? 'normal' : 'italic';
            else if (prop === 'underline') update.underline = !selectedObject?.underline;
            else update[prop] = val;
            updateCanvasObject(update);
        }
    };

    const handleFillModeChange = (mode: 'solid' | 'gradient' | 'image') => {
        setFillMode(mode);
        if (mode === 'gradient') {
             setActiveColorTarget('gradientStart');
             setCustomHex(gradientStart);
             setHsl(hexToHsl(gradientStart));
             whiteboardRef.current?.setFillMode('gradient', { start: gradientStart, end: gradientEnd });
        }
        else if (mode === 'solid') {
             setActiveColorTarget('fill');
             setCustomHex(selectedColor);
             setHsl(hexToHsl(selectedColor));
             whiteboardRef.current?.setFillMode('solid', selectedColor);
        }
    };

    const handlePatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            whiteboardRef.current?.setFillMode('image', file, imageFillStyle);
            setFillMode('image');
        }
    };

    // Inject Props into Canvas
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            // @ts-ignore
            return React.cloneElement(child, { onSelectionChange: handleSelectionChange, onLayerChange: setLayers });
        }
        return child;
    });

    return(
        <div className="relative w-full h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            <div className="w-full h-full">{childrenWithProps}</div>

            <Toolbar 
                activeTool={activeTool} 
                onToolClick={handleToolClick} 
                showPanel={showToolsPanel} 
                setShowPanel={setShowToolsPanel}
                onImageUpload={(e) => {
                    if (e.target.files?.[0]) {
                        whiteboardRef.current?.addImage(e.target.files[0]);
                        setActiveTool('select');
                    }
                }}
            />

            <ActionBar 
                onUndo={() => whiteboardRef.current?.undo()}
                onClear={() => { whiteboardRef.current?.clear(); setCustomBgColor('#ffffff'); }}
                onDownload={() => whiteboardRef.current?.download()}
            />

            <PropertiesPanel 
                showPanel={showPropsPanel}
                setShowPanel={setShowPropsPanel}
                isShapeSelected={isShapeSelected}
                selectedObject={selectedObject}
                layers={layers}
                // Colors
                activeColorTarget={activeColorTarget}
                hsl={hsl}
                customHex={customHex}
                gradientStart={gradientStart}
                gradientEnd={gradientEnd}
                customBgColor={customBgColor}
                onColorSelect={handleColorSelect}
                onSetActiveColorTarget={handleSetActiveColorTarget}
                onHslChange={handleHslChange}
                onHexChange={handleHexChange}
                // Layers
                onLayerAction={handleLayerAction}
                onLayerDragDrop={handleLayerDragDrop}
                // Props
                onPropertyChange={handlePropertyChange}
                onGlobalAction={(action) => {
                    if (action === 'delete') whiteboardRef.current?.deleteSelected();
                    else if (action === 'duplicate') whiteboardRef.current?.duplicateSelected();
                    else if (action.startsWith('align')) whiteboardRef.current?.alignSelected(action.split('-')[1]);
                }}
                onPatternUpload={handlePatternUpload}
                fillMode={fillMode}
                setFillMode={handleFillModeChange}
                imageFillStyle={imageFillStyle}
                setImageFillStyle={(style) => { 
                    setImageFillStyle(style); 
                }} 
                opacity={opacity}
                strokeWidth={strokeWidth}
                cornerRadius={cornerRadius}
            />
        </div>
    );
}