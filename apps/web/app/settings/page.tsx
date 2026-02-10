"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { getProtocolConfig, updateProtocolConfig, DEFAULT_PROTOCOL_CONFIG } from "@/actions/settings";
import { Save, Bell, Database, Trash2, Download, AlertTriangle } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest rounded-lg transition-all text-xs disabled:opacity-50"
        >
            <Save size={16} />
            {pending ? "Saving..." : "Save Configuration"}
        </button>
    );
}

export default function SettingsPage() {
    const { triggerHaptic } = useHaptic();
    const [config, setConfig] = useState(DEFAULT_PROTOCOL_CONFIG);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getProtocolConfig().then((data) => {
            setConfig(data);
            setIsLoading(false);
        });
    }, []);

    const handleSave = async (formData: FormData) => {
        const newConfig = {
            op1: String(formData.get("op1")),
            op2: String(formData.get("op2")),
            st1: String(formData.get("st1")),
            st2: String(formData.get("st2")),
            dip1: String(formData.get("dip1")),
        };
        
        try {
            await updateProtocolConfig(newConfig);
            toast.success("PROTOCOL UPDATED", {
                description: "New parameters loaded into the system."
            });
            triggerHaptic("success");
        } catch {
            toast.error("UPDATE FAILED");
            triggerHaptic("warning");
        }
    };

    const requestNotifications = () => {
        if (!("Notification" in window)) {
            toast.error("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            toast.info("Notifications already granted.");
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    toast.success("Notifications enabled.");
                    triggerHaptic("success");
                }
            });
        }
    };

    if (isLoading) return <div className="p-8 text-center text-zinc-500 font-mono">LOADING CONFIG...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-32">
            <header className="mb-12">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-white">Control Room</h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">System Configuration</p>
            </header>

            <div className="max-w-2xl mx-auto space-y-12">
                
                {/* SECTION A: PROTOCOL LOADOUT */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <Database className="w-5 h-5 text-purple-500" />
                        <h2 className="text-xl font-bold uppercase tracking-widest">Protocol Loadout</h2>
                    </div>
                    
                    <form action={handleSave} className="space-y-8 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                        {/* Operator */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Operator (Body)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Habit 1 (Hydrate)" name="op1" defaultValue={config.op1} />
                                <InputGroup label="Habit 2 (Mobility)" name="op2" defaultValue={config.op2} />
                            </div>
                        </div>

                        {/* Stoic */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Stoic (Mind)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Habit 1 (Breath)" name="st1" defaultValue={config.st1} />
                                <InputGroup label="Habit 2 (Reset)" name="st2" defaultValue={config.st2} />
                            </div>
                        </div>

                        {/* Diplomat */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Diplomat (Tribe)</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <InputGroup label="Habit 1 (Alignment)" name="dip1" defaultValue={config.dip1} />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-900 flex justify-end">
                            <SubmitButton />
                        </div>
                    </form>
                </section>

                {/* SECTION B: NOTIFICATIONS */}
                <section className="space-y-6">
                     <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <Bell className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold uppercase tracking-widest">Notifications</h2>
                    </div>
                    
                    <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white">Browser Permissions</h3>
                                <p className="text-xs text-zinc-500">Allow the system to send briefing alerts.</p>
                            </div>
                            <button 
                                onClick={requestNotifications}
                                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                            >
                                Request Access
                            </button>
                        </div>
                    </div>
                </section>

                 {/* SECTION C: DATA SOVEREIGNTY */}
                 <section className="space-y-6">
                     <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h2 className="text-xl font-bold uppercase tracking-widest">Danger Zone</h2>
                    </div>
                    
                    <div className="bg-red-950/10 border border-red-900/30 p-6 rounded-2xl flex flex-col gap-4">
                         <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div>
                                <h3 className="font-bold text-white">Export Data</h3>
                                <p className="text-xs text-zinc-500">Download all your mission logs (JSON).</p>
                            </div>
                            <button disabled className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                                <Download size={14} /> Export
                            </button>
                        </div>

                         <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div>
                                <h3 className="font-bold text-red-400">Delete Account</h3>
                                <p className="text-xs text-zinc-500">Permanent erasure of all records.</p>
                            </div>
                            <button disabled className="flex items-center gap-2 px-4 py-2 bg-red-950 border border-red-900 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider">
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

function InputGroup({ label, name, defaultValue }: { label: string, name: string, defaultValue: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{label}</label>
            <input 
                name={name}
                defaultValue={defaultValue}
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-mono"
            />
        </div>
    );
}
