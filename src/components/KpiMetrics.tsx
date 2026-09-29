import React from 'react';
import { 
  CloudLightning, 
  Zap, 
  ShieldCheck, 
  AlertOctagon, 
  Activity, 
  ArrowUpRight,
  Radio
} from 'lucide-react';
import type { RiskLevel } from '../types/nowcast';

interface KpiMetricsProps {
  currentRisk: RiskLevel;
  stormProbabilityPct: number;
  lightningProbabilityPct: number;
  confidencePct: number;
  activeAlertsCount: number;
  sourcesOnlineCount: number;
  totalSourcesCount: number;
  selectedLocationName: string;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({
  currentRisk,
  stormProbabilityPct,
  lightningProbabilityPct,
  confidencePct,
  activeAlertsCount,
  sourcesOnlineCount,
  totalSourcesCount,
  selectedLocationName
}) => {
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'SEVERE':
        return { text: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10', label: 'SEVERE RISK' };
      case 'HIGH':
        return { text: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10', label: 'HIGH RISK' };
      case 'MODERATE':
        return { text: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', label: 'MODERATE RISK' };
      case 'LOW':
      default:
        return { text: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', label: 'LOW RISK' };
    }
  };

  const riskStyle = getRiskColor(currentRisk);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {/* KPI 1: Thunderstorm Risk */}
      <div className={`p-3.5 rounded-xl border ${riskStyle.border} ${riskStyle.bg} backdrop-blur-sm transition-all flex flex-col justify-between`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Convective Risk
          </span>
          <CloudLightning className={`w-4 h-4 ${riskStyle.text}`} />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono tabular-nums ${riskStyle.text}`}>
              {stormProbabilityPct}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">% PROB</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono">
            <span className={`font-semibold ${riskStyle.text}`}>{riskStyle.label}</span>
            <span className="text-slate-400 truncate max-w-[90px]">{selectedLocationName}</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Lightning Activity */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0c1220]/80 backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Lightning Probability
          </span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-400">
              {lightningProbabilityPct}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">% (0-30m)</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-amber-300">CG/IC Discharge</span>
            <span className="text-slate-300 font-mono">Surge Trend ▲</span>
          </div>
        </div>
      </div>

      {/* KPI 3: AI Model Confidence */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0c1220]/80 backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Model Confidence
          </span>
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-cyan-400">
              {confidencePct}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">% CALIBRATED</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Ensemble Trust</span>
            <span className="text-emerald-400">High Reliability</span>
          </div>
        </div>
      </div>

      {/* KPI 4: Active Warnings */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0c1220]/80 backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Active Warnings
          </span>
          <AlertOctagon className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-400">
              {activeAlertsCount}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">AREAS</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-rose-400 font-semibold">1 SEVERE NOW</span>
            <span className="text-slate-400">Action Mandated</span>
          </div>
        </div>
      </div>

      {/* KPI 5: Observation Feed Health */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0c1220]/80 backdrop-blur-sm flex flex-col justify-between col-span-2 md:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Multisource Feeds
          </span>
          <Radio className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {sourcesOnlineCount}/{totalSourcesCount}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">ONLINE</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-slate-300">DWR · INSAT · DAMINI</span>
            <span className="text-emerald-400">12s latency</span>
          </div>
        </div>
      </div>
    </div>
  );
};
