import React from 'react';
import { Plus } from 'lucide-react';

export const primaryColors = ["#ffffff", "#f4f4f5", "#fff7ed", "#f0f9ff", "#f0fdf4", "#18181b"];

// Shared Slider Component
interface PropertySliderProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    unit?: string;
}

export const PropertySlider = ({ label, value, onChange, min = 0, max = 100, unit = "" }: PropertySliderProps) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span>{label}</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">{value}{unit}</span>
        </div>
        <input 
            type="range" 
            min={min} 
            max={max} 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))} 
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 transition-colors" 
        />
    </div>
);

// Improved Color Picker with Correct Gradients
interface AdvancedColorPickerProps {
    hsl: { h: number; s: number; l: number };
    customHex: string;
    onHslChange: (field: 'h'|'s'|'l', value: number) => void;
    onHexChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdvancedColorPicker = ({ hsl, customHex, onHslChange, onHexChange }: AdvancedColorPickerProps) => (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-4">
            <div className="space-y-3">
                {/* Hue */}
                <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-medium">HUE</label>
                    <div className="h-3 w-full rounded-full relative ring-1 ring-black/5">
                        <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }} />
                        <div className="absolute top-0 bottom-0 w-3 h-3 -ml-1.5 bg-white border border-black/20 rounded-full shadow-sm pointer-events-none z-10" style={{ left: `${(hsl.h / 360) * 100}%` }} />
                        <input type="range" min="0" max="360" value={hsl.h} onChange={(e) => onHslChange('h', Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair z-20" />
                    </div>
                </div>
                {/* Saturation */}
                <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-medium">SATURATION</label>
                    <div className="h-3 w-full rounded-full relative ring-1 ring-black/5 overflow-hidden">
                        <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(to right, #808080, hsl(${hsl.h}, 100%, 50%))` }} />
                        <div className="absolute top-0 bottom-0 w-3 h-3 -ml-1.5 bg-white border border-black/20 rounded-full shadow-sm pointer-events-none z-10" style={{ left: `${hsl.s}%` }} />
                        <input type="range" min="0" max="100" value={hsl.s} onChange={(e) => onHslChange('s', Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair z-20" />
                    </div>
                </div>
                {/* Lightness */}
                <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-medium">LIGHTNESS</label>
                    <div className="h-3 w-full rounded-full relative ring-1 ring-black/5 overflow-hidden">
                        <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(to right, #000000, hsl(${hsl.h}, ${hsl.s}%, 50%), #ffffff)` }} />
                        <div className="absolute top-0 bottom-0 w-3 h-3 -ml-1.5 bg-white border border-black/20 rounded-full shadow-sm pointer-events-none z-10" style={{ left: `${hsl.l}%` }} />
                        <input type="range" min="0" max="100" value={hsl.l} onChange={(e) => onHslChange('l', Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair z-20" />
                    </div>
                </div>
            </div>
            {/* Hex Input */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <div className="w-6 h-6 rounded border border-zinc-100 dark:border-zinc-700 shadow-sm" style={{backgroundColor: customHex}} />
                <span className="text-zinc-400 text-xs">#</span>
                <input type="text" value={customHex.replace('#', '')} onChange={onHexChange} className="w-full bg-transparent text-xs font-mono text-zinc-700 dark:text-zinc-300 outline-none uppercase" />
            </div>
        </div>
    </div>
);