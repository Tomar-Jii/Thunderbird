import React from 'react';
import { BrainCircuit, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ExplainabilityFactor } from '../types/nowcast';

interface ExplainableAiPanelProps {
  factors: ExplainabilityFactor[];
  reasoning: string;
  isSimulated?: boolean;
}

export const ExplainableAiPanel: React.FC<ExplainableAiPanelProps> = ({
  factors,
  reasoning,
  isSimulated = true
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4 flex flex-col justify-between shadow-xl">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>EXPLAINABLE AI (XAI) ATTRIBUTION</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              Multi-Source Feature Weight & Convective Drivers
            </h4>
          </div>
          <div className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            SHAP Surrogate Attribution
          </div>
        </div>

        {/* Feature Importance Bars */}
        <div className="mt-3.5 space-y-3">
          {factors.map((factor) => {
            return (
              <div key={factor.factor} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="font-medium">{factor.factor}</span>
                    <span className="text-[11px] text-slate-400">({factor.observationValue})</span>
                  </div>
                  <span className="font-bold text-cyan-400 tabular-nums">
                    {factor.importancePct}%
                  </span>
                </div>

                {/* Progress track */}
                <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${factor.importancePct}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  {factor.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Meteorological Reasoning Card */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 font-bold mb-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Why is this area evaluated at elevated convective risk?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            "{reasoning}"
          </p>
        </div>
      </div>

      {/* Demo Disclaimer */}
      {isSimulated && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Attribution Mode: Surrogate Feature Weights</span>
          <span className="text-amber-400/80">Demo reasoning based on simulated state</span>
        </div>
      )}
    </div>
  );
};
