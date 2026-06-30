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
    <div className="flex items-center gap-2.5 text-heading text-sm">
      {/* Profile photo */}
      {photoURL ? (
        <Image
          src={photoURL}
          alt={firstName}
          width={28}
          height={28}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-border/70"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-primary-soft flex items-center justify-center text-[11px] font-semibold text-primary-text">
          {firstName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Name */}
      <span className="font-heading font-semibold hidden sm:inline leading-none">{firstName}</span>

      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        className="ml-0.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-heading hover:bg-primary-soft transition-colors cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
