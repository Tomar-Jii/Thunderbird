import React, { useState } from 'react';
import { 
  Radio, 
  Satellite, 
  Zap, 
  Wind, 
  Cpu, 
  ArrowDown, 
  Binary, 
  Network, 
  Map, 
  BellRing,
  Layers,
  ChevronRight,
  Database,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const MultiSourceFusion: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const pipelineSteps = [
    {
      id: 0,
      title: 'Multisource Atmospheric Ingestion',
      subtitle: '5 Heterogeneous Observation Feeds',
      icon: Database,
      details: [
        { label: 'Doppler Weather Radars', desc: 'IMD S/C-Band radial velocity, reflectivity (dBZ), echo tops, and vertical integrated liquid (VIL).' },
        { label: 'INSAT-3D/3DR Satellite', desc: 'Thermal IR (10.8 µm), Water Vapor (6.8 µm), rapid cloud top cooling rate, and convective overshooting.' },
        { label: 'IITM / IMD Damini Lightning', desc: 'Total lightning network tracking Cloud-to-Ground (CG) and Intra-Cloud (IC) flash rate jumps.' },
        { label: 'Surface AWS Networks', desc: 'Continuous temperature, relative humidity, pressure drop rate, and 10m wind gust convergence.' },
        { label: 'Numerical Models (NWP)', desc: 'NCMRWF/IMD 4km Convection-Permitting Models providing background shear, CAPE, and CIN fields.' }
      ]
    },
    {
      id: 1,
      title: 'Spatiotemporal Feature Engineering',
      subtitle: 'Surrogate Convective Indicators',
      icon: Sliders,
      details: [
        { label: 'Convective Cell Tracking', desc: 'TITAN/SCIT cell segmentation algorithm extracting centroid coordinates, speed, and heading vector.' },
        { label: 'Thermodynamic Buoyancy', desc: 'CAPE vs CIN ratio evaluation; mid-tropospheric lapse rate derivation for explosive updrafts.' },
        { label: 'Total Lightning Jump Trend', desc: 'Derivative dF/dt (flashes per 2-min window) acting as an empirical 15-30m precursor to severe weather.' },
        { label: 'Doppler Advection Matrix', desc: 'Semi-Lagrangian optical flow extrapolation calculating cell translation across the forecast grid.' }
      ]
    },
    {
      id: 2,
      title: 'Dual-Stream AI / ML Architecture',
      subtitle: 'LightGBM + ConvLSTM Radar Surrogate',
      icon: Network,
      details: [
        { label: 'Spatial Convection Stream', desc: 'Convolutional LSTM (ConvLSTM) preserving spatial radar reflectivity morphology over 0-120 minutes.' },
        { label: 'Tabular Telemetry Stream', desc: 'LightGBM Gradient Boosting Trees classifying probability of severe thunderstorm initiation and lightning strike count.' },
        { label: 'Ensemble Meta-Learner', desc: 'Bayesian model averaging generating well-calibrated posterior probabilities and epistemic confidence intervals.' },
        { label: 'Explainability Engine', desc: 'Fast TreeSHAP kernel computing live feature attribution for meteorological decision transparency.' }
      ]
    },
    {
      id: 3,
      title: 'High-Resolution 0-120m Risk Grid',
      subtitle: 'Dynamic Advected Risk Contour',
      icon: Map,
      details: [
        { label: 'Spatial Risk Surfaces', desc: 'Continuous 1km x 1km probability grid mapped to 4-tier risk levels (Low, Moderate, High, Severe).' },
        { label: 'Lead-Time Horizons', desc: 'Discretized 15-minute time steps capturing convective initiation, maturity, and dissipation phases.' },
        { label: 'Uncertainty Bounds', desc: 'Confidence score calculated from ensemble variance and sensor data completeness index.' }
      ]
    },
    {
      id: 4,
      title: 'Autonomous Alert & Dissemination Engine',
      subtitle: 'Targeted Multi-Channel Early Warnings',
      icon: BellRing,
      details: [
        { label: 'Threshold-Triggered Watch/Warnings', desc: 'Instantaneous warning synthesis when storm probability > 70% or lightning jump threshold tripped.' },
        { label: 'Geo-Fenced District Alerts', desc: 'Administrative boundary intersection for IMD district-level nowcast bulletin generation.' },
        { label: 'Actionable Protocols', desc: 'Context-aware disaster management advisories for civil defense, power utilities, and aviation.' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Layers className="w-3.5 h-3.5" />
          <span>END-TO-END SYSTEM ARCHITECTURE</span>
        </div>
        <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] mt-0.5">
          Multi-Source Convective Observation & Machine Learning Fusion Pipeline
        </h3>
        <p className="text-xs text-slate-400">
          How radar sweeps, satellite radiance, lightning sensors, and atmospheric soundings are unified into calibrated 0–120m nowcasts.
        </p>
      </div>

      {/* Main Flow Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Stage 1: Ingestion */}
        <div
          onClick={() => setActiveStep(0)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeStep === 0
              ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">STAGE 01</div>
            <h4 className="text-sm font-bold text-white mt-1">Multi-Source Ingestion</h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-cyan-400" /> DWR Radars</div>
              <div className="flex items-center gap-1.5"><Satellite className="w-3.5 h-3.5 text-indigo-400" /> INSAT-3DR</div>
              <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Damini Lightning</div>
              <div className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-emerald-400" /> Surface AWS</div>
              <div className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-purple-400" /> NWP Grids</div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center justify-between">
            <span>5 Primary Feeds</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Stage 2: Feature Engineering */}
        <div
          onClick={() => setActiveStep(1)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeStep === 1
              ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">STAGE 02</div>
            <h4 className="text-sm font-bold text-white mt-1">Feature Engineering</h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
              <div>· CAPE / CIN Sounding</div>
              <div>· dBZ Echo Top Heights</div>
              <div>· Lightning Jump (dF/dt)</div>
              <div>· Cloud Top Cooling Rate</div>
              <div>· Optical Flow Vectors</div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center justify-between">
            <span>Surrogate Indicators</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Stage 3: ML Model */}
        <div
          onClick={() => setActiveStep(2)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeStep === 2
              ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">STAGE 03</div>
            <h4 className="text-sm font-bold text-white mt-1">ML Model Ensemble</h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
              <div>· LightGBM Gradient Tree</div>
              <div>· ConvLSTM Spatiotemporal</div>
              <div>· Bayesian Calibration</div>
              <div>· SHAP XAI Attribution</div>
              <div>· Lead-time Weighting</div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center justify-between">
            <span>28ms Inference</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Stage 4: Risk Map */}
        <div
          onClick={() => setActiveStep(3)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeStep === 3
              ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">STAGE 04</div>
            <h4 className="text-sm font-bold text-white mt-1">Advective Risk Grid</h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
              <div>· 0–120m Horizons</div>
              <div>· 4 Risk Tiers (Low-Severe)</div>
              <div>· Cell Advection Vector</div>
              <div>· Strike Density Buffer</div>
              <div>· Confidence Intervals</div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center justify-between">
            <span>1km Resolution</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Stage 5: Alert Engine */}
        <div
          onClick={() => setActiveStep(4)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeStep === 4
              ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-rose-400 font-bold uppercase">STAGE 05</div>
            <h4 className="text-sm font-bold text-white mt-1">Alerting Engine</h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
              <div>· Severity Classification</div>
              <div>· District Boundary Filter</div>
              <div>· CAP Protocol Formats</div>
              <div>· Civil Defense Advisory</div>
              <div>· Audit & Verification</div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-mono text-rose-400 flex items-center justify-between">
            <span>Instant Dispatch</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Selected Step Detailed Deep-Dive Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-5 shadow-2xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            {React.createElement(pipelineSteps[activeStep].icon, { className: 'w-4 h-4' })}
          </div>
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">DETAILED SPECIFICATION</span>
            <h4 className="text-base font-bold text-white">
              {pipelineSteps[activeStep].title} — <span className="text-slate-400 text-sm">{pipelineSteps[activeStep].subtitle}</span>
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {pipelineSteps[activeStep].details.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item.label}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
