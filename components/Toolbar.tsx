import React, { useRef } from 'react';
import { 
  MousePointer2, Square, Circle, Minus, Type, Image as ImageIcon, Hand, LayoutGrid, X 
} from 'lucide-react';

interface ToolbarProps {
    activeTool: string;
    onToolClick: (tool: string) => void;
    showPanel: boolean;
    setShowPanel: (show: boolean) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Button Styles: solid light gray background for contrast, dark text
const toolButtonClasses = "p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center group relative border shadow-sm";
const activeToolClasses = "bg-blue-600 text-white border-blue-700 shadow-md scale-105"; // Active is very distinct
const inactiveToolClasses = "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white";

// Panel: Glassmorphism restored (bg-white/70 + backdrop-blur)
const panelBaseClasses = "fixed bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/40 dark:border-zinc-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl p-3 z-50 transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)";
const fabBaseClasses = "w-12 h-12 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-zinc-800 dark:text-zinc-100 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 flex items-center justify-center border border-white/50 dark:border-zinc-700 z-40 transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)";

export const Toolbar = ({ activeTool, onToolClick, showPanel, setShowPanel, onImageUpload }: ToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        onToolClick('image');
        fileInputRef.current?.click();
    };

    const tools = [
        { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select (V)' },
        { id: 'hand', icon: <Hand size={20} />, label: 'Pan Tool (H)' },
        { id: 'sep1', type: 'separator' },
        { id: 'square', icon: <Square size={20} />, label: 'Rectangle (R)' },
        { id: 'circle', icon: <Circle size={20} />, label: 'Circle (O)' },
        { id: 'line', icon: <Minus size={20} className="rotate-45" />, label: 'Line (L)' },
        { id: 'text', icon: <Type size={20} />, label: 'Text (T)' },
        { id: 'image', icon: <ImageIcon size={20} />, label: 'Image', onClick: handleImageClick }
    ];

    return (
        <>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onImageUpload} />
            
            <div className={`${panelBaseClasses} top-6 left-6 w-auto min-w-[56px] origin-top-left flex flex-col gap-2 ${showPanel ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 -translate-y-4 pointer-events-none"}`}>
                <div className="flex items-center justify-between px-1 mb-1"><LayoutGrid size={14} className="text-zinc-500 font-medium" /></div>
                <div className="flex flex-col gap-2">
                    {tools.map((tool) => (
                        tool.type === 'separator' ? (
                            <div key={tool.id} className="h-px bg-zinc-300/50 dark:bg-zinc-700 mx-2 my-0.5" />
                        ) : (
                            <button 
                                key={tool.id}
                                title={tool.label} 
                                onClick={tool.onClick || (() => onToolClick(tool.id))} 
                                className={`${toolButtonClasses} ${activeTool === tool.id ? activeToolClasses : inactiveToolClasses}`}
                            >
                                {tool.icon}
                            </button>
                        )
                    ))}
                </div>
                <button onClick={() => setShowPanel(false)} className="mt-2 p-1 text-zinc-500 hover:text-zinc-800 transition-colors flex justify-center"><X size={14} /></button>
            </div>
            
            <button onClick={() => setShowPanel(true)} className={`${fabBaseClasses} fixed top-6 left-6 ${!showPanel ? "opacity-100 scale-100 pointer-events-auto delay-100" : "opacity-0 scale-50 pointer-events-none"}`}><LayoutGrid size={20} /></button>
        </>
    );
};