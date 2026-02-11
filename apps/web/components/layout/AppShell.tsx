"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Sparkles, Target, Archive, Settings, Radio, User, Zap, Users } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useState, useEffect } from "react";

import { AdrenalineWizard } from "@/components/protocols/AdrenalineWizard";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOffline, setIsOffline] = useState(false);
  const [showAdrenaline, setShowAdrenaline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Initial check
    if (typeof window !== "undefined") {
        setIsOffline(!navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Hide navigation on login/onboarding
  if (pathname === "/login" || pathname === "/onboarding") {
    return <>{children}</>;
  }

  const NAV_ITEMS = [
    { label: "Command", icon: Home, href: "/dashboard" },
    { label: "Oracle", icon: Sparkles, href: "/briefing" },
    { label: "Network", icon: Users, href: "/network" },
    { label: "Stream", icon: Radio, href: "/stream" },
    { label: "Protocol", icon: Zap, href: "#adrenaline", special: true }, // The Zap
    { label: "Missions", icon: Target, href: "/missions" },
    { label: "Archive", icon: Archive, href: "/archive" },
    { label: "Control", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-black text-white relative">
        {/* Global Profile Button (Mobile/Desktop) */}
        <Link 
            href="/profile"
            className="fixed top-4 left-4 z-50 p-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-lg"
        >
            <User size={16} />
        </Link>

        {/* Offline Indicator */}
        {isOffline && (
            <div className="fixed top-4 right-4 z-[100] animate-pulse">
                <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b] border border-amber-300" title="Offline Mode: Buffered" />
            </div>
        )}

        {/* Adrenaline Wizard Overlay */}
        {showAdrenaline && (
            <AdrenalineWizard onClose={() => setShowAdrenaline(false)} />
        )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-900 p-6 bg-zinc-950">
        <div className="mb-12 pl-12">
            <h1 className="text-2xl font-black tracking-tighter uppercase text-white">Vanguard</h1>
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Protocol Active</p>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const isSpecial = item.special;
                
                if (isSpecial) {
                    return (
                        <button
                            key={item.label}
                            onClick={() => setShowAdrenaline(true)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
                        >
                            <item.icon className="w-5 h-5 animate-pulse" />
                            <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>
                        </button>
                    )
                }

                return (
                    <Link 
                        key={item.href} 
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive ? 'bg-zinc-900 border border-zinc-800 text-white shadow-lg shadow-purple-900/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
                    >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-500' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                        <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>
                    </Link>
                )
            })}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-900">
             <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 px-2 py-4 flex justify-between items-center z-50 safe-area-bottom overflow-x-auto">
        {/* Mobile Specific Items: Command, Missions, Protocol (Center), Network, Stream */}
        {[
            NAV_ITEMS.find(i => i.label === "Command")!,
            NAV_ITEMS.find(i => i.label === "Missions")!,
            NAV_ITEMS.find(i => i.label === "Protocol")!,
            NAV_ITEMS.find(i => i.label === "Network")!,
            NAV_ITEMS.find(i => i.label === "Stream")!,
        ].map((item) => {
            const isActive = pathname === item.href;
            const isSpecial = item.special;

            if (isSpecial) {
                return (
                    <button
                        key={item.label}
                        onClick={() => setShowAdrenaline(true)}
                        className="flex flex-col items-center gap-1 min-w-[3.5rem]"
                    >
                        <div className="p-3 rounded-full bg-red-600 shadow-[0_0_15px_#dc2626] border border-red-400 text-white animate-pulse">
                                <item.icon className="w-5 h-5" />
                        </div>
                    </button>
                )
            }

            return (
                <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex flex-col items-center gap-1 transition-colors min-w-[3.5rem] ${isActive ? 'text-white' : 'text-zinc-600'}`}
                >
                    <div className={`p-2 rounded-full ${isActive ? 'bg-zinc-900 border border-zinc-800 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : ''}`}>
                         <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-500' : ''}`} />
                    </div>
                </Link>
            )
        })}
      </nav>
    </div>
  );
}
