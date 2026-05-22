"use client";

import * as React from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { getFirebase } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { DataBackend } from "@/lib/data/backend";
import { LocalBackend } from "@/lib/data/local";
import { FirestoreBackend } from "@/lib/data/firestore";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

interface AuthResult {
  error?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isMock: boolean;
  db: DataBackend | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const MOCK_KEY = "nexus:mock-user";

function mockIdFromEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return `mock-${Math.abs(hash)}`;
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "there";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Turn Firebase error codes into friendly messages. */
function friendly(code: string, fallback: string): string {
  const map: Record<string, string> = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-email": "That email address looks invalid.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "An account with that email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] ?? fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const fb = getFirebase();

  React.useEffect(() => {
    if (!isFirebaseConfigured || !fb) {
      // Mock mode — restore any persisted demo session.
      try {
        const raw = localStorage.getItem(MOCK_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(fb.auth, (u) => {
      setUser(
        u
          ? {
              id: u.uid,
              email: u.email ?? "",
              name: u.displayName || nameFromEmail(u.email ?? ""),
              avatarUrl: u.photoURL,
            }
          : null,
      );
      setLoading(false);
    });

    return () => unsub();
  }, [fb]);

  const setMockUser = React.useCallback((u: AppUser) => {
    localStorage.setItem(MOCK_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const signIn = React.useCallback<AuthContextValue["signIn"]>(
    async (email, password) => {
      if (!fb) {
        if (!email || !password) return { error: "Enter your email and password." };
        setMockUser({ id: mockIdFromEmail(email), email, name: nameFromEmail(email) });
        return {};
      }
      try {
        await signInWithEmailAndPassword(fb.auth, email, password);
        return {};
      } catch (e) {
        const err = e as { code?: string; message?: string };
        return { error: friendly(err.code ?? "", err.message ?? "Sign in failed.") };
      }
    },
    [fb, setMockUser],
  );

  const signUp = React.useCallback<AuthContextValue["signUp"]>(
    async (email, password, name) => {
      if (!fb) {
        if (!email || !password) return { error: "Enter your email and password." };
        setMockUser({ id: mockIdFromEmail(email), email, name: name || nameFromEmail(email) });
        return {};
      }
      try {
        const cred = await createUserWithEmailAndPassword(fb.auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        setUser({ id: cred.user.uid, email, name: name || nameFromEmail(email) });
        return {};
      } catch (e) {
        const err = e as { code?: string; message?: string };
        return { error: friendly(err.code ?? "", err.message ?? "Sign up failed.") };
      }
    },
    [fb, setMockUser],
  );

  const signInWithGoogle = React.useCallback<AuthContextValue["signInWithGoogle"]>(async () => {
    if (!fb) {
      setMockUser({
        id: mockIdFromEmail("demo@nexus.ai"),
        email: "demo@nexus.ai",
        name: "Demo User",
      });
      return {};
    }
    try {
      await signInWithPopup(fb.auth, new GoogleAuthProvider());
      return {};
    } catch (e) {
      const err = e as { code?: string; message?: string };
      return { error: friendly(err.code ?? "", err.message ?? "Google sign-in failed.") };
    }
  }, [fb, setMockUser]);

  const signOut = React.useCallback(async () => {
    if (fb) await firebaseSignOut(fb.auth);
    else localStorage.removeItem(MOCK_KEY);
    setUser(null);
  }, [fb]);

  const db = React.useMemo<DataBackend | null>(() => {
    if (!user) return null;
    if (fb) return new FirestoreBackend(fb.db, user.id);
    return new LocalBackend(user.id);
  }, [user, fb]);

  const value: AuthContextValue = {
    user,
    loading,
    isMock: !isFirebaseConfigured,
    db,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
