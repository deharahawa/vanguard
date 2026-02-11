"use client";

import { type QuadriviumStats } from "@/types/stats";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from "recharts";

interface QuadriviumProps {
  stats: QuadriviumStats | null;
}

export default function Quadrivium({ stats }: QuadriviumProps) {
  if (!stats) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-zinc-500 font-mono text-sm border border-zinc-800 rounded bg-zinc-900/50">
        NO DATA
      </div>
    );
  }

  const data = [
    { subject: "Operator", A: stats.operator, fullMark: 100 },
    { subject: "Stoic", A: stats.stoic, fullMark: 100 },
    { subject: "Diplomat", A: stats.diplomat, fullMark: 100 },
    { subject: "Bio", A: stats.bio, fullMark: 100 },
  ];

  return (
    <div className="w-full max-w-md aspect-square relative">
      <div className="absolute inset-0 bg-zinc-900/50 border border-zinc-800 rounded-lg backdrop-blur-sm -z-10" />
      
      <div className="w-full h-full p-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#27272a" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: "#71717a", fontSize: 12, fontFamily: "monospace" }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Quadrivium"
              dataKey="A"
              stroke="#22c55e"
              strokeWidth={2}
              fill="#22c55e"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1 text-[10px] font-mono text-zinc-500">
        <div>OPR: {stats.operator}%</div>
        <div>STC: {stats.stoic}%</div>
        <div>DIP: {stats.diplomat}%</div>
        <div>BIO: {stats.bio}%</div>
      </div>
    </div>
  );
}
