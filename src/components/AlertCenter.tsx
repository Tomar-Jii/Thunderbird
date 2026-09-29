import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ShieldAlert, 
  CheckCircle, 
  X, 
  Filter, 
  MapPin, 
  Clock, 
  ShieldCheck,
  BellRing
} from 'lucide-react';
import type { AlertNotification, AlertSeverity } from '../types/nowcast';

interface AlertCenterProps {
  alerts: AlertNotification[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  onAcknowledge,
  onDismiss
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  const severities: AlertSeverity[] = ['SEVERE', 'WARNING', 'WATCH', 'INFO'];

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (alert.dismissed) return false;
    if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) return false;
    if (selectedRegion !== 'ALL' && !alert.locationName.toLowerCase().includes(selectedRegion.toLowerCase())) return false;
    return true;
  });

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'SEVERE':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          border: 'border-rose-500/40',
          bg: 'bg-rose-950/20',
          icon: AlertOctagon,
          iconColor: 'text-rose-400'
        };
      case 'WARNING':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          border: 'border-amber-500/40',
          bg: 'bg-amber-950/20',
          icon: AlertTriangle,
          iconColor: 'text-amber-400'
        };
      case 'WATCH':
        return {
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          border: 'border-yellow-500/40',
          bg: 'bg-yellow-950/20',
          icon: ShieldAlert,
          iconColor: 'text-yellow-400'
        };
      case 'INFO':
      default:
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          border: 'border-cyan-500/40',
          bg: 'bg-cyan-950/20',
          icon: Info,
          iconColor: 'text-cyan-400'
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Ribbon */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
              Operational Convective Alert Center
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Severe Thunderstorm & Lightning Warnings (0–120m Lead Time)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Segmented Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedSeverity('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedSeverity === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL ({alerts.filter(a => !a.dismissed).length})
            </button>
            {severities.map((sev) => {
              const count = alerts.filter(a => !a.dismissed && a.severity === sev).length;
              return (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    selectedSeverity === sev ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev} ({count})
                </button>
              );
            })}
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              aria-label="Filter alerts by region"
              className="bg-transparent border-0 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All MP Districts</option>
              <option value="bhopal" className="bg-slate-900">Bhopal Region</option>
              <option value="indore" className="bg-slate-900">Indore Sector</option>
              <option value="jabalpur" className="bg-slate-900">Jabalpur Basin</option>
              <option value="gwalior" className="bg-slate-900">Gwalior Belt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full p-8 rounded-2xl border border-slate-800 bg-[#090e1a] text-center text-slate-400 font-mono text-xs">
            No active alerts matching the selected filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            const Icon = style.icon;

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border ${style.border} ${style.bg} p-4 backdrop-blur-md flex flex-col justify-between shadow-xl transition-all`}
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${style.iconColor}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${style.badge}`}>
                            {alert.severity} NOWCAST
                          </span>
                          <span className="text-xs font-mono text-slate-400">{alert.id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">
                          {alert.locationName}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {alert.acknowledged ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          <span>ACK'D</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          title="Acknowledge alert reception"
                        >
                          Acknowledge
                        </button>
                      )}

                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                        title="Dismiss alert"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Headline & Probability */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-200 font-sans">
                      {alert.headline}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">PROBABILITY</span>
                        <span className="text-sm font-bold text-rose-400">{alert.riskProbabilityPct}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">FORECAST WINDOW</span>
                        <span className="text-sm font-bold text-slate-200">Next {alert.forecastWindowMinutes}m</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">AI CONFIDENCE</span>
                        <span className="text-sm font-bold text-cyan-400">{alert.confidencePct}%</span>
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-0.5">
                        RECOMMENDED ACTION PROTOCOL:
                      </span>
                      <span className="text-slate-300 leading-snug">
                        {alert.recommendedAction}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Timestamps */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Valid until: {new Date(alert.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span>Mode: DEMO / SIH26072</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
