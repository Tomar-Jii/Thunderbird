import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Wind, 
  Thermometer, 
  Droplets, 
  Zap, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Play, 
  RotateCcw, 
  Layers, 
  Info,
  Flame,
  ArrowUp,
  Compass
} from 'lucide-react';
import { soundEffects } from '../utils/audioAlert';

interface SoundingStation {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  time: string;
  baseTemp: number;
  baseDewpoint: number;
  pwat: number;
  srh: number; // Storm relative helicity m2/s2
  stormType: string;
  description: string;
}

const STATIONS: SoundingStation[] = [
  {
    id: 'kolkata',
    name: 'Kolkata (VECC) - Gangetic West Bengal',
    region: 'East India',
    lat: 22.65,
    lon: 88.45,
    time: '12:00 UTC Sounding',
    baseTemp: 35.8,
    baseDewpoint: 25.2,
    pwat: 64.2,
    srh: 285,
    stormType: "Severe Kalbaishakhi Nor'wester Supercell",
    description: 'Extreme Bay of Bengal moisture convergence colliding with dry Chota Nagpur plateau westerly dryline. Explosive thermodynamic instability.'
  },
  {
    id: 'delhi',
    name: 'Delhi NCR (VIDD / Safdarjung)',
    region: 'Northwest India',
    lat: 28.58,
    lon: 77.20,
    time: '00:00 UTC Sounding',
    baseTemp: 41.2,
    baseDewpoint: 21.0,
    pwat: 48.6,
    srh: 195,
    stormType: 'Pre-Monsoon Andhi Dust Squall & Microburst',
    description: 'Deep high-based convective boundary layer with inverted-V dry sub-cloud structure generating severe evaporatively cooled downdrafts.'
  },
  {
    id: 'mumbai',
    name: 'Mumbai Santacruz (VABB)',
    region: 'West Coast',
    lat: 19.09,
    lon: 72.85,
    time: '06:00 UTC Sounding',
    baseTemp: 32.4,
    baseDewpoint: 26.8,
    pwat: 72.8,
    srh: 240,
    stormType: 'Coastal Orographic Cloudburst & Mesoscale Vortex',
    description: 'Tropical atmospheric moisture river feeding offshore convective training band parallel to Western Ghats escarpment.'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru HAL (VOBG)',
    region: 'South Peninsula',
    lat: 12.95,
    lon: 77.67,
    time: '09:00 UTC Sounding',
    baseTemp: 31.0,
    baseDewpoint: 22.4,
    pwat: 51.5,
    srh: 160,
    stormType: 'Peninsular Pulse Thunderstorm & Lightning Outbreak',
    description: 'Diurnal differential solar heating triggering rapid multicellular convective towers with high frequency cloud-to-ground lightning.'
  }
];

export const SoundingProfile: React.FC = () => {
  const [selectedStationId, setSelectedStationId] = useState<string>('kolkata');
  const [tempOffset, setTempOffset] = useState<number>(0);
  const [dewOffset, setDewOffset] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'skewt' | 'rhi'>('skewt');
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  const currentStation = STATIONS.find(s => s.id === selectedStationId) || STATIONS[0];

  // Dynamic surface parameters with user sensitivity sliders
  const sfcTemp = +(currentStation.baseTemp + tempOffset).toFixed(1);
  const sfcDew = +(currentStation.baseDewpoint + dewOffset).toFixed(1);

  // Dynamic thermodynamic calculation
  const thermoMetrics = useMemo(() => {
    // Dewpoint depression at surface
    const spread = sfcTemp - sfcDew;
    
    // Lifting Condensation Level (LCL in meters, approx Espy equation: z = 125 * (T - Td))
    const lclHeightM = Math.max(250, Math.round(125 * spread));
    const lclPressureHpa = Math.round(1013.25 * Math.pow(1 - (0.0065 * lclHeightM / 288.15), 5.255));
    
    // Level of Free Convection (LFC)
    const lfcPressureHpa = Math.max(250, Math.min(lclPressureHpa - 40, Math.round(lclPressureHpa - (spread * 8.5))));
    
    // Convective Available Potential Energy (CAPE in J/kg)
    // CAPE increases exponentially with surface warmth and high dewpoint moisture
    const baseCape = currentStation.id === 'kolkata' ? 3400 : currentStation.id === 'delhi' ? 2200 : currentStation.id === 'mumbai' ? 2900 : 1850;
    const tempSens = tempOffset * 180;
    const dewSens = dewOffset * 260;
    const calculatedCape = Math.max(150, Math.round(baseCape + tempSens + dewSens));

    // Convective Inhibition (CIN in J/kg)
    const baseCin = currentStation.id === 'delhi' ? -65 : currentStation.id === 'kolkata' ? -35 : -22;
    const calculatedCin = Math.min(-5, Math.round(baseCin - (spread * 3.2) + (tempOffset * 4)));

    // Lifted Index (LI in °C)
    const liftedIndex = +( - (calculatedCape / 420) + 1.5 ).toFixed(1);

    // Hail Risk Index (%)
    const hailRisk = Math.min(98, Math.max(5, Math.round((calculatedCape / 3800) * 85 + (sfcDew > 24 ? 12 : 0))));

    // Severe Lightning Flash Rate (flashes / min)
    const lightningRate = Math.min(180, Math.max(6, Math.round((calculatedCape / 140) * (currentStation.srh / 200))));

    // Equilibrium Level (EL - anvil height in km)
    const elHeightKm = +(12.5 + (calculatedCape / 3000) * 3.8).toFixed(1);

    return {
      lclHeightM,
      lclPressureHpa,
      lfcPressureHpa,
      calculatedCape,
      calculatedCin,
      liftedIndex,
      hailRisk,
      lightningRate,
      elHeightKm
    };
  }, [sfcTemp, sfcDew, tempOffset, dewOffset, currentStation]);

  // Standard vertical pressure levels for sounding (hPa)
  const pressureLevels = [
    { p: 1000, z: 0.1, envT: sfcTemp, envTd: sfcDew, parcelT: sfcTemp, windSpd: 12, windDir: 170 },
    { p: 925, z: 0.8, envT: sfcTemp - 4.5, envTd: sfcDew - 2.0, parcelT: sfcTemp - 3.8, windSpd: 18, windDir: 195 },
    { p: 850, z: 1.5, envT: sfcTemp - 9.2, envTd: sfcDew - 4.8, parcelT: sfcTemp - 7.5, windSpd: 26, windDir: 215 },
    { p: 700, z: 3.1, envT: sfcTemp - 19.5, envTd: sfcDew - 12.0, parcelT: sfcTemp - 15.2, windSpd: 34, windDir: 245 },
    { p: 500, z: 5.8, envT: sfcTemp - 34.0, envTd: sfcDew - 24.5, parcelT: sfcTemp - 26.5, windSpd: 48, windDir: 260 },
    { p: 400, z: 7.5, envT: sfcTemp - 43.5, envTd: sfcDew - 34.0, parcelT: sfcTemp - 34.0, windSpd: 62, windDir: 265 },
    { p: 300, z: 9.6, envT: sfcTemp - 54.0, envTd: sfcDew - 46.0, parcelT: sfcTemp - 43.5, windSpd: 78, windDir: 270 },
    { p: 250, z: 10.8, envT: sfcTemp - 59.5, envTd: sfcDew - 52.0, parcelT: sfcTemp - 49.5, windSpd: 92, windDir: 275 },
    { p: 200, z: 12.2, envT: sfcTemp - 65.0, envTd: sfcDew - 58.0, parcelT: sfcTemp - 57.0, windSpd: 105, windDir: 280 },
    { p: 150, z: 14.1, envT: sfcTemp - 71.0, envTd: sfcDew - 66.0, parcelT: sfcTemp - 68.5, windSpd: 85, windDir: 275 },
    { p: 100, z: 16.5, envT: sfcTemp - 75.0, envTd: sfcDew - 72.0, parcelT: sfcTemp - 75.0, windSpd: 45, windDir: 270 },
  ];

  // Helper to map (Temperature °C, Pressure hPa) to SVG coordinates (width=600, height=420)
  const mapCoords = (t: number, p: number) => {
    // Log-P height scale: ln(1050) - ln(100)
    const yMin = Math.log(1050);
    const yMax = Math.log(100);
    const y = ((Math.log(p) - yMin) / (yMax - yMin)) * 360 + 30; // 30px top margin

    // Skew-T: horizontal coordinate shifted by vertical altitude to simulate 45° skew
    const skewOffset = (390 - y) * 0.42;
    // Map -80°C to +50°C
    const x = ((t - (-80)) / (50 - (-80))) * 380 + 70 + skewOffset;
    return { x, y };
  };

  const handleTestSiren = () => {
    if (isAudioMuted) return;
    soundEffects.playSiren(3);
  };

  const handleTestThunder = () => {
    if (isAudioMuted) return;
    soundEffects.playThunder();
  };

  // Generate SVG polygon for CAPE (positive buoyancy between parcelT and envT)
  const capePolygonPoints = useMemo(() => {
    // Filter levels above LFC up to EL (around 150 hPa)
    const buoyantLevels = pressureLevels.filter(lvl => lvl.p <= thermoMetrics.lfcPressureHpa && lvl.p >= 150);
    if (buoyantLevels.length === 0) return '';
    
    // Forward along parcel trajectory
    const parcelPts = buoyantLevels.map(lvl => {
      const { x, y } = mapCoords(lvl.parcelT, lvl.p);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    // Backward along environmental temperature
    const envPts = [...buoyantLevels].reverse().map(lvl => {
      const { x, y } = mapCoords(lvl.envT, lvl.p);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return [...parcelPts, ...envPts].join(' ');
  }, [pressureLevels, thermoMetrics.lfcPressureHpa]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner / Station Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-['Chakra_Petch',sans-serif]">
                  VERTICAL THERMODYNAMIC SOUNDING & 3D CONVECTIVE PROFILE
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded">
                    SKEW-T / LOG-P & RHI RADAR
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Physics-based atmospheric parcel buoyancy diagnostics, CAPE/CIN energetics, and mixed-phase hail/lightning growth layers.
                </p>
              </div>
            </div>
          </div>

          {/* Sound Controls & View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveView('skewt')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeView === 'skewt' 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Skew-T Diagram
              </button>
              <button
                onClick={() => setActiveView('rhi')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeView === 'rhi' 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Radar RHI Cross-Section
              </button>
            </div>

            <div className="h-6 w-px bg-slate-800 mx-1"></div>

            {/* Audio Siren Tester */}
            <button
              onClick={handleTestSiren}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
              title="Test IMD / NDMA Emergency Broadcast Warning Siren (3 sec tone)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>TEST SIREN</span>
            </button>

            <button
              onClick={handleTestThunder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
              title="Acoustic Thunder Rumble Synthesizer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>THUNDER</span>
            </button>

            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Station Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          {STATIONS.map((station) => {
            const isSelected = selectedStationId === station.id;
            return (
              <button
                key={station.id}
                onClick={() => {
                  setSelectedStationId(station.id);
                  setTempOffset(0);
                  setDewOffset(0);
                }}
                className={`text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800/70 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-mono ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {station.name.split(' - ')[0]}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                    {station.region}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {station.stormType}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-400">
                  <span>T: {station.baseTemp}°C</span>
                  <span>Td: {station.baseDewpoint}°C</span>
                  <span className="text-amber-400 font-semibold">PW: {station.pwat}mm</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Diagram Visualizer */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                  {activeView === 'skewt' ? 'Thermodynamic Skew-T / Log-P Diagram' : 'Doppler Radar RHI Vertical Cross-Section'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {currentStation.time}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-rose-500 rounded"></span>
                  <span className="text-slate-300">Temp (T)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-cyan-400 rounded"></span>
                  <span className="text-slate-300">Dewpoint (Td)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-amber-400 rounded border-dashed"></span>
                  <span className="text-slate-300">Parcel Path</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 bg-gradient-to-r from-amber-500/60 to-rose-600/60 border border-amber-400 rounded-sm"></span>
                  <span className="text-amber-300 font-bold">CAPE Zone</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Visualizer */}
            <div className="relative w-full aspect-[16/10] bg-[#050811] rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center p-2">
              {activeView === 'skewt' ? (
                <svg viewBox="0 0 640 400" className="w-full h-full select-none">
                  <defs>
                    <linearGradient id="capeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.65" />
                    </linearGradient>
                    <pattern id="hatchPattern" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" />
                    </pattern>
                  </defs>

                  {/* Isobaric Pressure Grid Lines (Horizontal) */}
                  {pressureLevels.map(lvl => {
                    const { y } = mapCoords(0, lvl.p);
                    return (
                      <g key={lvl.p}>
                        <line x1="60" y1={y} x2="570" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="50" y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                          {lvl.p} hPa
                        </text>
                        <text x="575" y={y + 3} fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="start">
                          {lvl.z} km
                        </text>
                      </g>
                    );
                  })}

                  {/* Skewed Isotherm Temperature Lines (-60°C to +40°C) */}
                  {[-60, -40, -20, 0, 20, 40].map(temp => {
                    const p1 = mapCoords(temp, 1000);
                    const p2 = mapCoords(temp, 100);
                    const isFreezing = temp === 0;
                    return (
                      <g key={temp}>
                        <line 
                          x1={p1.x} 
                          y1={p1.y} 
                          x2={p2.x} 
                          y2={p2.y} 
                          stroke={isFreezing ? '#0284c7' : '#1e293b'} 
                          strokeWidth={isFreezing ? 1.5 : 1}
                          strokeOpacity={isFreezing ? 0.8 : 0.5}
                        />
                        <text x={p1.x - 4} y="392" fill={isFreezing ? '#38bdf8' : '#475569'} fontSize="9" fontFamily="monospace">
                          {temp}°
                        </text>
                      </g>
                    );
                  })}

                  {/* Hail Growth Zone Shading (-10°C to -30°C mixed phase supercooled layer) */}
                  {(() => {
                    const topY = mapCoords(0, 380).y;
                    const botY = mapCoords(0, 600).y;
                    return (
                      <g>
                        <rect x="60" y={topY} width="510" height={botY - topY} fill="#06b6d4" fillOpacity="0.06" />
                        <line x1="60" y1={topY} x2="570" y2={topY} stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.5" />
                        <line x1="60" y1={botY} x2="570" y2={botY} stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.5" />
                        <text x="65" y={topY + 12} fill="#22d3ee" fontSize="9" fontFamily="monospace" fontWeight="bold">
                          HAIL ACCRETION & LIGHTNING CHARGING ZONE (-10°C to -30°C)
                        </text>
                      </g>
                    );
                  })()}

                  {/* CAPE Area Polygon */}
                  {capePolygonPoints && (
                    <>
                      <polygon points={capePolygonPoints} fill="url(#capeGrad)" />
                      <polygon points={capePolygonPoints} fill="url(#hatchPattern)" />
                    </>
                  )}

                  {/* Dewpoint (Td) Curve (Cyan) */}
                  <polyline
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pressureLevels.map(lvl => {
                      const { x, y } = mapCoords(lvl.envTd, lvl.p);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    }).join(' ')}
                  />

                  {/* Environmental Temperature (T) Curve (Rose) */}
                  <polyline
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pressureLevels.map(lvl => {
                      const { x, y } = mapCoords(lvl.envT, lvl.p);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    }).join(' ')}
                  />

                  {/* Parcel Ascent Curve (Amber dashed) */}
                  <polyline
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    points={pressureLevels.map(lvl => {
                      const { x, y } = mapCoords(lvl.parcelT, lvl.p);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    }).join(' ')}
                  />

                  {/* Level Markers: LCL, LFC, EL */}
                  {(() => {
                    const lclCoords = mapCoords(sfcDew, thermoMetrics.lclPressureHpa);
                    const lfcCoords = mapCoords(sfcTemp - 10, thermoMetrics.lfcPressureHpa);
                    return (
                      <g>
                        {/* LCL Line */}
                        <line x1="60" y1={lclCoords.y} x2="570" y2={lclCoords.y} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />
                        <rect x="62" y={lclCoords.y - 14} width="110" height="13" fill="#064e3b" rx="2" />
                        <text x="66" y={lclCoords.y - 4} fill="#34d399" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                          LCL: {thermoMetrics.lclPressureHpa} hPa ({thermoMetrics.lclHeightM}m)
                        </text>

                        {/* LFC Line */}
                        <line x1="60" y1={lfcCoords.y} x2="570" y2={lfcCoords.y} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                        <rect x="440" y={lfcCoords.y - 14} width="125" height="13" fill="#78350f" rx="2" />
                        <text x="445" y={lfcCoords.y - 4} fill="#fbbf24" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                          LFC: {thermoMetrics.lfcPressureHpa} hPa (Free Convection)
                        </text>
                      </g>
                    );
                  })()}

                  {/* Wind Barbs Column on the right */}
                  {pressureLevels.map((lvl) => {
                    const { y } = mapCoords(0, lvl.p);
                    const xBarb = 605;
                    return (
                      <g key={`wind-${lvl.p}`}>
                        <circle cx={xBarb} cy={y} r="2.5" fill="#38bdf8" />
                        <line x1={xBarb} y1={y} x2={xBarb - 16} y2={y} stroke="#38bdf8" strokeWidth="1.5" />
                        {lvl.windSpd >= 50 && (
                          <polygon points={`${xBarb - 16},${y} ${xBarb - 12},${y - 8} ${xBarb - 8},${y}`} fill="#38bdf8" />
                        )}
                        {lvl.windSpd < 50 && lvl.windSpd >= 20 && (
                          <line x1={xBarb - 16} y1={y} x2={xBarb - 12} y2={y - 6} stroke="#38bdf8" strokeWidth="1.5" />
                        )}
                      </g>
                    );
                  })}

                  {/* Interactive Level Hover Circles */}
                  {pressureLevels.map(lvl => {
                    const ptT = mapCoords(lvl.envT, lvl.p);
                    const ptTd = mapCoords(lvl.envTd, lvl.p);
                    const isHovered = hoveredLevel === lvl.p;
                    return (
                      <g key={`hover-${lvl.p}`} onMouseEnter={() => setHoveredLevel(lvl.p)} onMouseLeave={() => setHoveredLevel(null)}>
                        <circle cx={ptT.x} cy={ptT.y} r={isHovered ? 6 : 3.5} fill="#f43f5e" className="cursor-pointer transition-all" />
                        <circle cx={ptTd.x} cy={ptTd.y} r={isHovered ? 6 : 3.5} fill="#22d3ee" className="cursor-pointer transition-all" />
                      </g>
                    );
                  })}
                </svg>
              ) : (
                /* Radar RHI Vertical Cross Section View */
                <svg viewBox="0 0 640 400" className="w-full h-full select-none">
                  <defs>
                    <radialGradient id="stormCore" cx="45%" cy="60%" r="50%">
                      <stop offset="0%" stopColor="#db2777" stopOpacity="0.95" />
                      <stop offset="35%" stopColor="#dc2626" stopOpacity="0.85" />
                      <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.75" />
                      <stop offset="85%" stopColor="#10b981" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
                    </radialGradient>
                  </defs>

                  {/* Altitude grid (0 to 18 km) */}
                  {[0, 3, 6, 9, 12, 15, 18].map(alt => {
                    const y = 370 - (alt / 18) * 330;
                    return (
                      <g key={alt}>
                        <line x1="50" y1={y} x2="600" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="42" y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                          {alt} km
                        </text>
                      </g>
                    );
                  })}

                  {/* Range grid (0 to 60 km) */}
                  {[0, 10, 20, 30, 40, 50, 60].map(dist => {
                    const x = 50 + (dist / 60) * 550;
                    return (
                      <g key={dist}>
                        <line x1={x} y1="40" x2={x} y2="370" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={x} y="388" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                          {dist} km
                        </text>
                      </g>
                    );
                  })}

                  {/* Tropopause / Anvil Cap (16 km) */}
                  <line x1="50" y1={370 - (16.2 / 18) * 330} x2="600" y2={370 - (16.2 / 18) * 330} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="55" y={370 - (16.2 / 18) * 330 - 5} fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    TROPOPAUSE ANVIL TOP (16.2 KM) - OVERSHOOTING CONVECTIVE DOME
                  </text>

                  {/* 0°C Freezing Level */}
                  <line x1="50" y1={370 - (4.8 / 18) * 330} x2="600" y2={370 - (4.8 / 18) * 330} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x="510" y={370 - (4.8 / 18) * 330 - 4} fill="#38bdf8" fontSize="8.5" fontFamily="monospace">
                    0°C ISOTHERM (4.8 KM)
                  </text>

                  {/* Storm Echo Silhouette with BWER (Bounded Weak Echo Region) & Anvil */}
                  <path
                    d={`M 140 370 
                        C 180 340, 200 280, 220 220 
                        C 240 160, 270 90, 310 70 
                        C 330 60, 360 62, 380 75
                        C 450 110, 560 120, 590 125
                        C 520 160, 480 200, 450 260
                        C 420 310, 400 350, 380 370 
                        Z`}
                    fill="url(#stormCore)"
                  />

                  {/* Extreme Hail Core (>65 dBZ) */}
                  <ellipse cx="310" cy="220" rx="38" ry="75" fill="#f43f5e" fillOpacity="0.85" />
                  <ellipse cx="310" cy="220" rx="20" ry="42" fill="#ec4899" fillOpacity="0.9" />
                  <text x="310" y="222" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    65+ dBZ
                  </text>
                  <text x="310" y="235" fill="#ffffff" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                    HAIL CORE
                  </text>

                  {/* Updraft Core Vector Arrows (+32 m/s) */}
                  <g stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
                    <line x1="260" y1="330" x2="275" y2="210" markerEnd="url(#arrow)" />
                    <line x1="280" y1="320" x2="295" y2="190" />
                    <line x1="300" y1="310" x2="315" y2="170" />
                  </g>
                  <text x="250" y="280" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold" transform="rotate(-75 250 280)">
                    UPDRAFT +32 m/s
                  </text>

                  {/* Lightning flash spark */}
                  <path d="M 330 180 L 320 240 L 335 240 L 315 310" stroke="#facc15" strokeWidth="2.5" fill="none" className="animate-pulse" />
                  <text x="345" y="250" fill="#facc15" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    CG LIGHTNING
                  </text>
                </svg>
              )}
            </div>

            {/* Level Information Bar */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>
                  {hoveredLevel 
                    ? `Level ${hoveredLevel} hPa: Env T = ${pressureLevels.find(l => l.p === hoveredLevel)?.envT}°C | Dewpt = ${pressureLevels.find(l => l.p === hoveredLevel)?.envTd}°C | Wind = ${pressureLevels.find(l => l.p === hoveredLevel)?.windSpd} kts` 
                    : `Station Analysis: ${currentStation.name} — ${currentStation.description}`}
                </span>
              </div>
              <span className="text-cyan-400 font-bold">
                Tropopause Inversion at {thermoMetrics.elHeightKm} km
              </span>
            </div>
          </div>

          {/* Radar Reflectivity Legend */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">IMD DWR Reflectivity Scale (dBZ):</span>
            <div className="flex items-center gap-1">
              {[
                { dbz: '15', col: 'bg-blue-600', label: 'Rain' },
                { dbz: '30', col: 'bg-green-600', label: 'Mod' },
                { dbz: '45', col: 'bg-yellow-500', label: 'T-Storm' },
                { dbz: '55', col: 'bg-red-600', label: 'Severe' },
                { dbz: '65+', col: 'bg-purple-600', label: 'Hail/Violent' },
              ].map(item => (
                <div key={item.dbz} className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.col}`}></span>
                  <span className="text-slate-200">{item.dbz}</span>
                  <span className="text-[10px] text-slate-400">({item.label})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Thermodynamic Metrics & Sensitivity Sliders */}
        <div className="space-y-4">
          {/* Key Indices Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Convective Energetics
              </span>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                thermoMetrics.calculatedCape > 3000 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {thermoMetrics.calculatedCape > 3000 ? 'EXTREME INSTABILITY' : 'HIGH INSTABILITY'}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">SBCAPE</span>
                <span className="text-xl font-bold text-amber-400">
                  {thermoMetrics.calculatedCape}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">J/kg</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (thermoMetrics.calculatedCape / 4500) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">CIN (Inhibition)</span>
                <span className="text-xl font-bold text-cyan-400">
                  {thermoMetrics.calculatedCin}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">J/kg</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (Math.abs(thermoMetrics.calculatedCin) / 100) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Lifted Index (LI)</span>
                <span className="text-xl font-bold text-rose-400">
                  {thermoMetrics.liftedIndex}°C
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Severe if &lt; -6°C</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Precip Water (PWAT)</span>
                <span className="text-xl font-bold text-blue-400">
                  {currentStation.pwat}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">mm</span>
                <span className="text-[10px] text-slate-400 block mt-1">Heavy Rain Threat</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Hail Risk Potential</span>
                <span className="text-xl font-bold text-purple-400">
                  {thermoMetrics.hailRisk}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Severe Graupel / Core</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Lightning Flash Rate</span>
                <span className="text-xl font-bold text-amber-300">
                  {thermoMetrics.lightningRate}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">fl/min</span>
                <span className="text-[10px] text-slate-400 block mt-1">Mixed-Phase Updraft</span>
              </div>
            </div>
          </div>

          {/* Interactive Atmospheric Sensitivity Simulator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Thermodynamic "What-If" Sandbox
              </span>
              <button
                onClick={() => {
                  setTempOffset(0);
                  setDewOffset(0);
                }}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                title="Reset to recorded sounding"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dynamically manipulate surface boundary layer heating and moisture flux to simulate climate warming impact on squall intensity:
            </p>

            {/* Slider 1: Surface Temperature */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  Surface Temperature:
                </span>
                <span className="text-rose-400 font-bold">
                  {sfcTemp}°C ({tempOffset >= 0 ? `+${tempOffset}` : tempOffset}°C)
                </span>
              </div>
              <input
                type="range"
                min="-4"
                max="6"
                step="0.5"
                value={tempOffset}
                onChange={(e) => setTempOffset(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Slider 2: Surface Dewpoint */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  Surface Dewpoint (Moisture):
                </span>
                <span className="text-cyan-400 font-bold">
                  {sfcDew}°C ({dewOffset >= 0 ? `+${dewOffset}` : dewOffset}°C)
                </span>
              </div>
              <input
                type="range"
                min="-4"
                max="4"
                step="0.5"
                value={dewOffset}
                onChange={(e) => setDewOffset(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Operational Impact Assessment */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Convective Trigger Time:</span>
                <span className="text-amber-400 font-bold">
                  {thermoMetrics.calculatedCin > -25 ? 'Immediate (Uncapped)' : 'Breakthrough in ~35 mins'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Microburst Wind Threat:</span>
                <span className="text-rose-400 font-bold">
                  {Math.round(65 + Math.abs(thermoMetrics.calculatedCin) * 0.8 + (sfcTemp - sfcDew) * 1.8)} km/h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Max Updraft Speed:</span>
                <span className="text-cyan-300 font-bold">
                  +{Math.round(Math.sqrt(2 * thermoMetrics.calculatedCape) * 0.55)} m/s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
