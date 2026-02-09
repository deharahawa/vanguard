"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { login, signUp } from "./actions";
import { motion } from "framer-motion";

import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  useEffect(() => {
    if (message) {
      toast.error(message);
    }
  }, [message]);

  const handleLogin = async (formData: FormData) => {
    const error = await login(formData);
    if (error) {
       toast.error(error);
    }
  };

   const handleSignUp = async (formData: FormData) => {
    const error = await signUp(formData);
    if (error) {
       toast.error(error);
    } else {
       toast.success("Check your email to confirm sign up");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">
            VANGUARD
          </h1>
          <p className="text-zinc-500 font-mono text-sm">
            IDENTITY VERIFICATION REQUESTED
          </p>
        </div>

        {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <div className="bg-red-900/50 border border-red-500/50 p-4 rounded text-xs text-red-200 font-mono text-center">
                WARNING: ENV CONFIGURATION MISSING
            </div>
        )}

        <form className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl space-y-6">
          <div className="space-y-4">
             <div className="space-y-2">
              <label 
                className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1" 
                htmlFor="email"
              >
                Access ID (Email)
              </label>
              <input
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm"
                name="email"
                placeholder="operative@vanguard.com"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <label 
                className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1" 
                htmlFor="password"
              >
                Passcode
              </label>
              <input
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="pt-4 space-y-3">
             <SubmitButton 
                text="Authenticate" 
                action={handleLogin} 
                variant="primary"
             />
             <SubmitButton 
                text="Initialize New Identity" 
                action={handleSignUp} 
                variant="secondary"
             />
          </div>
        </form>
        
        <p className="text-center text-xs text-zinc-600 font-mono">
          SECURE CONNECTION ESTABLISHED
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-zinc-500 font-mono text-xs animate-pulse">
                ESTABLISHING SECURE UPLINK...
            </div>
        </div>
    }>
        <LoginContent />
    </Suspense>
  );
}

function SubmitButton({ text, action, variant }: { text: string, action: (formData: FormData) => Promise<void>, variant: 'primary' | 'secondary' }) {
    const { pending } = useFormStatus();

    return (
        <button
          formAction={action}
          disabled={pending}
          className={`w-full py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all duration-200 
            ${variant === 'primary' 
                ? "bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                : "bg-transparent text-zinc-500 hover:text-white border border-transparent hover:border-zinc-700"
            }
            ${pending ? "opacity-50 cursor-wait" : ""}
          `}
        >
          {text}
        </button>
    )
}
