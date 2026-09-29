import React, { useState } from 'react';
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
  MapPin,
  RotateCw,
  Globe,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Layers
} from 'lucide-react';
import type { LocationNowcastForecast } from '../types/nowcast';
import { api } from '../services/api';

interface LocationInspectorProps {
  forecast: LocationNowcastForecast | null;
  selectedHorizonMinutes: number;
}

const PRESET_COORDS = [
  // Madhya Pradesh Regional Radars & Districts
  { id: 'bhopal', name: 'Bhopal (DWR S-Band)', lat: 23.25, lon: 77.41 },
  { id: 'indore', name: 'Indore (DWR C-Band)', lat: 22.72, lon: 75.86 },
  { id: 'jabalpur', name: 'Jabalpur (Mahakoshal)', lat: 23.18, lon: 79.99 },
  { id: 'gwalior', name: 'Gwalior (Chambal Belt)', lat: 26.22, lon: 78.18 },
  { id: 'ujjain', name: 'Ujjain (Shipra Valley)', lat: 23.18, lon: 75.79 },
  { id: 'sagar', name: 'Sagar (Bundelkhand)', lat: 23.84, lon: 78.74 },
  { id: 'narmadapuram', name: 'Narmadapuram (Hoshangabad)', lat: 22.75, lon: 77.73 },
  { id: 'rewa', name: 'Rewa (Vindhya Plateau)', lat: 24.54, lon: 81.30 },
  { id: 'satna', name: 'Satna (Limestone Belt)', lat: 24.60, lon: 80.83 },
  { id: 'chhindwara', name: 'Chhindwara (Satpura)', lat: 22.06, lon: 78.94 },
  { id: 'ratlam', name: 'Ratlam (Malwa Rail Hub)', lat: 23.33, lon: 75.04 },
  { id: 'dewas', name: 'Dewas (Convective Arc)', lat: 22.97, lon: 76.05 },
  { id: 'pachmarhi', name: 'Pachmarhi Hill Station (1067m)', lat: 22.47, lon: 78.43 },
  { id: 'khajuraho', name: 'Khajuraho (Heritage Radar)', lat: 24.83, lon: 79.92 },
  { id: 'singrauli', name: 'Singrauli (Thermal Basin)', lat: 24.20, lon: 82.66 },
  { id: 'betul', name: 'Betul (Satpura Ridge)', lat: 21.90, lon: 77.90 },

  // Pan-India Convective Hubs
  { id: 'kolkata', name: 'Kolkata (Kalbaishakhi / Nor\'wester)', lat: 22.57, lon: 88.36 },
  { id: 'delhi', name: 'Delhi NCR (Safdarjung DWR)', lat: 28.61, lon: 77.20 },
  { id: 'mumbai', name: 'Mumbai Metro (Santacruz Coastal)', lat: 19.07, lon: 72.87 },
  { id: 'bengaluru', name: 'Bengaluru (Deccan Plateau)', lat: 12.97, lon: 77.59 },
  { id: 'hyderabad', name: 'Hyderabad (Telangana Dryline)', lat: 17.38, lon: 78.48 },
  { id: 'nagpur', name: 'Nagpur (Central S-Band Radar)', lat: 21.15, lon: 79.09 },
  { id: 'guwahati', name: 'Guwahati (Brahmaputra Basin)', lat: 26.14, lon: 91.74 },
  { id: 'jaipur', name: 'Jaipur (Aravalli Squall)', lat: 26.91, lon: 75.79 },
  { id: 'patna', name: 'Patna (Gangetic Lightning Belt)', lat: 25.59, lon: 85.14 }
];

export const LocationInspector: React.FC<LocationInspectorProps> = ({
  forecast,
  selectedHorizonMinutes
}) => {
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [selectedCoordId, setSelectedCoordId] = useState<string>('bhopal');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [show7DayForecast, setShow7DayForecast] = useState<boolean>(true);
  
  // Real live data from Open-Meteo
  const [liveData, setLiveData] = useState<{
    queryUrl: string;
    latitude: number;
    longitude: number;
    timezone: string;
    timestamp: string;
    temperature: number;
    apparentTemperature: number;
    dewPoint: number;
    relativeHumidity: number;
    surfacePressureHpa: number;
    windSpeedKmh: number;
    windGustsKmh: number;
    precipitationMm: number;
    weatherCode: number;
    weatherDesc: string;
    weatherIcon: string;
    isSevereConvective: boolean;
    currentCape: number;
    liftedIndex: number;
    dailyForecast: Array<{
      date: string;
      tempMax: number;
      tempMin: number;
      apparentMax: number;
      apparentMin: number;
      precipSumMm: number;
      precipProbMax: number;
      windSpeedMax: number;
      weatherCode: number;
      weatherDesc: string;
      weatherIcon: string;
    }>;
  } | null>(null);

  if (!forecast) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220] flex items-center justify-center min-h-[360px] text-slate-400 font-mono text-xs">
        Loading atmospheric sounding profile...
      </div>
    );
  }

  const { atmosphericSounding: simObs, currentRisk, stormProbabilityPct, confidencePct } = forecast;

  const fetchLiveCoordinates = async (lat: number, lon: number) => {
    try {
      setIsLoadingLive(true);
      const data = await api.fetchRealTimeAtmosphere(lat, lon);
      setLiveData(data);
      setIsLiveMode(true);
    } catch (err) {
      console.error('Failed to fetch real live atmospheric data:', err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  const handleToggleLiveFeed = async () => {
    if (isLiveMode) {
      setIsLiveMode(false);
      return;
    }
    const current = PRESET_COORDS.find(p => p.id === selectedCoordId) || { lat: simObs.latitude, lon: simObs.longitude };
    await fetchLiveCoordinates(current.lat, current.lon);
  };

  const handleSelectPreset = async (presetId: string) => {
    setSelectedCoordId(presetId);
    const target = PRESET_COORDS.find(p => p.id === presetId);
    if (target && isLiveMode) {
      await fetchLiveCoordinates(target.lat, target.lon);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Determine displayed parameters based on live vs sim
  const displayTemp = isLiveMode && liveData ? liveData.temperature : simObs.temperatureC;
  const displayHumidity = isLiveMode && liveData ? liveData.relativeHumidity : simObs.humidityPct;
  const displayPressure = isLiveMode && liveData ? liveData.surfacePressureHpa : simObs.pressureHpa;
  const displayCape = isLiveMode && liveData ? liveData.currentCape : simObs.capeJkg;
  const displayWind = isLiveMode && liveData ? liveData.windSpeedKmh : simObs.windSpeedKmh;

  const getRiskBadge = () => {
    switch (currentRisk) {
      case 'HIGH':
        return {
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          dot: 'bg-rose-500',
          label: 'CRITICAL CONVECTION'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          dot: 'bg-amber-500',
          label: 'DEVELOPING CELL'
        };
      default:
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          dot: 'bg-emerald-500',
          label: 'STABLE AIR MASS'
        };
    }
  };

  const risk = getRiskBadge();

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-4 shadow-xl backdrop-blur-md">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              {isLiveMode ? 'REAL-TIME ATMOSPHERIC OBSERVATORY' : 'STATION SOUNDING TELEMETRY'}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              {isLiveMode ? 'Live Open-Meteo & Satellite Ingestion' : 'IMD AWS + Sounding Sensor Node'}
            </span>
          </div>
        </div>

        {/* Live / Lab Mode Status Indicator */}
        <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 ${
          isLiveMode 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
            : `${risk.bg} ${risk.border} ${risk.text}`
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLiveMode ? 'bg-emerald-400 animate-ping' : risk.dot}`}></span>
          <span>{isLiveMode ? 'LIVE API (HTTP 200)' : risk.label}</span>
        </div>
      </div>

      {/* Live Feed Toggle & Preset Selector */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className={`w-4 h-4 ${isLiveMode ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-xs font-mono font-bold text-white">
              {isLiveMode ? 'Open-Meteo Real-Time Ingestion' : 'Operational Stress-Test Lab'}
            </span>
          </div>

          <button
            onClick={handleToggleLiveFeed}
            disabled={isLoadingLive}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              isLiveMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
            }`}
          >
            {isLoadingLive ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : isLiveMode ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            <span>{isLoadingLive ? 'CONNECTING...' : isLiveMode ? 'SWITCH TO LAB' : 'FETCH LIVE API'}</span>
          </button>
        </div>

        {/* Preset Coordinate Selector Bar */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[11px] font-mono">
          <span className="text-slate-400 shrink-0">Station:</span>
          {PRESET_COORDS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`px-2 py-0.5 rounded transition-colors shrink-0 ${
                selectedCoordId === preset.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {preset.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Live API Response Banner & URL */}
      {isLiveMode && liveData && (
        <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <span>{liveData.weatherIcon}</span>
              <span>{liveData.weatherDesc} (WMO {liveData.weatherCode})</span>
            </span>
            <span className="text-slate-400 text-[10px]">
              Feels Like {liveData.apparentTemperature.toFixed(1)}°C
            </span>
          </div>

          {/* Direct API URL Link & Copy Button */}
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2 text-[10px]">
            <a
              href={liveData.queryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-300 truncate max-w-[280px] sm:max-w-[340px] flex items-center gap-1"
              title="Open raw Open-Meteo JSON endpoint directly in new tab"
            >
              <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{liveData.queryUrl}</span>
            </a>
            <button
              onClick={() => handleCopyUrl(liveData.queryUrl)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 shrink-0 transition-colors"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Atmospheric Telemetry Grid */}
      <div className="mt-3.5 space-y-3 font-mono">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Temperature */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>TEMP</span>
              <Thermometer className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold text-white tabular-nums">
                {displayTemp.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">°C</span>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>HUMIDITY</span>
              <Droplets className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold text-white tabular-nums">
                {displayHumidity}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">% RH</span>
            </div>
          </div>

          {/* Pressure */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>PRESSURE</span>
              <Gauge className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold text-white tabular-nums">
                {displayPressure.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">hPa</span>
            </div>
          </div>

          {/* CAPE */}
          <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between text-[11px] text-amber-300">
              <span>CAPE</span>
              <Flame className="w-3 h-3 text-amber-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold text-amber-300 tabular-nums">
                {displayCape}
              </span>
              <span className="text-[11px] text-amber-400/80 ml-1">J/kg</span>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>WIND SPEED</span>
              <Wind className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold text-white tabular-nums">
                {displayWind}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">km/h</span>
            </div>
          </div>

          {/* Radar or Dew Point */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{isLiveMode ? 'WIND GUSTS' : 'RADAR CORE'}</span>
              <Radio className="w-3 h-3 text-rose-400" />
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-xl font-bold text-rose-400 tabular-nums">
                {isLiveMode && liveData ? liveData.windGustsKmh : simObs.radarReflectivityDbz}
              </span>
              <span className="text-[11px] text-rose-300/80 ml-1">
                {isLiveMode ? 'km/h' : 'dBZ'}
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Real-Time Daily Forecast Strip (When in Live Mode) */}
        {isLiveMode && liveData?.dailyForecast && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                7-Day Open-Meteo Daily Synoptic Forecast
              </span>
              <span className="text-slate-400 text-[10px]">Auto-Synced</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
              {liveData.dailyForecast.slice(0, 4).map((day, i) => (
                <div key={day.date} className="p-1.5 rounded bg-slate-900/80 border border-slate-800/70 space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span className="font-bold text-slate-300">
                      {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : day.date.slice(5)}
                    </span>
                    <span>{day.weatherIcon}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-rose-400 font-bold">{day.tempMax.toFixed(0)}°</span>
                    <span className="text-slate-400">{day.tempMin.toFixed(0)}°</span>
                  </div>
                  <div className="text-[9px] text-cyan-300 flex justify-between">
                    <span>Rain: {day.precipSumMm}mm</span>
                    <span>{day.precipProbMax}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convective Alert Surge Status */}
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Lightning Flash Threat:</span>
            <span className="text-amber-400 font-bold">
              {displayCape > 2500 ? 'SEVERE (Mixed-Phase)' : displayCape > 1500 ? 'ELEVATED' : 'LOW RISK'}
            </span>
          </div>
          <span className="text-cyan-400 font-bold">
            Horizon: T+{selectedHorizonMinutes}m
          </span>
        </div>
      </div>
    </div>
  );
};
