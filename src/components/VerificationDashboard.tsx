import React from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import type { VerificationMetrics } from '../types/nowcast';

interface VerificationDashboardProps {
  metrics: VerificationMetrics | null;
}

export const VerificationDashboard: React.FC<VerificationDashboardProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="p-8 rounded-2xl border border-slate-800 bg-[#090e1a] text-slate-400 font-mono text-xs">
        Loading meteorological verification metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Benchmark Context */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Target className="w-3.5 h-3.5" />
            <span>OBJECTIVE FORECAST VERIFICATION & METEOROLOGICAL METRICS</span>
          </div>
          <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] mt-0.5">
            Skill Scores & Statistical Contingency Evaluation
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            {metrics.datasetType} · Sample Size: {metrics.sampleSize.toLocaleString()} Convective Cases
          </p>
        </div>

        <div className="text-xs font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg max-w-md">
          <strong>Evaluation Notice:</strong> {metrics.disclaimer}
        </div>
      </div>

      {/* Primary Meteorological Contingency Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* CSI (Critical Success Index / Threat Score) */}
        <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <span>CSI (THREAT SCORE)</span>
            <span className="text-[10px] text-cyan-400">Target &gt; 0.65</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold font-mono text-cyan-300 tabular-nums">
              {metrics.criticalSuccessIndexCsi.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">Hits / (Hits + Misses + FAs)</span>
          </div>
        </div>

        {/* POD (Probability of Detection) */}
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
            <span>POD (HIT RATE)</span>
            <span className="text-[10px] text-emerald-400">Target &gt; 0.80</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold font-mono text-emerald-300 tabular-nums">
              {metrics.probabilityOfDetectionPod.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">Sensitivity / Recall</span>
          </div>
        </div>

        {/* FAR (False Alarm Ratio) */}
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
            <span>FAR (FALSE ALARMS)</span>
            <span className="text-[10px] text-amber-400">Target &lt; 0.20</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold font-mono text-amber-300 tabular-nums">
              {metrics.falseAlarmRatioFar.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">False Alarms / Forecast Yes</span>
          </div>
        </div>

        {/* Brier Score */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0c1220] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>BRIER SCORE</span>
            <span className="text-[10px] text-emerald-400">Lower is better</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold font-mono text-slate-200 tabular-nums">
              {metrics.brierScore.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">Probability calibration</span>
          </div>
        </div>

        {/* ROC-AUC */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0c1220] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>ROC-AUC</span>
            <span className="text-[10px] text-cyan-400">Discrimination</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold font-mono text-slate-200 tabular-nums">
              {metrics.rocAuc.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">Area under ROC curve</span>
          </div>
        </div>

        {/* F1 Score */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0c1220] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>F1-SCORE</span>
            <span className="text-[10px] text-slate-400">Harmonic Mean</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold font-mono text-slate-200 tabular-nums">
              {metrics.f1Score.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">Precision & Recall Balance</span>
          </div>
        </div>
      </div>

      {/* Lead-Time Skill Decay Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
              Verification Skill Evolution Across Prediction Horizons (0–120 Minutes)
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Empirical degradation of detection accuracy as lead time advances
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Stratified 15-Minute Windows
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3">LEAD TIME HORIZON</th>
                <th className="py-2 px-3">CRITICAL SUCCESS INDEX (CSI)</th>
                <th className="py-2 px-3">PROBABILITY OF DETECTION (POD)</th>
                <th className="py-2 px-3">FALSE ALARM RATIO (FAR)</th>
                <th className="py-2 px-3">OPERATIONAL RELIABILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metrics.leadTimeAverages.map((row) => (
                <tr key={row.horizonMinutes} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">
                    +{row.horizonMinutes} minutes
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200 tabular-nums">
                    {row.csi.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400 tabular-nums">
                    {row.pod.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-400 tabular-nums">
                    {row.far.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">
                    {row.horizonMinutes <= 30 ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                        OPTIMAL (Immediate Actionable)
                      </span>
                    ) : row.horizonMinutes <= 60 ? (
                      <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px]">
                        HIGH CONFIDENCE (Watch/Warning)
                      </span>
                    ) : (
                      <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        MODERATE (Advisory Surveillance)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
