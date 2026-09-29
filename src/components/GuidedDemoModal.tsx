import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  Radio, 
  Cpu, 
  Map, 
  AlertTriangle, 
  BarChart3, 
  Layers,
  Sparkles
} from 'lucide-react';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: string) => void;
  onSelectHorizon: (min: number) => void;
  onRunNowcast: () => void;
  setActiveTab: (tab: string) => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onSelectHorizon,
  onRunNowcast,
  setActiveTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      step: 1,
      title: 'Problem & Mission Context (SIH26072)',
      headline: 'AIML Thunderstorm & Lightning Nowcasting for IMD / MoES',
      desc: 'Severe convective storms inflict hundreds of casualties and agricultural losses across central India every pre-monsoon. StormSight AI fuses Doppler Radar, INSAT-3DR Satellite, and Damini Lightning to deliver 0–120 minute hyper-local nowcasts with actionable warning lead times.',
      actionLabel: 'Inspect Active Outbreak Region',
      action: () => {
        setActiveTab('dashboard');
        onSelectLocation('bhopal');
      }
    },
    {
      step: 2,
      title: 'Multisource Observation Ingestion',
      headline: 'Real-Time Ingestion of Heterogeneous Sensor Streams',
      desc: 'The ingestion layer continuously ingests 5 independent data channels: IMD Doppler Weather Radar (Bhopal/Indore S & C band), INSAT-3DR TIR-1 brightness temperatures, Damini/IITM total lightning discharges, and Surface AWS thermodynamic soundings.',
      actionLabel: 'View Sensor Health & Latencies',
      action: () => {
        setActiveTab('health');
      }
    },
    {
      step: 3,
      title: 'Interactive Geospatial Map Stage',
      headline: 'Real Leaflet Map with Doppler dBZ & Lightning Discharges',
      desc: 'Observe the dynamic storm cells (Cell SC-01 Bhopal-Raisen Supercell) with Doppler reflectivity cores exceeding 50 dBZ. Real-time lightning strikes (Cloud-to-Ground & Intra-Cloud) are plotted with age decay rings.',
      actionLabel: 'Return to Map Console',
      action: () => {
        setActiveTab('dashboard');
        onSelectLocation('bhopal');
      }
    },
    {
      step: 4,
      title: 'Triggering AI Nowcast Inference',
      headline: 'Feature Engineering & ConvLSTM + LightGBM Execution',
      desc: 'When an inference cycle runs, the backend extracts CAPE, CIN, vertical wind shear, radar echo tops, and the lightning jump derivative (dF/dt). The dual-stream ensemble generates calibrated probabilities in under 30ms.',
      actionLabel: 'Execute Nowcast Inference Cycle',
      action: () => {
        setActiveTab('dashboard');
        onRunNowcast();
      }
    },
    {
      step: 5,
      title: 'Convective Advection Across 0–120m',
      headline: 'Semi-Lagrangian Motion & Probability Evolution',
      desc: 'By advancing the forecast horizon (+15m, +30m, +60m), storm cells dynamically advect along their 55° NE trajectory at 36 km/h. Watch how risk decays or intensifies over the 2-hour window.',
      actionLabel: 'Scrub Horizon to +30m Peak',
      action: () => {
        setActiveTab('dashboard');
        onSelectHorizon(30);
      }
    },
    {
      step: 6,
      title: 'Autonomous Alert Center',
      headline: 'Instantaneous Warning Synthesis & Recommended Actions',
      desc: 'When storm probability exceeds 70% and lightning frequency accelerates, a SEVERE THUNDERSTORM WARNING is automatically generated for the Bhopal region with explicit shelter protocols.',
      actionLabel: 'Examine Alert Center',
      action: () => {
        setActiveTab('alerts');
      }
    },
    {
      step: 7,
      title: 'Explainable AI (XAI) Attribution',
      headline: 'Transparent SHAP Driver Weights & Meteorological Reasoning',
      desc: 'Operational forecasters cannot trust a black box. StormSight AI displays feature attributions (CAPE 88%, Radar dBZ 82%, Lightning Jump 85%) paired with natural-language meteorological reasoning.',
      actionLabel: 'Review XAI Attribution',
      action: () => {
        setActiveTab('dashboard');
        onSelectHorizon(0);
      }
    },
    {
      step: 8,
      title: 'Multisource Fusion Architecture',
      headline: 'End-to-End Pipeline Visualization',
      desc: 'Review the technical architecture showing the ingestion of radar, satellite, lightning, AWS, and NWP feeds into feature engineering, ML ensemble, advective risk grid, and automated dissemination.',
      actionLabel: 'Inspect Pipeline Architecture',
      action: () => {
        setActiveTab('fusion');
      }
    },
    {
      step: 9,
      title: 'Objective Forecast Verification',
      headline: 'CSI, POD, FAR, Brier Score, and ROC-AUC Skill Evaluation',
      desc: 'Validate the platform against held-out benchmark datasets: CSI of 0.762, Probability of Detection (POD) of 0.882, and False Alarm Ratio (FAR) of 0.152 across 14,250 convective cases.',
      actionLabel: 'View Verification Dashboard',
      action: () => {
        setActiveTab('verification');
      }
    },
    {
      step: 10,
      title: 'Vertical Sounding & 3D Convection',
      headline: 'Interactive Skew-T / Log-P Energetics & Radar RHI Core',
      desc: 'Deep-dive into thermodynamic buoyancy physics: inspect CAPE (3,850 J/kg), CIN, Freezing Level (4.8 km), and the critical -10°C to -30°C Hail Growth Zone. Drag temperature and dewpoint sensitivity sliders in real-time.',
      actionLabel: 'Open Sounding & 3D Convection',
      action: () => {
        setActiveTab('sounding');
      }
    },
    {
      step: 11,
      title: 'Tactical Aviation & Infrastructure Defense',
      headline: 'TDWR Wind Shear, 765kV Power Grid Islanding & Multilingual CBS',
      desc: 'Out-of-the-box operational modules: Runway Low-Level Wind Shear (LLWS) alerts for VECC/VIDP/VABB, PowerGrid high-voltage transmission line lightning trip defense, PINN vs optical flow benchmarks, and multilingual CAP 1.2 cell broadcast in Hindi, English, Bengali, and Marathi.',
      actionLabel: 'Explore Aviation & Grid Defense',
      action: () => {
        setActiveTab('tactical');
      }
    }
  ];

  if (!isOpen) return null;

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      steps[nextIdx].action();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      steps[prevIdx].action();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#090e1a] border border-cyan-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-cyan-500/10 flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              JUDGES GUIDED EVALUATION TOUR · STEP {current.step} OF {steps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
            <span>SIH26072 Nowcasting Prototype Walkthrough</span>
          </div>

          <h3 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif]">
            {current.headline}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {current.desc}
          </p>

          <div className="pt-2">
            <button
              onClick={current.action}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold hover:bg-cyan-500/30 transition-all"
            >
              <span>Trigger Step Action:</span>
              <span className="underline">{current.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Footer Controls */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-cyan-400'
                    : i < currentStep
                    ? 'w-2 bg-cyan-700'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
