import React from 'react';
import { 
  Radio, 
  Satellite, 
  Zap, 
  Wind, 
  Cpu, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Activity,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import type { DataSourceHealthInfo, ModelHealthStatus } from '../types/nowcast';

interface DataSourceHealthProps {
  dataSources: DataSourceHealthInfo[];
  modelHealth: ModelHealthStatus | null;
  onRefresh: () => void;
}

export const DataSourceHealth: React.FC<DataSourceHealthProps> = ({
  dataSources,
  modelHealth,
  onRefresh
}) => {
  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'RADAR':
        return Radio;
      case 'SATELLITE':
        return Satellite;
      case 'LIGHTNING':
        return Zap;
      case 'NWP':
        return Cpu;
      case 'ATMOSPHERIC':
      case 'SURFACE_AWS':
      default:
        return Wind;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>ONLINE</span>
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>DEGRADED</span>
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>OFFLINE</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Refresh Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>METEOROLOGICAL SENSOR SURVEILLANCE & LATENCY</span>
          </div>
          <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] mt-0.5">
            Atmospheric Observation Ingestion Network
          </h3>
          <p className="text-xs text-slate-400">
            Real-time feed health, latency benchmarks, and fallback routing for SIH26072
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
            Demo Mode (Simulated Observation Telemetry)
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Poll Health</span>
          </button>
        </div>
      </div>

      {/* Sensor Ingestion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {dataSources.map((source) => {
          const Icon = getSensorIcon(source.sensorType);

          return (
            <div
              key={source.id}
              className="rounded-2xl border border-slate-800 bg-[#0c1220] p-4 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-sans">
                        {source.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        {source.id}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(source.status)}
                </div>

                <div className="mt-3 text-xs text-slate-300">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">PROVIDER & SENSORS</span>
                  <p className="font-mono text-slate-200 text-[11px] leading-tight bg-slate-900/60 p-2 rounded border border-slate-800/80">
                    {source.provider}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">LATENCY</span>
                    <span className="font-bold text-cyan-400">{source.latencySeconds}s</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">COVERAGE</span>
                    <span className="font-bold text-emerald-400">{source.coveragePct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">ACTIVE STATIONS</span>
                    <span className="font-bold text-slate-200">{source.stationsActive} / {source.totalStations}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">CADENCE</span>
                    <span className="font-bold text-slate-300">Rapid Scan</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Freshness: {source.dataFreshnessText}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Health & Architecture Card */}
      {modelHealth && (
        <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
                  AI/ML Model Pipeline Status & Latency Budget
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Active Model: {modelHealth.activeModelName} ({modelHealth.modelVersion})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                ● STATUS: {modelHealth.status}
              </span>
              <span className="text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                MODE: {modelHealth.mode}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <span className="text-[10px] text-slate-400 block">AVG INFERENCE LATENCY</span>
              <span className="text-xl font-bold text-cyan-400 tabular-nums">
                {modelHealth.averageInferenceLatencyMs} ms
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Target &lt; 50ms</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <span className="text-[10px] text-slate-400 block">P95 LATENCY</span>
              <span className="text-xl font-bold text-slate-200 tabular-nums">
                {modelHealth.p95LatencyMs} ms
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Zero Pipeline Jitter</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <span className="text-[10px] text-slate-400 block">DAILY INFERENCES</span>
              <span className="text-xl font-bold text-emerald-400 tabular-nums">
                {modelHealth.totalInferencesToday.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Automated Cycles</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <span className="text-[10px] text-slate-400 block">FALLBACK READINESS</span>
              <span className="text-xl font-bold text-indigo-400">
                SURROGATE OK
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Graceful Degradation</span>
            </div>
          </div>

          {/* Confidence Distribution */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-xs font-mono text-slate-300 font-bold block mb-2">
              HISTORICAL INFERENCE CONFIDENCE DISTRIBUTION
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
              {modelHealth.confidenceDistribution.map((item) => (
                <div key={item.bracket} className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">{item.bracket}</div>
                  <div className="text-sm font-bold text-cyan-300">{item.percentage}%</div>
                  <div className="text-[10px] text-slate-400">{item.count} samples</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
