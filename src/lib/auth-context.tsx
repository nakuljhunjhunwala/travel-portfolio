"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

/** Sync user profile to Firestore (fire-and-forget). */
async function syncUserProfile(user: User): Promise<void> {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoUrl: user.photoURL,
        createdAt: Timestamp.now(),
      });
    } else {
      await setDoc(userRef, { lastLoginAt: Timestamp.now() }, { merge: true });
    }
  } catch (err) {
    // Firestore may be temporarily unavailable — don't break auth flow
    console.error("Failed to sync user profile:", err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Fire-and-forget: don't block auth state update
        syncUserProfile(firebaseUser);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
