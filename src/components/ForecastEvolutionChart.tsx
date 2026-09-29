import React, { useState } from 'react';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';
import type { ForecastHorizonPoint } from '../types/nowcast';

interface ForecastEvolutionChartProps {
  horizons: ForecastHorizonPoint[];
  locationName: string;
}

export const ForecastEvolutionChart: React.FC<ForecastEvolutionChartProps> = ({
  horizons,
  locationName
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!horizons || horizons.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090e1a] text-slate-400 font-mono text-xs">
        No forecast timeline available
      </div>
    );
  }

  // Chart coordinates
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Scale calculations (X: 0 to 120, Y: 0 to 100)
  const getX = (min: number) => padding.left + (min / 120) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - (val / 100) * innerHeight;

  // Generate SVG path strings
  const stormPath = horizons
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(h.minutesAhead)} ${getY(h.stormProbabilityPct)}`)
    .join(' ');

  const stormArea = `${stormPath} L ${getX(120)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  const lightningPath = horizons
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(h.minutesAhead)} ${getY(h.lightningProbabilityPct)}`)
    .join(' ');

  const confidencePath = horizons
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(h.minutesAhead)} ${getY(h.confidencePct)}`)
    .join(' ');

  const activePoint = hoverIndex !== null ? horizons[hoverIndex] : horizons[0];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4 flex flex-col justify-between shadow-xl">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>0 – 120 MINUTE NOWCAST EVOLUTION</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-0.5">
            Convective Trajectory & Probability Horizons ({locationName})
          </h4>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400"></span>
            <span className="text-slate-300">Thunderstorm %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed border-amber-400"></span>
            <span className="text-slate-300">Lightning %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-400 border-b border-dotted border-indigo-400"></span>
            <span className="text-slate-400">Confidence</span>
          </div>
        </div>
      </div>

      {/* SVG Stage */}
      <div className="relative mt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="stormGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line
                x1={padding.left}
                y1={getY(v)}
                x2={svgWidth - padding.right}
                y2={getY(v)}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray={v === 0 ? 'none' : '3, 3'}
              />
              <text
                x={padding.left - 8}
                y={getY(v) + 3}
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {v}%
              </text>
            </g>
          ))}

          {/* Severe threshold line at 70% */}
          <line
            x1={padding.left}
            y1={getY(70)}
            x2={svgWidth - padding.right}
            y2={getY(70)}
            stroke="#f43f5e"
            strokeWidth="1"
            strokeDasharray="4, 4"
            opacity="0.5"
          />
          <text
            x={svgWidth - padding.right - 4}
            y={getY(70) - 4}
            fill="#f43f5e"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            SEVERE THRESHOLD (70%)
          </text>

          {/* X Axis Ticks */}
          {[0, 15, 30, 45, 60, 90, 120].map((min) => (
            <g key={min}>
              <line
                x1={getX(min)}
                y1={padding.top}
                x2={getX(min)}
                y2={padding.top + innerHeight}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2, 4"
              />
              <text
                x={getX(min)}
                y={padding.top + innerHeight + 18}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                +{min}m
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={stormArea} fill="url(#stormGradient)" />

          {/* Confidence Curve (Dotted) */}
          <path
            d={confidencePath}
            fill="none"
            stroke="#818cf8"
            strokeWidth="1.8"
            strokeDasharray="3, 3"
          />

          {/* Lightning Curve (Dashed) */}
          <path
            d={lightningPath}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.2"
            strokeDasharray="6, 4"
          />

          {/* Storm Probability Curve (Solid Cyan) */}
          <path
            d={stormPath}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
          />

          {/* Data Points */}
          {horizons.map((h, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g
                key={h.minutesAhead}
                onMouseEnter={() => setHoverIndex(i)}
                className="cursor-pointer"
              >
                {/* Invisible hover target */}
                <circle
                  cx={getX(h.minutesAhead)}
                  cy={getY(h.stormProbabilityPct)}
                  r="14"
                  fill="transparent"
                />

                {/* Point */}
                <circle
                  cx={getX(h.minutesAhead)}
                  cy={getY(h.stormProbabilityPct)}
                  r={isHovered ? 6 : 4}
                  fill="#22d3ee"
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all"
                />

                <circle
                  cx={getX(h.minutesAhead)}
                  cy={getY(h.lightningProbabilityPct)}
                  r={isHovered ? 5 : 3}
                  fill="#fbbf24"
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all"
                />
              </g>
            );
          })}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <line
              x1={getX(horizons[hoverIndex].minutesAhead)}
              y1={padding.top}
              x2={getX(horizons[hoverIndex].minutesAhead)}
              y2={padding.top + innerHeight}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="2, 2"
            />
          )}
        </svg>

        {/* Hover Inspector Pill / HUD */}
        <div className="mt-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">T+{activePoint.minutesAhead}m Horizon:</span>
            <span className="text-slate-300">
              Storm: <strong className="text-cyan-300">{activePoint.stormProbabilityPct}%</strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300">
              Lightning: <strong className="text-amber-400">{activePoint.lightningProbabilityPct}%</strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">
              Confidence: <strong className="text-indigo-300">{activePoint.confidencePct}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Reflectivity:</span>
            <span className="text-rose-400 font-bold">{activePoint.expectedReflectivityDbz} dBZ</span>
            <span className="text-slate-400">Severity:</span>
            <span className="text-amber-400 font-bold">{activePoint.riskLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
