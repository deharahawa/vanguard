"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { TrendDataPoint } from "@/actions/analytics";

export function TrinityBarChart({ data }: { data: TrendDataPoint[] }) {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-zinc-600 font-mono text-xs uppercase tracking-widest">No Data Available</div>;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#52525b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                    />
                    <Tooltip 
                        cursor={{ fill: '#27272a', opacity: 0.4 }}
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", fontSize: "12px", borderRadius: "8px" }}
                        labelStyle={{ color: "#a1a1aa", marginBottom: "4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}
                    />
                    <Legend 
                        iconSize={8}
                        wrapperStyle={{ fontSize: "10px",  textTransform: "uppercase", letterSpacing: "1px", paddingTop: "10px" }}
                    />
                    <Bar dataKey="operatorScore" name="Operator" stackId="a" fill="#d97706" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="stoicScore" name="Stoic" stackId="a" fill="#4f46e5" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="diplomatScore" name="Diplomat" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
