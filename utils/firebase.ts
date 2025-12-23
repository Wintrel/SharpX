import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updatePassword,
    updateEmail,
    linkWithPopup,
    unlink,
    sendEmailVerification
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Debug check
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.error("Firebase API Key is missing! Check your .env.local file.");
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Ensure this matches the rules wildcards
const appId = 'canvas-app-default'; 

// --- Helper: Sanitize Data for Firestore ---
const sanitizeData = (data: any): any => {
    if (data === undefined) return null;
    if (data === null) return null;
    
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }
    
    if (typeof data === 'object') {
        const newObj: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const val = sanitizeData(data[key]);
                newObj[key] = val;
            }
        }
        return newObj;
    }
    
    return data;
};

// --- Auth Actions ---

const handleAuthError = (error: any) => {
    console.error("Auth Error:", error);
    if (error.code === 'auth/network-request-failed' || error.message?.includes('network')) {
        const msg = "Network request failed. This is often caused by AdBlockers blocking Firebase. Please disable them for this site.";
        console.error(msg);
        alert(msg);
    }
    // Handle "Requires Recent Login" specifically
    if (error.code === 'auth/requires-recent-login') {
        throw new Error("Security check: Please log out and log back in to perform this sensitive action.");
    }
    throw error;
};

export const loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        handleAuthError(error);
    }
};

export const loginWithEmail = async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        handleAuthError(error);
    }
};

export const registerWithEmail = async (email: string, pass: string) => {
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        handleAuthError(error);
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed", error);
    }
};

// --- Account Management ---

export const updateUserPassword = async (user: User, newPass: string) => {
    try {
        await updatePassword(user, newPass);
    } catch (error) {
        handleAuthError(error);
    }
};

export const updateUserEmail = async (user: User, newEmail: string) => {
    try {
        await updateEmail(user, newEmail);
        await sendEmailVerification(user); // Optional but recommended
    } catch (error) {
        handleAuthError(error);
    }
};

export const linkGoogleAccount = async (user: User) => {
    try {
        await linkWithPopup(user, googleProvider);
    } catch (error) {
        handleAuthError(error);
    }
};

export const unlinkGoogleAccount = async (user: User) => {
    try {
        await unlink(user, 'google.com');
    } catch (error) {
        handleAuthError(error);
    }
};

// --- Database Helpers ---

export const saveCanvasData = async (userId: string, data: any) => {
    if (!userId) {
        console.error("Cannot save: No User ID provided");
        return;
    }
    
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        console.warn("Skipping save: Data is empty");
        return;
    }

    try {
        const cleanData = sanitizeData(data);
        const canvasRef = doc(db, 'artifacts', appId, 'users', userId, 'data', 'canvas');
        
        await setDoc(canvasRef, { 
            content: cleanData, 
            lastModified: serverTimestamp(),
            savedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log("[Firebase] Save complete!");
    } catch (error: any) {
        console.error("FIREBASE SAVE ERROR:", error.code, error.message);
        if (error.code === 'permission-denied') {
             console.error(`Permission denied. Ensure your Firestore Rules allow writes to: artifacts/${appId}/users/${userId}/data/canvas`);
        }
    }
};

export const loadCanvasData = async (userId: string) => {
    if (!userId) return null;

    try {
        console.log(`[Firebase] Loading from: artifacts/${appId}/users/${userId}/data/canvas`);
        const canvasRef = doc(db, 'artifacts', appId, 'users', userId, 'data', 'canvas');
        const snap = await getDoc(canvasRef);
        
        if (snap.exists()) {
            console.log("[Firebase] Canvas loaded", snap.data());
            return snap.data()?.content;
        } else {
            console.log("[Firebase] No saved canvas found");
            return null;
        }
    } catch (error: any) {
        console.error("[Firebase] Load Error:", error);
        return null;
    }
};