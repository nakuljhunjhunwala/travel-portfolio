"use client";

import Image from "next/image";
import { signOut } from "firebase/auth";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseAuth } from "@/lib/firebase";

export default function UserMenu() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  const firstName = user.displayName?.split(" ")[0] ?? "User";
  const photoURL = user.photoURL;

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-card/90 backdrop-blur-xl text-heading text-xs px-3.5 py-2.5 min-h-[44px] rounded-full border border-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      {/* Profile photo */}
      {photoURL ? (
        <Image
          src={photoURL}
          alt={firstName}
          width={24}
          height={24}
          className="w-6 h-6 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-primary-soft flex items-center justify-center text-[10px] font-semibold text-primary-text">
          {firstName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Name */}
      <span className="font-heading font-medium hidden sm:inline">{firstName}</span>

      {/* Divider */}
      <span className="w-px h-3 bg-border hidden sm:block" />

      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        className="text-muted hover:text-heading transition-colors cursor-pointer font-medium py-1 min-h-[44px] flex items-center"
      >
        Sign out
      </button>
    </div>
  );
}
