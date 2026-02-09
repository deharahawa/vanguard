"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button 
        type="submit"
        className="flex items-center gap-2 text-xs font-bold text-red-900/50 hover:text-red-500 uppercase tracking-widest transition-colors"
      >
        <LogOut size={16} /> Abort
      </button>
    </form>
  );
}
