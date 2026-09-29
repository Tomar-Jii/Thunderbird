import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Wind, 
  CloudRain, 
  X, 
  MapPin, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Radio, 
  Clock,
  ArrowRight
} from 'lucide-react';
import type { LiveSevereAlert } from '../services/weatherWebSocket';

interface SevereWeatherToastStackProps {
  alerts: LiveSevereAlert[];
  onDismiss: (id: string) => void;
  onViewLocation: (locationId: string) => void;
  onAcknowledge: (id: string) => void;
}

export const SevereWeatherToastStack: React.FC<SevereWeatherToastStackProps> = ({
  alerts,
  onDismiss,
  onViewLocation,
  onAcknowledge
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Play tactical synthesizer warning tone on new alert
  useEffect(() => {
    if (alerts.length === 0 || !soundEnabled) return;
    const latest = alerts[alerts.length - 1];

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (latest.type === 'TORNADO') {
        // High-low emergency siren sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(550, ctx.currentTime + 0.35);
        osc.frequency.linearRampToValueAtTime(850, ctx.currentTime + 0.5);
      } else {
        // Flash flood pulsating two-tone chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(520, ctx.currentTime + 0.4);
      }

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext autoplay restriction handled silently
    }
  }, [alerts.length, soundEnabled]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-2 sm:px-0">
      {/* Sound Toggle HUD Header (Small glass badge) */}
      <div className="self-end pointer-events-auto flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono text-slate-300 shadow-xl backdrop-blur-md">
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>WEBSOCKET LIVE FEED</span>
        </span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 border-l border-slate-700 pl-2 text-slate-400"
          title={soundEnabled ? 'Mute Warning Siren' : 'Enable Warning Siren'}
        >
          {soundEnabled ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
          <span>{soundEnabled ? 'Audio ON' : 'Muted'}</span>
        </button>
      </div>

      {/* Floating Alert Cards */}
      {alerts.map((alert) => {
        const isTornado = alert.type === 'TORNADO';
        const isSevere = alert.severity === 'SEVERE';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
              isTornado
                ? 'bg-rose-950/95 border-rose-500/80 shadow-rose-950/60 ring-1 ring-rose-500/40'
                : 'bg-cyan-950/95 border-cyan-500/80 shadow-cyan-950/60 ring-1 ring-cyan-500/40'
            }`}
          >
            {/* Header: Badge & Close */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  isTornado 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/50 animate-pulse' 
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 animate-pulse'
                }`}>
                  {isTornado ? <Wind className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isSevere 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'bg-amber-500 text-slate-950 font-bold'
                    }`}>
                      {alert.type.replace('_', ' ')} {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-white/70">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5 font-['Chakra_Petch',sans-serif]">
                    {alert.headline}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => onDismiss(alert.id)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss Toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Description & Location */}
            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-white/90 font-mono text-[11px]">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span className="font-bold">{alert.locationName}</span>
                <span className="text-white/50 text-[10px]">· Valid {alert.expiresInMinutes}m</span>
              </div>

              <p className="text-white/80 text-[11px] leading-relaxed">
                {alert.impactSummary}
              </p>

              {/* Action guidance callout */}
              <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono flex items-start gap-1.5 text-amber-300">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                <span>{alert.recommendedAction}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono text-white/50 truncate max-w-[150px]">
                {alert.sourceFeed}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewLocation(alert.locationId)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold transition-all"
                >
                  <span>View on Radar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-mono font-bold shadow-md transition-all active:scale-95 ${
                    isTornado
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledge</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
