import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';

export type RadarPillarScores = {
    potential?: number | null;
    agility?: number | null;
    risk?: number | null;
    alignment?: number | null;
    governance?: number | null;
    operations?: number | null;
    network?: number | null;
};

const DEMO_PILLARS = [
    { pillar: 'Potential', score: 91 },
    { pillar: 'Agility', score: 78 },
    { pillar: 'Risk', score: 74 },
    { pillar: 'Alignment', score: 85 },
    { pillar: 'Governance', score: 88 },
    { pillar: 'Operations', score: 82 },
    { pillar: 'Network', score: 79 },
];

const PILLAR_ORDER: { key: keyof RadarPillarScores; label: string }[] = [
    { key: 'potential', label: 'Potential' },
    { key: 'agility', label: 'Agility' },
    { key: 'risk', label: 'Risk' },
    { key: 'alignment', label: 'Alignment' },
    { key: 'governance', label: 'Governance' },
    { key: 'operations', label: 'Operations' },
    { key: 'network', label: 'Network' },
];

const chartConfig = {
    score: {
        label: 'PARAGON score',
        color: '#3A54A5',
    },
} satisfies ChartConfig;

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xl">
            <p className="mb-1 text-[11px] font-semibold tracking-[0.15em] text-zinc-400 uppercase">{label}</p>
            <p className="text-[13px] font-bold tabular-nums text-[#3A54A5]">
                {payload[0]?.value}
                <span className="text-[11px] font-normal text-zinc-400">/100</span>
            </p>
        </div>
    );
}

function AxisTick({ x, y, payload, cx, cy }: { x?: number; y?: number; cx?: number; cy?: number; payload?: { value: string } }) {
    if (!payload || x === undefined || y === undefined) return null;

    const dx = (x - (cx ?? 0)) * 0.08;
    const dy = (y - (cy ?? 0)) * 0.08;

    return (
        <text
            x={x + dx}
            y={y + dy}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(9, 9, 11, 0.6)"
            fontSize={10}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight={600}
            letterSpacing="0.04em"
        >
            {payload.value}
        </text>
    );
}

function buildPillars(scores?: RadarPillarScores | null) {
    if (!scores) return DEMO_PILLARS;

    return PILLAR_ORDER.map(({ key, label }) => ({
        pillar: label,
        score: Math.round(Number(scores[key] ?? 0)),
    }));
}

interface ParagonRadarChartProps {
    scores?: RadarPillarScores | null;
    /** When true (default if no scores), show marketing demo caption */
    illustrative?: boolean;
}

export function ParagonRadarChart({ scores = null, illustrative }: ParagonRadarChartProps) {
    const hasRealScores = scores != null && PILLAR_ORDER.some(({ key }) => scores[key] != null);
    const data = hasRealScores ? buildPillars(scores) : DEMO_PILLARS;
    const showIllustrative = illustrative ?? !hasRealScores;

    return (
        <div className="w-full">
            <ChartContainer config={chartConfig} className="mx-auto h-[320px] w-full max-w-[400px] md:h-[400px] md:max-w-none">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} outerRadius="62%">
                        <PolarGrid stroke="rgba(9, 9, 11, 0.08)" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="pillar" tick={(props) => <AxisTick {...props} />} stroke="transparent" />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Radar
                            name="score"
                            dataKey="score"
                            stroke="#3A54A5"
                            strokeWidth={2}
                            fill="#3A54A5"
                            fillOpacity={0.22}
                            dot={{ fill: '#3A54A5', r: 3.5, fillOpacity: 0.9, strokeWidth: 0 }}
                            activeDot={{ fill: '#3A54A5', r: 5.5, strokeWidth: 0, fillOpacity: 1 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </ChartContainer>
            <p className="mt-2 text-center text-[11px] font-medium tracking-wide text-zinc-400">
                {showIllustrative ? 'Illustrative profile shape' : 'Your Self-Scan pillar scores'}
            </p>
        </div>
    );
}

export default ParagonRadarChart;
