import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  BookOpen, 
  Download, 
  Code, 
  Server, 
  Layers, 
  Copy, 
  Check,
  ExternalLink
} from 'lucide-react';
import { downloadProjectZip } from '../utils/downloadZip';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const endpoints = [
    { method: 'GET', path: '/health', desc: 'System health check and version metadata', example: 'curl -X GET http://localhost:3000/health' },
    { method: 'GET', path: '/api/v1/system/status', desc: 'Real-time telemetry, clocks and operating mode', example: 'curl -X GET http://localhost:3000/api/v1/system/status' },
    { method: 'GET', path: '/api/v1/data/sources', desc: 'Status, latency, and coverage of 6 observation feeds', example: 'curl -X GET http://localhost:3000/api/v1/data/sources' },
    { method: 'GET', path: '/api/v1/observations/current', desc: 'Current atmospheric observations across all MP stations', example: 'curl -X GET http://localhost:3000/api/v1/observations/current' },
    { method: 'GET', path: '/api/v1/observations/{location}', desc: 'Atmospheric sounding profile for a specific station (bhopal, indore, etc.)', example: 'curl -X GET http://localhost:3000/api/v1/observations/bhopal' },
    { method: 'GET', path: '/api/v1/storm-cells', desc: 'Detected convective storm centroids, dBZ, echo tops, and motion vectors', example: 'curl -X GET http://localhost:3000/api/v1/storm-cells' },
    { method: 'GET', path: '/api/v1/lightning', desc: 'Real-time Cloud-to-Ground & Intra-Cloud lightning discharges with age decay', example: 'curl -X GET http://localhost:3000/api/v1/lightning' },
    { method: 'GET', path: '/api/v1/forecast/{location}', desc: '0–120m nowcast horizons, probabilities, and XAI feature attributions', example: 'curl -X GET http://localhost:3000/api/v1/forecast/bhopal' },
    { method: 'POST', path: '/api/v1/nowcast/run', desc: 'Trigger on-demand multi-source atmospheric nowcast cycle', example: 'curl -X POST http://localhost:3000/api/v1/nowcast/run' },
    { method: 'GET', path: '/api/v1/alerts', desc: 'Active convective thunderstorm & lightning warnings', example: 'curl -X GET http://localhost:3000/api/v1/alerts' },
    { method: 'POST', path: '/api/v1/alerts/{id}/acknowledge', desc: 'Acknowledge reception of a critical warning', example: 'curl -X POST http://localhost:3000/api/v1/alerts/ALT-MP-2601/acknowledge' },
    { method: 'GET', path: '/api/v1/events', desc: 'Ground-truth verified historical storm outbreak events', example: 'curl -X GET http://localhost:3000/api/v1/events' },
    { method: 'GET', path: '/api/v1/metrics', desc: 'Forecast verification scores (CSI, POD, FAR, Brier, ROC-AUC)', example: 'curl -X GET http://localhost:3000/api/v1/metrics' },
    { method: 'GET', path: '/api/v1/model/status', desc: 'ML pipeline monitoring, inference latency, and surrogate health', example: 'curl -X GET http://localhost:3000/api/v1/model/status' }
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#090e1a] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
                StormSight AI Documentation & Backend API Reference
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                SIH26072 Problem Statement · OpenAPI 3.0 Compatible · REST Endpoints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Start Commands */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between text-cyan-400 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>LOCAL & CLOUD RUN COMMANDS</span>
              </span>
            </div>
            <pre className="text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
{`# 1. Full-Stack Dev Server (Express + Vite on Port 3000)
npm install
npm run dev

# 2. Standalone Python FastAPI Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Docker Container Build & Run
docker build -t stormsight-ai .
docker run -p 3000:3000 stormsight-ai`}
            </pre>
          </div>

          {/* Endpoints Table */}
          <div>
            <h4 className="text-sm font-bold text-white font-mono uppercase mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Production REST API Endpoints</span>
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {endpoints.map((ep, idx) => (
                <div
                  key={ep.path}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-bold text-slate-200">{ep.path}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      {ep.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(ep.example, idx)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
                      title="Copy curl command"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === idx ? 'Copied' : 'curl'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <span>Target Platform: Vercel (Web) & Render/Docker (Backend)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadProjectZip()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download stormsight-ai.zip</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
