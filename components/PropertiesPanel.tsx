import React, { useState } from 'react';
import { 
    Settings2, Palette, Layers, Square, Circle, BoxSelect, Type, Image as ImageIcon, 
    X, Lock, Unlock, Eye, EyeOff, GripVertical, AlignLeft, AlignCenter, AlignRight, 
    AlignStartVertical, AlignVerticalJustifyCenter, AlignEndVertical, Upload,
    Copy, Trash2, Bold, Italic, Underline, Maximize, Grid
} from 'lucide-react';
import { PropertySlider, AdvancedColorPicker } from './reductorComponents';

interface PropertiesPanelProps {
    showPanel: boolean;
    setShowPanel: (show: boolean) => void;
    isShapeSelected: boolean;
    selectedObject: any;
    layers: any[];
    // Color Props
    activeColorTarget: 'background' | 'fill' | 'gradientStart' | 'gradientEnd';
    hsl: any;
    customHex: string;
    gradientStart: string;
    gradientEnd: string;
    customBgColor: string;
    // Handlers
    onColorSelect: (color: string) => void;
    onSetActiveColorTarget: (target: 'background' | 'fill' | 'gradientStart' | 'gradientEnd') => void;
    onHslChange: (field: any, val: number) => void;
    onHexChange: (e: any) => void;
    onLayerAction: (id: string, action: 'visible'|'locked'|'delete') => void;
    onLayerDragDrop: (dragIndex: number, dropIndex: number) => void;
    onPropertyChange: (prop: string, val: any) => void;
    onGlobalAction: (action: string) => void;
    onPatternUpload: (e: any) => void;
    // Fill Mode
    fillMode: 'solid' | 'gradient' | 'image';
    setFillMode: (mode: 'solid' | 'gradient' | 'image') => void;
    imageFillStyle: 'cover' | 'tile';
    setImageFillStyle: (style: 'cover' | 'tile') => void;
    // Props
    opacity: number;
    strokeWidth: number;
    cornerRadius: number;
}

const panelBaseClasses = "fixed bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 z-50 transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)";
const fabBaseClasses = "w-12 h-12 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 z-40 transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)";

const secondaryBtnClass = "flex items-center justify-center p-2 rounded-lg bg-zinc-200/50 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300/50 dark:hover:bg-zinc-700 hover:border-zinc-300 transition-all shadow-sm";
const activeToggleBtnClass = "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 font-bold";
const inactiveToggleBtnClass = "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50";

export const PropertiesPanel = (props: PropertiesPanelProps) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);

    const openColorPicker = (target: any) => {
        props.onSetActiveColorTarget(target);
        setShowColorPicker(true);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedLayerIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };
    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedLayerIndex !== null) {
            props.onLayerDragDrop(draggedLayerIndex, dropIndex);
            setDraggedLayerIndex(null);
        }
    };

    const alignmentTools = [
        { icon: <AlignLeft size={16}/>, action: 'align-left' },
        { icon: <AlignCenter size={16}/>, action: 'align-center' },
        { icon: <AlignRight size={16}/>, action: 'align-right' },
        { icon: <AlignStartVertical size={16}/>, action: 'align-top' },
        { icon: <AlignVerticalJustifyCenter size={16}/>, action: 'align-middle' },
        { icon: <AlignEndVertical size={16}/>, action: 'align-bottom' },
    ];

    return (
        <>
            <div className={`${panelBaseClasses} top-6 right-6 w-80 origin-top-right overflow-hidden flex flex-col ${props.showPanel ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 -translate-y-4 pointer-events-none"}`}>
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-zinc-200/60 dark:border-zinc-700 shrink-0">
                    <div className="flex items-center gap-2">
                        {props.isShapeSelected ? <Settings2 size={18} className="text-zinc-700 dark:text-zinc-300" /> : <Layers size={18} className="text-zinc-700 dark:text-zinc-300" />}
                        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tracking-wide min-w-[120px]">
                            {props.isShapeSelected ? "Properties" : "Canvas & Layers"}
                        </h3>
                    </div>
                    <button onClick={() => props.setShowPanel(false)} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-full p-1"><X size={16} /></button>
                </div>

                <div className="relative max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                    {!props.isShapeSelected ? (
                        <div className="space-y-6 p-1 animate-in fade-in">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                                    <div className="flex items-center gap-2"><Palette size={12} /><span>Background</span></div>
                                    <button onClick={() => { if(showColorPicker && props.activeColorTarget === 'background') setShowColorPicker(false); else openColorPicker('background'); }} className="text-[10px] text-zinc-500 hover:text-zinc-900 font-semibold underline decoration-zinc-300 underline-offset-2">
                                        {showColorPicker && props.activeColorTarget === 'background' ? 'Close' : 'Edit Color'}
                                    </button>
                                </div>
                                {!showColorPicker || props.activeColorTarget !== 'background' ? (
                                    <div className="grid grid-cols-6 gap-2">
                                        {["#ffffff", "#f4f4f5", "#fff7ed", "#f0f9ff", "#f0fdf4", "#18181b"].map((c) => (
                                            <button key={c} onClick={() => { props.onSetActiveColorTarget('background'); props.onColorSelect(c); }} className={`w-full aspect-square rounded-full border shadow-sm transition-transform hover:scale-105 ${props.customBgColor === c ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-zinc-300'}`} style={{ backgroundColor: c }} />
                                        ))}
                                        <button onClick={() => openColorPicker('background')} className="w-full aspect-square rounded-full border border-zinc-300 dark:border-zinc-700 border-dashed flex items-center justify-center relative hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
                                             <div className="absolute inset-0 rounded-full opacity-50" style={{backgroundColor: props.customBgColor !== '#ffffff' ? props.customBgColor : 'transparent'}} />
                                             <Settings2 size={14} className="relative z-10 text-zinc-400 group-hover:text-zinc-600" />
                                        </button>
                                    </div>
                                ) : (
                                    <AdvancedColorPicker hsl={props.hsl} customHex={props.customHex} onHslChange={props.onHslChange} onHexChange={props.onHexChange} />
                                )}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-700">
                                <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                                    <div className="flex items-center gap-2"><Layers size={12} /><span>Layers</span></div>
                                    <span className="text-[10px] bg-zinc-200/50 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-bold text-zinc-700 dark:text-zinc-300">{props.layers.length}</span>
                                </div>
                                <div className="flex flex-col gap-1.5 pb-2">
                                    {props.layers.map((layer, idx) => (
                                        <div 
                                            key={layer.id} 
                                            className={`group flex items-center gap-2 p-2 rounded-lg border transition-all ${draggedLayerIndex === idx ? 'opacity-50 bg-blue-50 border-blue-200' : 'border-transparent hover:bg-zinc-100/80 hover:border-zinc-200'} cursor-pointer`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, idx)}
                                        >
                                            <span className="text-zinc-300 hover:text-zinc-600 cursor-grab"><GripVertical size={14} /></span>
                                            <div className="p-1.5 rounded-md bg-white border border-zinc-200 text-zinc-500 shadow-sm">
                                                {layer.type.includes('text') ? <Type size={14} /> : layer.type.includes('image') ? <ImageIcon size={14} /> : <Square size={14} />}
                                            </div>
                                            <span className="text-xs font-semibold text-zinc-700 flex-1 truncate">{layer.name}</span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); props.onLayerAction(layer.id, 'locked'); }} className="p-1.5 rounded hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800">{layer.locked ? <Lock size={12} /> : <Unlock size={12} />}</button>
                                                <button onClick={(e) => { e.stopPropagation(); props.onLayerAction(layer.id, 'visible'); }} className="p-1.5 rounded hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800">{layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button>
                                                {/* NEW: Delete Button */}
                                                <button onClick={(e) => { e.stopPropagation(); props.onLayerAction(layer.id, 'delete'); }} className="p-1.5 rounded hover:bg-red-100 text-zinc-500 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 p-1 animate-in fade-in">
                            <div className="flex items-center justify-between bg-zinc-100/50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="flex items-center gap-2"><Square size={16} className="text-blue-600 dark:text-blue-400" /><span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase">{props.selectedObject?.type || "Shape"}</span></div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase">Align</span>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {alignmentTools.map((t) => (
                                        <button key={t.action} onClick={() => props.onGlobalAction(t.action)} className={secondaryBtnClass}>
                                            {t.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase">Fill</span>
                                <div className="flex bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-lg gap-1">
                                    {['solid', 'gradient', 'image'].map((m) => (
                                        <button key={m} onClick={() => props.setFillMode(m as any)} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${props.fillMode === m ? activeToggleBtnClass : inactiveToggleBtnClass}`}>
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {props.fillMode === 'solid' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-zinc-300 transition-colors" onClick={() => openColorPicker('fill')}>
                                        <div className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-600 shadow-sm shrink-0" style={{backgroundColor: props.customHex}} />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Color</span>
                                            <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 truncate">{props.customHex}</span>
                                        </div>
                                    </div>
                                    {showColorPicker && props.activeColorTarget === 'fill' && <AdvancedColorPicker hsl={props.hsl} customHex={props.customHex} onHslChange={props.onHslChange} onHexChange={props.onHexChange} />}
                                </div>
                            )}

                            {props.fillMode === 'gradient' && (
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1 space-y-1 cursor-pointer" onClick={() => openColorPicker('gradientStart')}>
                                            <span className="text-[10px] font-bold text-zinc-500">Start</span>
                                            <div className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-600 shadow-sm" style={{backgroundColor: props.gradientStart}} />
                                        </div>
                                        <div className="flex-1 space-y-1 cursor-pointer" onClick={() => openColorPicker('gradientEnd')}>
                                            <span className="text-[10px] font-bold text-zinc-500">End</span>
                                            <div className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-600 shadow-sm" style={{backgroundColor: props.gradientEnd}} />
                                        </div>
                                    </div>
                                    {showColorPicker && (props.activeColorTarget === 'gradientStart' || props.activeColorTarget === 'gradientEnd') && (
                                        <AdvancedColorPicker hsl={props.hsl} customHex={props.customHex} onHslChange={props.onHslChange} onHexChange={props.onHexChange} />
                                    )}
                                </div>
                            )}

                            {props.fillMode === 'image' && (
                                <div className="space-y-3">
                                    <div className="flex gap-2 p-1 bg-zinc-200/50 rounded-lg">
                                        <button onClick={() => props.setImageFillStyle('cover')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold rounded ${props.imageFillStyle === 'cover' ? activeToggleBtnClass : inactiveToggleBtnClass}`}><Maximize size={12} /> Fill</button>
                                        <button onClick={() => props.setImageFillStyle('tile')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold rounded ${props.imageFillStyle === 'tile' ? activeToggleBtnClass : inactiveToggleBtnClass}`}><Grid size={12} /> Tile</button>
                                    </div>
                                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-300 border-dashed text-center hover:bg-white hover:border-zinc-400 transition-colors cursor-pointer">
                                        <label className="cursor-pointer text-xs font-bold text-zinc-600 hover:text-zinc-900 flex flex-col items-center gap-2">
                                            <Upload size={18} className="text-zinc-400" /> Upload Image
                                            <input type="file" className="hidden" accept="image/*" onChange={props.onPatternUpload} />
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-5 pt-4 border-t border-zinc-200/60 dark:border-zinc-700">
                                <PropertySlider label="Opacity" value={props.opacity} onChange={(val) => props.onPropertyChange('opacity', val)} unit="%" />
                                {props.selectedObject?.type === 'textbox' ? (
                                    <div className="space-y-3">
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase">Typography</span>
                                        <select className="w-full text-xs font-bold p-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 ring-blue-500/20 text-zinc-800 dark:text-zinc-200" onChange={(e) => props.onPropertyChange('fontFamily', e.target.value)}>
                                            <option value="Inter, sans-serif">Inter</option>
                                            <option value="Arial, sans-serif">Arial</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                        </select>
                                        <div className="flex gap-2">
                                            <button onClick={() => props.onPropertyChange('fontWeight', 'bold')} className={secondaryBtnClass}><Bold size={16} /></button>
                                            <button onClick={() => props.onPropertyChange('fontStyle', 'italic')} className={secondaryBtnClass}><Italic size={16} /></button>
                                            <button onClick={() => props.onPropertyChange('underline', true)} className={secondaryBtnClass}><Underline size={16} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <PropertySlider label="Stroke Width" value={props.strokeWidth} onChange={(val) => props.onPropertyChange('strokeWidth', val)} max={20} unit="px" />
                                        {props.selectedObject?.type === 'rect' && (
                                            <PropertySlider label="Corner Radius" value={props.cornerRadius} onChange={(val) => props.onPropertyChange('cornerRadius', val)} max={100} unit="px" />
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-200/60 dark:border-zinc-700 pb-2">
                                <button onClick={() => props.onGlobalAction('duplicate')} className={`${secondaryBtnClass} font-bold text-xs bg-zinc-100 border-zinc-200 hover:bg-zinc-200`}><Copy size={14} className="mr-2" /> Duplicate</button>
                                <button onClick={() => props.onGlobalAction('delete')} className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 transition-all shadow-sm"><Trash2 size={14} /> Delete</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <button onClick={() => props.setShowPanel(true)} className={`${fabBaseClasses} fixed top-6 right-6 ${!props.showPanel ? "opacity-100 scale-100 pointer-events-auto delay-100" : "opacity-0 scale-50 pointer-events-none"}`}><Settings2 size={20} /></button>
        </>
    );
};