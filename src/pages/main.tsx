import React, { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogOut, Loader2 } from 'lucide-react';

// Adjust these imports based on your actual file structure
import NoSSR from '../../components/noSSR';
import { Canvas as Whiteboard } from '../../components/Canvas';
import Reductor from './reductor';
import { Auth } from '../../components/Auth';
import { 
    auth, 
    logout, 
    loadCanvasData, 
    saveCanvasData 
} from '../../utils/firebase';

export default function Home() {
  const whiteboardRef = useRef<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);
  
  // Transition State
  const [showAuth, setShowAuth] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  // 1. Auth Listener & Data Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            // Logged In: Fade out Auth, Load Data, Fade in Canvas
            const data = await loadCanvasData(currentUser.uid);
            setInitialData(data || null);
            setUser(currentUser);
            
            setShowAuth(false);
            // Small delay to allow Auth to fade out before showing Canvas
            setTimeout(() => {
                setLoading(false);
                setShowCanvas(true);
            }, 600); 
        } else {
            // Logged Out: Fade out Canvas, Fade in Auth
            setShowCanvas(false);
            setTimeout(() => {
                setUser(null);
                setInitialData(null);
                setLoading(false);
                setShowAuth(true);
            }, 600);
        }
    });
    return () => unsubscribe();
  }, []);

  // 2. Auto-Save Handler
  const handleSave = async (data: any) => {
      if (user) {
          await saveCanvasData(user.uid, data);
      }
  };

  return (
    <NoSSR>
      <div className="relative w-full h-screen overflow-hidden bg-zinc-950 text-white selection:bg-blue-500/30">
          
          {/* --- PERSISTENT BACKGROUND --- 
              This stays visible during the transition between Auth and Canvas,
              creating that "fitting" continuous flow. */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
          </div>

          {/* --- LOADING OVERLAY --- 
              Glassmorphic loader for initial check */}
          {loading && !user && !showAuth && (
             <div className="absolute inset-0 flex items-center justify-center z-[100]">
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in duration-500">
                    <Loader2 size={32} className="text-blue-500 animate-spin" />
                    <span className="text-zinc-400 text-sm font-medium tracking-wide">Initializing...</span>
                </div>
             </div>
          )}

          {/* --- AUTH LAYER --- */}
          <div 
            className={`absolute inset-0 z-50 transition-all duration-700 ease-in-out transform ${showAuth ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
          >
             {!user && <Auth />}
          </div>

          {/* --- CANVAS APP LAYER --- */}
          <div 
            className={`absolute inset-0 z-10 transition-all duration-1000 ease-out transform ${showCanvas ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'}`}
          >
              {user && (
                <>
                    {/* Glassy Logout Button */}
                    <div className="fixed top-6 left-24 z-[60] animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                        <button 
                            onClick={async () => {
                                setShowCanvas(false); 
                                setTimeout(async () => {
                                    await logout(); 
                                }, 500);
                            }} 
                            title="Sign Out"
                            className="group relative w-12 h-12 flex items-center justify-center rounded-full 
                                     bg-zinc-900/30 backdrop-blur-md border border-white/10 shadow-lg 
                                     hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-red-500/20 
                                     transition-all duration-300 active:scale-95"
                        >
                            <LogOut size={18} className="text-zinc-400 group-hover:text-red-400 transition-colors" />
                            
                            {/* Tooltip */}
                            <span className="absolute left-full ml-3 px-2 py-1 bg-zinc-900/90 text-zinc-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/5">
                                Sign Out
                            </span>
                        </button>
                    </div>

                    <Reductor whiteboardRef={whiteboardRef}>
                        <Whiteboard 
                            key={user.uid} 
                            ref={whiteboardRef} 
                            initialData={initialData}
                            onSave={handleSave}
                        />
                    </Reductor>
                </>
              )}
          </div>
      </div>
    </NoSSR>
  );
}