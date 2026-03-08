"use client";

import { signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className }: LoginButtonProps) {
  const handleLogin = async () => {
    try {
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      // User closed popup or auth failed — silently ignore
      console.error("Login failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className={`inline-flex items-center justify-center gap-2.5 bg-heading text-white font-heading font-semibold text-sm md:text-base px-6 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)] ${className ?? ""}`}
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}
