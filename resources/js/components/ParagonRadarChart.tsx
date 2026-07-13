import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';

const pillars = [
    { pillar: 'Potential & Scale', verified: 91, average: 48 },
    { pillar: 'Agility & Execution', verified: 78, average: 55 },
    { pillar: 'Risk Mitigation', verified: 86, average: 44 },
    { pillar: 'Alignment & Vision', verified: 85, average: 38 },
    { pillar: 'Corporate Governance', verified: 88, average: 42 },
    { pillar: 'Operational Systems', verified: 82, average: 51 },
    { pillar: 'Network & Ecosystem', verified: 79, average: 46 },
];

const chartConfig = {
    verified: {
        label: 'Pinpoint-Verified',
        color: '#3A54A5',
    },
    average: {
        label: 'Average Startup',
        color: '#94A3B8',
    },
} satisfies ChartConfig;

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xl">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.15em] text-zinc-400 uppercase">{label}</p>
            {payload.map((entry) => {
                const isVerified = entry.dataKey === 'verified';
                const color = isVerified ? '#3A54A5' : '#94A3B8';
                return (
                    <div key={entry.dataKey} className="flex items-center gap-2.5 py-0.5">
                        <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[13px] text-zinc-600">{isVerified ? 'Pinpoint-Verified' : 'Average Startup'}</span>
                        <span className="ml-auto text-[13px] font-bold tabular-nums" style={{ color: color }}>
                            {entry.value}
                            <span className="text-[11px] font-normal text-zinc-400">/100</span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Axis tick ────────────────────────────────────────────────────────────────

function AxisTick({ x, y, payload, cx, cy }: { x?: number; y?: number; cx?: number; cy?: number; payload?: { value: string } }) {
    if (!payload || x === undefined || y === undefined) return null;

    // Gentle push so text doesn't hit SVG boundary on mobile
    const dx = (x - (cx ?? 0)) * 0.08;
    const dy = (y - (cy ?? 0)) * 0.08;

    return (
        <text
            x={x + dx}
            y={y + dy}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(9, 9, 11, 0.6)"
            fontSize={9}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight={600}
            letterSpacing="0.04em"
        >
            {payload.value}
        </text>
    );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend({ active, onToggle }: { active: { verified: boolean; average: boolean }; onToggle: (key: 'verified' | 'average') => void }) {
    return (
        <div className="-mt-8 mb-4 flex flex-wrap items-center justify-center gap-3 md:-mt-4 md:mb-0 md:gap-6">
            {(['verified', 'average'] as const).map((key) => {
                const isVerified = key === 'verified';
                const color = isVerified ? '#3A54A5' : '#94A3B8';
                const label = isVerified ? 'Pinpoint-Verified' : 'Average Startup';
                const isActive = active[key];

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onToggle(key)}
                        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50"
                        style={{ opacity: isActive ? 1 : 0.35 }}
                    >
                        <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
                        <span style={{ color: isActive ? '#18181b' : '#a1a1aa' }}>{label}</span>
                    </button>
                );
            })}
        </div>
    );
}

// ─── Main chart ───────────────────────────────────────────────────────────────

export function ParagonRadarChart() {
    const [active, setActive] = useState({ verified: true, average: true });

    const toggle = (key: 'verified' | 'average') => setActive((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="w-full">
            <ChartContainer config={chartConfig} className="mx-auto h-[320px] w-full max-w-[400px] md:h-[400px] md:max-w-none">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={pillars} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} outerRadius="62%">
                        <PolarGrid stroke="rgba(9, 9, 11, 0.08)" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="pillar" tick={(props) => <AxisTick {...props} />} stroke="transparent" />
                        <Tooltip content={<CustomTooltip />} cursor={false} />

                        {/* Average Startup */}
                        {active.average && (
                            <Radar
                                name="average"
                                dataKey="average"
                                stroke="#94A3B8"
                                strokeOpacity={0.6}
                                strokeWidth={1.5}
                                fill="#94A3B8"
                                fillOpacity={0.12}
                                dot={{ fill: '#94A3B8', r: 3, fillOpacity: 0.7, strokeWidth: 0 }}
                                activeDot={{ fill: '#94A3B8', r: 5, strokeWidth: 0, fillOpacity: 1 }}
                            />
                        )}

                        {/* Pinpoint-Verified */}
                        {active.verified && (
                            <Radar
                                name="verified"
                                dataKey="verified"
                                stroke="#3A54A5"
                                strokeWidth={2}
                                fill="#3A54A5"
                                fillOpacity={0.22}
                                dot={{ fill: '#3A54A5', r: 3.5, fillOpacity: 0.9, strokeWidth: 0 }}
                                activeDot={{ fill: '#3A54A5', r: 5.5, strokeWidth: 0, fillOpacity: 1 }}
                            />
                        )}
                    </RadarChart>
                </ResponsiveContainer>
            </ChartContainer>

            <Legend active={active} onToggle={toggle} />
        </div>
    );
}

export default ParagonRadarChart;
