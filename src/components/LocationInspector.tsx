import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  Flame, 
  ShieldAlert, 
  CloudRain, 
  Zap, 
  Radio, 
  Satellite, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import type { LocationNowcastForecast } from '../types/nowcast';

interface LocationInspectorProps {
  forecast: LocationNowcastForecast | null;
  selectedHorizonMinutes: number;
}

export const LocationInspector: React.FC<LocationInspectorProps> = ({
  forecast,
  selectedHorizonMinutes
}) => {
  if (!forecast) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220] flex items-center justify-center min-h-[360px] text-slate-400 font-mono text-xs">
        Loading atmospheric sounding profile...
      </div>
    );
  }

  const { atmosphericSounding: obs, currentRisk, stormProbabilityPct, confidencePct } = forecast;

  const getRiskBadge = () => {
    switch (currentRisk) {
      case 'SEVERE':
        return <span className="text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded text-xs font-mono font-bold">● SEVERE RISK</span>;
      case 'HIGH':
        return <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-xs font-mono font-bold">▲ HIGH RISK</span>;
      case 'MODERATE':
        return <span className="text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded text-xs font-mono font-bold">◆ MODERATE</span>;
      case 'LOW':
      default:
        return <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-mono font-bold">● LOW RISK</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4 flex flex-col justify-between shadow-xl">
      {/* Location Header */}
      <div>
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>STATION OBSERVATORY</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5 font-['Chakra_Petch',sans-serif]">
              {forecast.locationName}
            </h3>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{obs.latitude.toFixed(4)}°N</span>
              <span aria-hidden="true">·</span>
              <span>{obs.longitude.toFixed(4)}°E</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Horizon: T+{selectedHorizonMinutes}m</span>
            </div>
          </div>
          <div className="text-right">
            {getRiskBadge()}
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Prob: <span className="text-white font-bold">{stormProbabilityPct}%</span>
            </div>
          </div>
        </div>

        {/* Primary Sounding Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3.5">
          {/* Temperature */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>TEMP</span>
              <Thermometer className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {obs.temperatureC.toFixed(1)}
              </span>
              <span className="text-[11px] font-mono text-slate-400 ml-1">°C</span>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>HUMIDITY</span>
              <Droplets className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {obs.humidityPct}
              </span>
              <span className="text-[11px] font-mono text-slate-400 ml-1">% RH</span>
            </div>
          </div>

          {/* Pressure */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>PRESSURE</span>
              <Gauge className="w-3 h-3 text-slate-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {obs.pressureHpa.toFixed(1)}
              </span>
              <span className="text-[11px] font-mono text-slate-400 ml-1">hPa</span>
            </div>
          </div>

          {/* CAPE (Convective Available Potential Energy) */}
          <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
              <span>CAPE</span>
              <Flame className="w-3 h-3 text-amber-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">
                {obs.capeJkg}
              </span>
              <span className="text-[11px] font-mono text-amber-400/80 ml-1">J/kg</span>
            </div>
          </div>

          {/* CIN (Convective Inhibition) */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>CIN</span>
              <ShieldAlert className="w-3 h-3 text-slate-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {obs.cinJkg}
              </span>
              <span className="text-[11px] font-mono text-slate-400 ml-1">J/kg</span>
            </div>
          </div>

          {/* Wind Vector */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>WIND SPEED</span>
              <Wind className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {obs.windSpeedKmh}
              </span>
              <span className="text-[11px] font-mono text-slate-400 ml-1">km/h ({obs.windDirectionCompass})</span>
            </div>
          </div>

          {/* Doppler Radar Reflectivity */}
          <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
            <div className="flex items-center justify-between text-[11px] font-mono text-rose-300">
              <span>RADAR CORE</span>
              <Radio className="w-3 h-3 text-rose-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
                {obs.radarReflectivityDbz}
              </span>
              <span className="text-[11px] font-mono text-rose-300/80 ml-1">dBZ</span>
            </div>
          </div>

          {/* Satellite Cloud Top Temp */}
          <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
            <div className="flex items-center justify-between text-[11px] font-mono text-indigo-300">
              <span>CLOUD TOP</span>
              <Satellite className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold font-mono text-indigo-300 tabular-nums">
                {obs.cloudTopTempC}
              </span>
              <span className="text-[11px] font-mono text-indigo-300/80 ml-1">°C</span>
            </div>
          </div>

          {/* Precipitation Rate */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>PRECIP RATE</span>
              <CloudRain className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {obs.precipitationMmPerHour}
              </span>
              <span className="text-[11px] font-mono text-slate-400 ml-1">mm/h</span>
            </div>
          </div>
        </div>

        {/* Lightning & Convective Surge Bar */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Lightning Flash Density:</span>
            <span className="text-amber-400 font-bold">{obs.lightningDensityPerKm2} /km²</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Trend:</span>
            <span className="text-rose-400 font-bold uppercase">{obs.lightningTrend} ▲</span>
          </div>
        </div>
      </div>

      {/* Model Output Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <div>
          <span>Pipeline: </span>
          <span className="text-slate-200">LightGBM + ConvLSTM</span>
        </div>
        <div>
          <span>Confidence: </span>
          <span className="text-cyan-400 font-bold">{confidencePct}%</span>
        </div>
      </div>
    </div>
  );
};
