import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCw, 
  BookOpen, 
  Layers, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  Radio, 
  Cpu, 
  Compass,
  CheckCircle2,
  Activity,
  Plane,
  TrendingUp
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunNowcast: () => void;
  isRunningNowcast: boolean;
  onStartGuidedDemo: () => void;
  onOpenDocs: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunNowcast,
  isRunningNowcast,
  onStartGuidedDemo,
  onOpenDocs,
  activeAlertCount
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC').slice(17, 25));
      const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      setIstTime(istDate.toISOString().slice(11, 19) + ' IST');
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Nowcast Console', icon: Compass },
    { id: 'climate', label: 'Climate Trends (D3)', icon: TrendingUp },
    { id: 'sounding', label: 'Sounding & 3D Convection', icon: Activity },
    { id: 'tactical', label: 'Aviation & Grid Defense', icon: Plane },
    { id: 'alerts', label: `Alert Center ${activeAlertCount > 0 ? `(${activeAlertCount})` : ''}`, icon: AlertTriangle },
    { id: 'fusion', label: 'Multisource Fusion', icon: Layers },
    { id: 'replay', label: 'Event Replay', icon: Clock },
    { id: 'verification', label: 'Verification', icon: BarChart3 },
    { id: 'health', label: 'Sensors & Model', icon: Radio },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#090e1a]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="px-3 sm:px-4 py-1.5 border-b border-slate-800/60 bg-[#060a12] flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px] sm:text-xs">
          <span className="font-semibold text-slate-200">Smart India Hackathon SIH26072</span>
          <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
          <span className="hidden sm:inline">Ministry of Earth Sciences</span>
          <span aria-hidden="true" className="text-slate-600 hidden md:inline">·</span>
          <span className="hidden md:inline">India Meteorological Department (IMD)</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-cyan-400 font-mono font-medium">Disaster Management</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] tabular-nums">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SYSTEM ONLINE</span>
          </div>
          <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-amber-400/90 font-medium hidden sm:inline">DEMO MODE</span>
          <span aria-hidden="true" className="text-slate-700">|</span>
          <span className="text-slate-300 hidden md:inline">{utcTime} UTC</span>
          <span className="text-cyan-400/90">{istTime}</span>
        </div>
      </div>

      {/* Main 3-Zone Bar */}
      <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg font-mono shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Chakra_Petch',sans-serif]">
                StormSight <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-mono">v1.4.2</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">
              Atmospheric Thunderstorm & Lightning Nowcasting Platform
            </p>
          </div>
        </div>

        {/* Zone 3: Actions (Wrapped nicely on small screens) */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:order-3">
          <button
            onClick={onStartGuidedDemo}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Start Automated 9-Step Evaluation Walkthrough for Judges"
          >
            <Play className="w-3.5 h-3.5 fill-amber-300 shrink-0" />
            <span>DEMO</span>
          </button>

          <button
            onClick={onRunNowcast}
            disabled={isRunningNowcast}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 rounded-lg transition-all shadow-md shadow-cyan-600/20 active:scale-95 cursor-pointer"
            title="Run on-demand multi-source atmospheric feature extraction & inference"
          >
            <RotateCw className={`w-3.5 h-3.5 shrink-0 ${isRunningNowcast ? 'animate-spin' : ''}`} />
            <span>{isRunningNowcast ? 'RUNNING...' : 'NOWCAST'}</span>
          </button>

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="API Documentation, Deployment Specs & Download"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden md:inline">Docs</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Scrollable horizontally on mobile without breaking viewport) */}
        <div className="w-full lg:w-auto lg:order-2 overflow-x-auto pb-1 -mx-1 px-1 flex-1">
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 w-max min-w-full sm:min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
