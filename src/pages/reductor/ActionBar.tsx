import React from 'react';
import { Undo2, RotateCcw, Download } from 'lucide-react';

interface ActionBarProps {
    onUndo: () => void;
    onClear: () => void;
    onDownload: () => void;
}

const transitionStyles = "transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)";

export const ActionBar = ({ onUndo, onClear, onDownload }: ActionBarProps) => {
    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-full px-4 py-2 flex items-center gap-2 z-50 ${transitionStyles}`}>
            <button onClick={onUndo} className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors" title="Undo (Ctrl+Z)"><Undo2 size={18} /></button>
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
            <button onClick={onClear} className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors" title="Clear Canvas"><RotateCcw size={18} /></button>
            <button onClick={onDownload} className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors" title="Download PNG"><Download size={18} /></button>
        </div>
    );
};