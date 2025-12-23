import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
    X, Mail, Lock, LogOut, Check, AlertCircle, Loader2, 
    Shield, Key, Link as LinkIcon, Unlink 
} from 'lucide-react';
import { 
    updateUserPassword, 
    updateUserEmail, 
    linkGoogleAccount, 
    unlinkGoogleAccount 
} from '../utils/firebase';

interface AccountSettingsProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export const AccountSettings = ({ user, isOpen, onClose, onLogout }: AccountSettingsProps) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Animation States
    const [isVisible, setIsVisible] = useState(false); // Controls opacity/scale
    const [shake, setShake] = useState(false);

    // Form States
    const [newEmail, setNewEmail] = useState(user.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const isGoogleLinked = user.providerData.some(p => p.providerId === 'google.com');

    // Trigger Opening Animation on Mount
    useEffect(() => {
        if (isOpen) {
            // Small timeout allows React to render the initial "hidden" state first
            // creating the transition effect when we switch to "visible"
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle Closing Animation
    const handleClose = () => {
        setIsVisible(false); // Trigger exit animation (fade out/scale down)
        setTimeout(() => {
            onClose(); // Unmount after animation finishes
        }, 300); // Matches duration-300 class
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleAction = async (action: () => Promise<void>, successMsg: string) => {
        setLoading(true);
        setMessage(null);
        try {
            await action();
            setMessage({ type: 'success', text: successMsg });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Action failed' });
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEmail === user.email) return;
        handleAction(() => updateUserEmail(user, newEmail), 'Email updated! Verification sent.');
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords don't match" });
            triggerShake();
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters" });
            triggerShake();
            return;
        }
        handleAction(() => updateUserPassword(user, newPassword), 'Password updated successfully.');
    };

    // If strictly closed, return null. Note: We keep it rendered while isVisible=false during exit animation.
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.3s ease-in-out; }
            `}</style>

            {/* Backdrop with Transition */}
            <div 
                className={`
                    absolute inset-0 bg-zinc-950/80 backdrop-blur-md 
                    transition-opacity duration-300 ease-in-out
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={handleClose}
            >
                {/* Ambience matching Auth */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            </div>

            {/* Modal Card with Opening/Closing State & Shake */}
            <div 
                className={`
                    relative w-full max-w-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row 
                    transition-all duration-300 ease-out transform
                    ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
                    ${shake ? 'animate-shake' : ''}
                `}
            >
                {/* Glow behind card */}
                <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/10 to-violet-500/10 rounded-3xl blur-xl opacity-30 pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Sidebar */}
                <div className="w-full md:w-1/3 bg-white/5 border-r border-white/5 p-6 flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-1 ring-white/20">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">Account</span>
                            <span className="text-xs text-zinc-400 truncate max-w-[120px]">{user.email}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 border ${activeTab === 'profile' ? 'bg-blue-600/20 text-blue-300 border-blue-500/20 shadow-lg shadow-blue-900/20' : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Shield size={18} /> General
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 border ${activeTab === 'security' ? 'bg-blue-600/20 text-blue-300 border-blue-500/20 shadow-lg shadow-blue-900/20' : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Key size={18} /> Security
                    </button>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <button 
                            onClick={onLogout}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center gap-3 border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8 relative overflow-y-auto max-h-[80vh] z-10">
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>

                    <h2 className="text-2xl font-bold text-white mb-6">
                        {activeTab === 'profile' ? 'General Settings' : 'Security Settings'}
                    </h2>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 shadow-inner ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-red-500/10 border-red-500/20 text-red-200'}`}>
                            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Email Section */}
                            <form onSubmit={handleUpdateEmail} className="space-y-4">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                        <input 
                                            type="email" 
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-zinc-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all hover:bg-zinc-950/70"
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={loading || newEmail === user.email}
                                        className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:border-white/20"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>

                            <div className="h-px bg-white/5" />

                            {/* Connected Accounts */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Connected Accounts</label>
                                <div className="bg-zinc-950/30 rounded-xl p-4 border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Google</p>
                                            <p className="text-xs text-zinc-500">{isGoogleLinked ? 'Connected' : 'Not connected'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => isGoogleLinked ? handleAction(() => unlinkGoogleAccount(user), 'Google account unlinked.') : handleAction(() => linkGoogleAccount(user), 'Google account linked!')}
                                        disabled={loading}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${isGoogleLinked ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'}`}
                                    >
                                        {isGoogleLinked ? <><Unlink size={14} /> Unlink</> : <><LinkIcon size={14} /> Link</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-zinc-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all hover:bg-zinc-950/70"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Confirm Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-zinc-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all hover:bg-zinc-950/70"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={loading || !newPassword}
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 border border-white/10"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};