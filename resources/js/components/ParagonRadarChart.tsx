import { useState } from 'react';
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
} from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

const pillars = [
    { pillar: 'IP Governance',      verified: 88, average: 42 },
    { pillar: 'Unit Economics',      verified: 82, average: 51 },
    { pillar: 'Market Validation',   verified: 91, average: 48 },
    { pillar: 'Cap Table Health',    verified: 85, average: 38 },
    { pillar: 'Team Depth',          verified: 78, average: 55 },
    { pillar: 'Financial Forecast',  verified: 86, average: 44 },
    { pillar: 'Traction Signal',     verified: 79, average: 46 },
];

const chartConfig = {
    verified: {
        label: 'Pinpoint-Verified',
        color: '#5ca336',
    },
    average: {
        label: 'Average Startup',
        color: '#3c53a8',
    },
} satisfies ChartConfig;

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-white/10 bg-[#0e0e0e]/95 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
                {label}
            </p>
            {payload.map((entry) => {
                const isVerified = entry.dataKey === 'verified';
                return (
                    <div key={entry.dataKey} className="flex items-center gap-2.5 py-0.5">
                        <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: isVerified ? '#5ca336' : '#3c53a8' }}
                        />
                        <span className="text-[13px] text-white/55">
                            {isVerified ? 'Pinpoint-Verified' : 'Average Startup'}
                        </span>
                        <span
                            className="ml-auto text-[13px] font-bold tabular-nums"
                            style={{ color: isVerified ? '#5ca336' : '#7b8fd4' }}
                        >
                            {entry.value}
                            <span className="text-[11px] font-normal text-white/30">/100</span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Axis tick ────────────────────────────────────────────────────────────────

function AxisTick({ x, y, payload, cx, cy }: {
    x?: number; y?: number; cx?: number; cy?: number;
    payload?: { value: string };
}) {
    if (!payload || x === undefined || y === undefined) return null;

    // Push labels outward from center
    const dx = (x - (cx ?? 0)) * 0.18;
    const dy = (y - (cy ?? 0)) * 0.18;

    return (
        <text
            x={x + dx}
            y={y + dy}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.45)"
            fontSize={11}
            fontFamily="Arial, sans-serif"
            fontWeight={500}
            letterSpacing="0.04em"
        >
            {payload.value}
        </text>
    );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend({ active, onToggle }: { active: { verified: boolean; average: boolean }; onToggle: (key: 'verified' | 'average') => void }) {
    return (
        <div className="mt-6 flex items-center justify-center gap-6">
            {(['verified', 'average'] as const).map((key) => {
                const isVerified = key === 'verified';
                const color = isVerified ? '#5ca336' : '#3c53a8';
                const label = isVerified ? 'Pinpoint-Verified' : 'Average Startup';
                const isActive = active[key];

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onToggle(key)}
                        className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06]"
                        style={{ opacity: isActive ? 1 : 0.35 }}
                    >
                        <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <span style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>
                            {label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ─── Main chart ───────────────────────────────────────────────────────────────

export function ParagonRadarChart() {
    const [active, setActive] = useState({ verified: true, average: true });

    const toggle = (key: 'verified' | 'average') =>
        setActive((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="w-full">
            <ChartContainer config={chartConfig} className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={pillars} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                        <PolarGrid
                            stroke="rgba(255,255,255,0.07)"
                            strokeDasharray="3 3"
                        />
                        <PolarAngleAxis
                            dataKey="pillar"
                            tick={(props) => <AxisTick {...props} />}
                            stroke="transparent"
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={false}
                        />

                        {/* Average Startup */}
                        {active.average && (
                            <Radar
                                name="average"
                                dataKey="average"
                                stroke="#3c53a8"
                                strokeOpacity={0.6}
                                strokeWidth={1.5}
                                fill="#3c53a8"
                                fillOpacity={0.12}
                                dot={{ fill: '#3c53a8', r: 3, fillOpacity: 0.7, strokeWidth: 0 }}
                                activeDot={{ fill: '#3c53a8', r: 5, strokeWidth: 0, fillOpacity: 1 }}
                            />
                        )}

                        {/* Pinpoint-Verified */}
                        {active.verified && (
                            <Radar
                                name="verified"
                                dataKey="verified"
                                stroke="#5ca336"
                                strokeWidth={2}
                                fill="#5ca336"
                                fillOpacity={0.22}
                                dot={{ fill: '#5ca336', r: 3.5, fillOpacity: 0.9, strokeWidth: 0 }}
                                activeDot={{ fill: '#5ca336', r: 5.5, strokeWidth: 0, fillOpacity: 1 }}
                            />
                        )}
                    </RadarChart>
                </ResponsiveContainer>
            </ChartContainer>

            <Legend active={active} onToggle={toggle} />
        </div>
    );
}
