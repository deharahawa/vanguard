"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendDataPoint } from "@/actions/analytics";

export function MoodTrendChart({ data }: { data: TrendDataPoint[] }) {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-zinc-600 font-mono text-xs uppercase tracking-widest">No Data Available</div>;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#52525b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis 
                        stroke="#52525b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        domain={[1, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", fontSize: "12px", borderRadius: "8px" }}
                        itemStyle={{ color: "#e4e4e7" }}
                        labelStyle={{ color: "#a1a1aa", marginBottom: "4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#fbbf24" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: "#fbbf24", strokeWidth: 2, stroke: "#000" }} 
                        activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
