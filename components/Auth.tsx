import React, { useState } from 'react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../utils/firebase';
import { LayoutGrid, Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shake, setShake] = useState(false);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const getFriendlyErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return isLogin 
                    ? "We couldn't find an account with those details. Check your email or Sign Up."
                    : "Invalid details provided.";
            case 'auth/email-already-in-use':
                return "This email is already registered. Please Log In instead.";
            case 'auth/invalid-email':
                return "Please enter a valid email address.";
            case 'auth/weak-password':
                return "Password is too weak. It should be at least 6 characters.";
            case 'auth/too-many-requests':
                return "Too many failed attempts. Please try again later.";
            case 'auth/network-request-failed':
                return "Network error. Please check your connection.";
            default:
                return "Authentication failed. Please try again.";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            if (isLogin) {
                await loginWithEmail(email, password);
            } else {
                await registerWithEmail(email, password);
            }
            // Success! The main app listener will handle the transition.
        } catch (err: any) {
            setLoading(false);
            console.error("Auth Error Code:", err.code);
            setError(getFriendlyErrorMessage(err.code));
            triggerShake();
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await loginWithGoogle();
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err.code));
            setLoading(false);
            triggerShake();
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setShake(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-zinc-950 text-white selection:bg-blue-500/30">
            {/* Background Ambience */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            </div>

            {/* Glass Card */}
            <div className={`relative w-full max-w-md mx-4 transition-transform duration-300 ${shake ? 'translate-x-[-10px] animate-shake' : ''}`}>
                <style jsx>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    .animate-shake { animation: shake 0.3s ease-in-out; }
                `}</style>

                {/* Glow behind card */}
                <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-50" />
                
                <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 sm:p-10 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-4 mb-8">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
                            <LayoutGrid size={28} className="text-white" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-white/95">
                                {isLogin ? 'Welcome back' : 'Create account'}
                            </h1>
                            <p className="text-zinc-400 text-sm font-medium">
                                {isLogin ? 'Enter your details to access your canvas' : 'Start your creative journey today'}
                            </p>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-200 text-sm animate-in fade-in slide-in-from-top-2 shadow-inner">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider ml-1">Email address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 hover:border-white/20 hover:bg-zinc-950/70"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 hover:border-white/20 hover:bg-zinc-950/70"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group border border-white/10"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-transparent px-3 text-zinc-500 font-medium">Or continue with</span></div>
                    </div>

                    {/* Social Login */}
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group active:scale-[0.98]"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" alt="Google" />
                        <span>Google</span>
                    </button>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-zinc-400 text-sm">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button 
                                onClick={toggleMode} 
                                className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors ml-1"
                            >
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};