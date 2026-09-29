import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Zap, 
  Radio, 
  Compass, 
  Wind,
  Globe,
  Satellite,
  Play,
  Pause,
  RotateCw,
  Info,
  Maximize2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CloudRain,
  SkipBack,
  SkipForward,
  Repeat,
  Clock,
  Activity,
  Flame
} from 'lucide-react';
import type { StormCell, LightningStrike, RiskLevel } from '../types/nowcast';

interface InteractiveMapProps {
  selectedLocationId: string;
  onSelectLocation: (locationId: string) => void;
  selectedHorizonMinutes: number;
  onSelectHorizon: (minutes: number) => void;
  stormCells: StormCell[];
  lightningStrikes: LightningStrike[];
  currentRisk: RiskLevel;
}

export interface MapStationLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  risk: RiskLevel;
  dbz: number;
  category: 'MP' | 'NATIONAL';
  subtext: string;
}

export const ALL_LOCATIONS: MapStationLocation[] = [
  // --- Madhya Pradesh Convective Corridor (26 Stations) ---
  { id: 'bhopal', name: 'Bhopal (DWR)', lat: 23.2599, lon: 77.4126, risk: 'SEVERE', dbz: 54, category: 'MP', subtext: 'S-Band Radar HQ' },
  { id: 'indore', name: 'Indore (DWR)', lat: 22.7196, lon: 75.8577, risk: 'HIGH', dbz: 48, category: 'MP', subtext: 'C-Band Radar' },
  { id: 'jabalpur', name: 'Jabalpur', lat: 23.1815, lon: 79.9864, risk: 'MODERATE', dbz: 38, category: 'MP', subtext: 'Mahakoshal Basin' },
  { id: 'gwalior', name: 'Gwalior', lat: 26.2183, lon: 78.1828, risk: 'LOW', dbz: 22, category: 'MP', subtext: 'Chambal Belt' },
  { id: 'ujjain', name: 'Ujjain', lat: 23.1765, lon: 75.7885, risk: 'HIGH', dbz: 47, category: 'MP', subtext: 'Shipra Basin' },
  { id: 'sagar', name: 'Sagar', lat: 23.8388, lon: 78.7378, risk: 'MODERATE', dbz: 34, category: 'MP', subtext: 'Bundelkhand' },
  { id: 'narmadapuram', name: 'Narmadapuram', lat: 22.7519, lon: 77.7289, risk: 'HIGH', dbz: 46, category: 'MP', subtext: 'Hoshangabad Valley' },
  { id: 'rewa', name: 'Rewa', lat: 24.5362, lon: 81.3037, risk: 'HIGH', dbz: 44, category: 'MP', subtext: 'Vindhya Plateau' },
  { id: 'satna', name: 'Satna', lat: 24.6005, lon: 80.8322, risk: 'MODERATE', dbz: 36, category: 'MP', subtext: 'Limestone Corridor' },
  { id: 'chhindwara', name: 'Chhindwara', lat: 22.0574, lon: 78.9382, risk: 'SEVERE', dbz: 52, category: 'MP', subtext: 'Satpura Ridge' },
  { id: 'ratlam', name: 'Ratlam', lat: 23.3315, lon: 75.0367, risk: 'MODERATE', dbz: 37, category: 'MP', subtext: 'Malwa West' },
  { id: 'dewas', name: 'Dewas', lat: 22.9676, lon: 76.0534, risk: 'HIGH', dbz: 45, category: 'MP', subtext: 'Industrial Arc' },
  { id: 'shivpuri', name: 'Shivpuri', lat: 25.4358, lon: 77.6635, risk: 'LOW', dbz: 24, category: 'MP', subtext: 'Madhav Sector' },
  { id: 'vidisha', name: 'Vidisha', lat: 23.5251, lon: 77.8081, risk: 'HIGH', dbz: 43, category: 'MP', subtext: 'Betwa Basin' },
  { id: 'damoh', name: 'Damoh', lat: 23.8323, lon: 79.4422, risk: 'MODERATE', dbz: 33, category: 'MP', subtext: 'Bundelkhand Gorge' },
  { id: 'mandsaur', name: 'Mandsaur', lat: 24.0725, lon: 75.0682, risk: 'MODERATE', dbz: 35, category: 'MP', subtext: 'Malwa North' },
  { id: 'khargone', name: 'Khargone', lat: 21.8234, lon: 75.6180, risk: 'MODERATE', dbz: 38, category: 'MP', subtext: 'West Nimar' },
  { id: 'khandwa', name: 'Khandwa', lat: 21.8314, lon: 76.3498, risk: 'MODERATE', dbz: 39, category: 'MP', subtext: 'East Nimar' },
  { id: 'sehore', name: 'Sehore', lat: 23.2031, lon: 77.0844, risk: 'HIGH', dbz: 44, category: 'MP', subtext: 'Central Agricultural' },
  { id: 'singrauli', name: 'Singrauli', lat: 24.1997, lon: 82.6645, risk: 'HIGH', dbz: 46, category: 'MP', subtext: 'Thermal Basin' },
  { id: 'neemuch', name: 'Neemuch', lat: 24.4725, lon: 74.8625, risk: 'LOW', dbz: 26, category: 'MP', subtext: 'Border Radar' },
  { id: 'katni', name: 'Katni', lat: 23.8343, lon: 80.3957, risk: 'MODERATE', dbz: 35, category: 'MP', subtext: 'Bauxite Junction' },
  { id: 'betul', name: 'Betul', lat: 21.9014, lon: 77.9014, risk: 'HIGH', dbz: 42, category: 'MP', subtext: 'Satpura Ghat' },
  { id: 'balaghat', name: 'Balaghat', lat: 21.8129, lon: 80.1837, risk: 'HIGH', dbz: 47, category: 'MP', subtext: 'Wainganga Basin' },
  { id: 'pachmarhi', name: 'Pachmarhi', lat: 22.4674, lon: 78.4346, risk: 'HIGH', dbz: 43, category: 'MP', subtext: 'Hill Station (1067m)' },
  { id: 'khajuraho', name: 'Khajuraho', lat: 24.8318, lon: 79.9199, risk: 'LOW', dbz: 25, category: 'MP', subtext: 'Airport Radar Area' },

  // --- Pan-India Metropolitan & High-Convection Hubs (10 Stations) ---
  { id: 'delhi', name: 'Delhi NCR', lat: 28.6139, lon: 77.2090, risk: 'MODERATE', dbz: 34, category: 'NATIONAL', subtext: 'Safdarjung DWR' },
  { id: 'kolkata', name: 'Kolkata', lat: 22.5726, lon: 88.3639, risk: 'SEVERE', dbz: 58, category: 'NATIONAL', subtext: 'Kalbaishakhi Nor\'wester' },
  { id: 'mumbai', name: 'Mumbai Metro', lat: 19.0760, lon: 72.8777, risk: 'HIGH', dbz: 46, category: 'NATIONAL', subtext: 'Santacruz Coastal DWR' },
  { id: 'bengaluru', name: 'Bengaluru', lat: 12.9716, lon: 77.5946, risk: 'LOW', dbz: 22, category: 'NATIONAL', subtext: 'HAL Observatory' },
  { id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lon: 78.4867, risk: 'MODERATE', dbz: 36, category: 'NATIONAL', subtext: 'Telangana Dryline' },
  { id: 'chennai', name: 'Chennai', lat: 13.0827, lon: 80.2707, risk: 'LOW', dbz: 20, category: 'NATIONAL', subtext: 'Coromandel Radar' },
  { id: 'nagpur', name: 'Nagpur', lat: 21.1458, lon: 79.0882, risk: 'HIGH', dbz: 45, category: 'NATIONAL', subtext: 'Central S-Band DWR' },
  { id: 'guwahati', name: 'Guwahati', lat: 26.1445, lon: 91.7362, risk: 'SEVERE', dbz: 56, category: 'NATIONAL', subtext: 'Brahmaputra Basin' },
  { id: 'jaipur', name: 'Jaipur', lat: 26.9124, lon: 75.7873, risk: 'LOW', dbz: 28, category: 'NATIONAL', subtext: 'Aravalli Squall DWR' },
  { id: 'patna', name: 'Patna', lat: 25.5941, lon: 85.1376, risk: 'HIGH', dbz: 48, category: 'NATIONAL', subtext: 'Gangetic Lightning Belt' }
];

const COLOR_SCHEMES = [
  { id: 2, name: 'Universal Doppler (IMD/ECMWF)' },
  { id: 6, name: 'NEXRAD Level-III' },
  { id: 7, name: 'Rainbow Convective' },
  { id: 1, name: 'Titan Dual-Pol' }
];

export const STORM_CYCLE_STEPS = [0, 15, 30, 45, 60, 75, 90, 105, 120];

export interface StormLifecyclePhase {
  phase: string;
  stageName: string;
  badgeColor: string;
  description: string;
  reflectivityMultiplier: number;
  lightningMultiplier: number;
  capeJkg: number;
  icon: string;
  simulatedDbz: number;
  simulatedFlashRate: number;
  echoTopKm: number;
}

export function getLifecyclePhase(minutes: number, baseDbz = 52): StormLifecyclePhase {
  if (minutes === 0) {
    return {
      phase: 'INITIATION',
      stageName: 'Stage 1: Convective Initiation',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Localized thermal updrafts breaking capping inversion; cumulus congestus breakout.',
      reflectivityMultiplier: 0.78,
      lightningMultiplier: 0.3,
      capeJkg: 2850,
      icon: '🌱',
      simulatedDbz: Math.round(baseDbz * 0.78),
      simulatedFlashRate: 8,
      echoTopKm: 8.2
    };
  } else if (minutes <= 20) {
    return {
      phase: 'UPDRAFT_SURGE',
      stageName: 'Stage 2: Explosive Updraft Acceleration',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: 'Vigorous graupel-ice hydrometeor collisions; sharp surge in intra-cloud lightning discharges.',
      reflectivityMultiplier: 0.98,
      lightningMultiplier: 0.85,
      capeJkg: 2950,
      icon: '⚡',
      simulatedDbz: Math.round(baseDbz * 0.98),
      simulatedFlashRate: 34,
      echoTopKm: 11.5
    };
  } else if (minutes <= 40) {
    return {
      phase: 'MATURE_CORE',
      stageName: 'Stage 3: Mature Supercell & Hail Core',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description: 'Severe convective core >55 dBZ; dense hail shaft descending with rapid cloud-to-ground strikes.',
      reflectivityMultiplier: 1.18,
      lightningMultiplier: 1.45,
      capeJkg: 3200,
      icon: '🌩️',
      simulatedDbz: Math.min(68, Math.round(baseDbz * 1.18)),
      simulatedFlashRate: 72,
      echoTopKm: 14.8
    };
  } else if (minutes <= 60) {
    return {
      phase: 'MICROBURST_OUTFLOW',
      stageName: 'Stage 4: Downburst & Severe Outflow Boundary',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description: 'Heavy precipitation loading induces severe 85+ km/h downdrafts and microburst gust front.',
      reflectivityMultiplier: 1.10,
      lightningMultiplier: 1.15,
      capeJkg: 2650,
      icon: '🌪️',
      simulatedDbz: Math.round(baseDbz * 1.10),
      simulatedFlashRate: 58,
      echoTopKm: 13.6
    };
  } else if (minutes <= 80) {
    return {
      phase: 'GUST_FRONT',
      stageName: 'Stage 5: Squall Line & Cold Pool Propagation',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      description: 'Multi-cell clustering along advancing cold pool boundary; secondary cell generation triggered.',
      reflectivityMultiplier: 0.92,
      lightningMultiplier: 0.70,
      capeJkg: 2150,
      icon: '💨',
      simulatedDbz: Math.round(baseDbz * 0.92),
      simulatedFlashRate: 32,
      echoTopKm: 10.4
    };
  } else if (minutes <= 100) {
    return {
      phase: 'STRATIFORM_DECAY',
      stageName: 'Stage 6: Decaying Mesoscale Rain Shield',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description: 'Convective towers collapse into widespread stratiform rain shield; expanding anvil cirrus.',
      reflectivityMultiplier: 0.72,
      lightningMultiplier: 0.30,
      capeJkg: 1700,
      icon: '🌧️',
      simulatedDbz: Math.round(baseDbz * 0.72),
      simulatedFlashRate: 12,
      echoTopKm: 8.0
    };
  } else {
    return {
      phase: 'DISSIPATION',
      stageName: 'Stage 7: Convective Dissipation & Clearing',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      description: 'Residual stratiform drizzle with thinning cirrus shield; tropospheric boundary layer stabilized.',
      reflectivityMultiplier: 0.55,
      lightningMultiplier: 0.10,
      capeJkg: 1350,
      icon: '⛅',
      simulatedDbz: Math.round(baseDbz * 0.55),
      simulatedFlashRate: 2,
      echoTopKm: 6.2
    };
  }
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedLocationId,
  onSelectLocation,
  selectedHorizonMinutes,
  onSelectHorizon,
  stormCells,
  lightningStrikes
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const baseLabelsLayerRef = useRef<L.TileLayer | null>(null);
  const rainViewerTileLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap options: 100% Free, NO CartoDB, NO "API Key Required" watermark!
  const [basemapType, setBasemapType] = useState<'satellite' | 'topo' | 'dark' | 'osm'>('satellite');

  // Dynamic Real-Time Radar State
  const [showLiveRainViewer, setShowLiveRainViewer] = useState<boolean>(true);
  const [rainViewerHost, setRainViewerHost] = useState<string>('https://tilecache.rainviewer.com');
  const [radarFrames, setRadarFrames] = useState<Array<{ time: number; path: string }>>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(-1);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(false);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.85);
  const [colorScheme, setColorScheme] = useState<number>(2);
  const [smoothRadar, setSmoothRadar] = useState<boolean>(true);

  // Animation & Loop Controls (RainViewer Doppler)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(800); // ms per frame
  const [showAdvancedRadarPanel, setShowAdvancedRadarPanel] = useState<boolean>(false);

  // Storm Development Cycle Animation State
  const [isStormCyclePlaying, setIsStormCyclePlaying] = useState<boolean>(false);
  const [stormCycleSpeed, setStormCycleSpeed] = useState<number>(1200); // ms per step
  const [isContinuousLoop, setIsContinuousLoop] = useState<boolean>(true);

  // Synthetic & Observation Layers
  const [showRadarRings, setShowRadarRings] = useState(true);
  const [showSatelliteIR, setShowSatelliteIR] = useState(true);
  const [showLightning, setShowLightning] = useState(true);
  const [showStormCells, setShowStormCells] = useState(true);

  // Station Filter & Search State
  const [stationCategory, setStationCategory] = useState<'ALL' | 'MP' | 'NATIONAL'>('ALL');
  const [stationSearch, setStationSearch] = useState<string>('');

  // 1. Fetch Real-time Radar Maps from RainViewer Public API
  const fetchRainViewerMaps = useCallback(async () => {
    try {
      setIsLoadingRadar(true);
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error(`RainViewer HTTP ${res.status}`);
      const data = await res.json();

      if (data.host && data.radar?.past && data.radar.past.length > 0) {
        setRainViewerHost(data.host);
        setRadarFrames(data.radar.past);
        // Default to latest available scan
        setCurrentFrameIndex(data.radar.past.length - 1);
      }
    } catch (err) {
      console.warn('Could not load live RainViewer radar frames:', err);
    } finally {
      setIsLoadingRadar(false);
    }
  }, []);

  useEffect(() => {
    fetchRainViewerMaps();
    const interval = setInterval(fetchRainViewerMaps, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRainViewerMaps]);

  // 2. Continuous Animation Loop Effect
  useEffect(() => {
    if (!isPlaying || radarFrames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        if (prev >= radarFrames.length - 1) {
          return 0; // Loop back to oldest frame
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, radarFrames.length, playbackSpeed]);

  // 2b. Storm Development Cycle Animation Loop Effect (Simulates looping 0-120m convective lifecycle)
  useEffect(() => {
    if (!isStormCyclePlaying) return;

    const interval = setInterval(() => {
      const idx = STORM_CYCLE_STEPS.indexOf(selectedHorizonMinutes);
      let nextIdx = (idx < 0 ? 0 : idx) + 1;
      if (nextIdx >= STORM_CYCLE_STEPS.length) {
        if (isContinuousLoop) {
          nextIdx = 0; // Loop back to Initiation (T+0m)
        } else {
          setIsStormCyclePlaying(false);
          return;
        }
      }
      const nextMin = STORM_CYCLE_STEPS[nextIdx];
      onSelectHorizon(nextMin);

      // Sync Doppler radar frame proportionally if loaded
      if (radarFrames.length > 0) {
        const frameIdx = Math.floor((nextMin / 120) * (radarFrames.length - 1));
        setCurrentFrameIndex(frameIdx);
      }
    }, stormCycleSpeed);

    return () => clearInterval(interval);
  }, [isStormCyclePlaying, selectedHorizonMinutes, isContinuousLoop, stormCycleSpeed, radarFrames.length, onSelectHorizon]);

  // Step Forward & Step Backward Handlers
  const handleStepForward = () => {
    setIsStormCyclePlaying(false);
    const currentIndex = STORM_CYCLE_STEPS.indexOf(selectedHorizonMinutes);
    const nextIndex = Math.min(STORM_CYCLE_STEPS.length - 1, (currentIndex < 0 ? 0 : currentIndex) + 1);
    const nextMin = STORM_CYCLE_STEPS[nextIndex];
    onSelectHorizon(nextMin);
    if (radarFrames.length > 0) {
      setCurrentFrameIndex(Math.floor((nextMin / 120) * (radarFrames.length - 1)));
    }
  };

  const handleStepBackward = () => {
    setIsStormCyclePlaying(false);
    const currentIndex = STORM_CYCLE_STEPS.indexOf(selectedHorizonMinutes);
    const prevIndex = Math.max(0, (currentIndex < 0 ? 0 : currentIndex) - 1);
    const prevMin = STORM_CYCLE_STEPS[prevIndex];
    onSelectHorizon(prevMin);
    if (radarFrames.length > 0) {
      setCurrentFrameIndex(Math.floor((prevMin / 120) * (radarFrames.length - 1)));
    }
  };

  const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsStormCyclePlaying(false);
    const val = Number(e.target.value);
    const closest = STORM_CYCLE_STEPS.reduce((prev, curr) => 
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );
    onSelectHorizon(closest);
    if (radarFrames.length > 0) {
      setCurrentFrameIndex(Math.floor((closest / 120) * (radarFrames.length - 1)));
    }
  };

  // 3. Initialize Leaflet Map (Using Clean Esri Dark Canvas - NO WATERMARKS)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on India / Central Region (Madhya Pradesh)
    const map = L.map(mapContainerRef.current, {
      center: [23.35, 77.7],
      zoom: 7,
      minZoom: 4,
      maxZoom: 16,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Default: High-Definition True-Color Satellite Imagery (Esri World Imagery)
    const satLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri World Imagery',
        maxZoom: 18
      }
    ).addTo(map);
    baseTileLayerRef.current = satLayer;

    // Boundaries and City Labels Reference Overlay
    const labelsLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '',
        maxZoom: 18,
        zIndex: 200
      }
    ).addTo(map);
    baseLabelsLayerRef.current = labelsLayer;

    const layersGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    // Invalidate size on mount to ensure clean tile rendering on mobile & desktop
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 4. Update Basemap when changed (Satellite, 3D Topo, Tactical Dark, OSM)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (baseLabelsLayerRef.current) {
      map.removeLayer(baseLabelsLayerRef.current);
      baseLabelsLayerRef.current = null;
    }

    if (basemapType === 'satellite') {
      // 100% Free High-Res Esri World Imagery Satellite
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri World Imagery',
          maxZoom: 18
        }
      ).addTo(map);
      satLayer.bringToBack();
      baseTileLayerRef.current = satLayer;

      // Overlay country & administrative boundaries, highways, cities
      const boundaryLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
          maxZoom: 18,
          zIndex: 200
        }
      ).addTo(map);
      baseLabelsLayerRef.current = boundaryLayer;

    } else if (basemapType === 'topo') {
      // 100% Free Esri World Topo Map (Shaded Relief, Topography, River Valleys, Green Mountain Ridges)
      const topoLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri World Topo',
          maxZoom: 18
        }
      ).addTo(map);
      topoLayer.bringToBack();
      baseTileLayerRef.current = topoLayer;

    } else if (basemapType === 'osm') {
      // 100% Free OpenStreetMap Standard
      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      osmLayer.bringToBack();
      baseTileLayerRef.current = osmLayer;

    } else {
      // Esri World Dark Gray Base (Pristine clean dark tactical)
      const darkLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri World Dark Gray',
          maxZoom: 16
        }
      ).addTo(map);
      darkLayer.bringToBack();
      baseTileLayerRef.current = darkLayer;

      const labelsLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
          maxZoom: 16,
          zIndex: 200
        }
      ).addTo(map);
      baseLabelsLayerRef.current = labelsLayer;
    }
  }, [basemapType]);

  // 5. Update Dynamic Real-Time Radar Reflectivity Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!showLiveRainViewer || radarFrames.length === 0 || currentFrameIndex < 0) {
      if (rainViewerTileLayerRef.current) {
        map.removeLayer(rainViewerTileLayerRef.current);
        rainViewerTileLayerRef.current = null;
      }
      return;
    }

    const frame = radarFrames[currentFrameIndex];
    if (!frame) return;

    const smoothFlag = smoothRadar ? '1' : '0';
    // Format: host + path + /256/{z}/{x}/{y}/{colorScheme}/{smooth}_1.png
    const tileUrl = `${rainViewerHost}${frame.path}/256/{z}/{x}/{y}/${colorScheme}/${smoothFlag}_1.png`;

    if (rainViewerTileLayerRef.current) {
      // Smooth dynamic URL update (avoids screen flash)
      rainViewerTileLayerRef.current.setUrl(tileUrl);
      rainViewerTileLayerRef.current.setOpacity(radarOpacity);
    } else {
      const radarLayer = L.tileLayer(tileUrl, {
        opacity: radarOpacity,
        zIndex: 500,
        attribution: 'Real-Time Radar &copy; RainViewer / IMD WMO'
      }).addTo(map);
      rainViewerTileLayerRef.current = radarLayer;
    }
  }, [showLiveRainViewer, radarFrames, currentFrameIndex, rainViewerHost, radarOpacity, colorScheme, smoothRadar]);

  // 6. Update Synthetic Weather Objects, Lightning, and Sensors
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Advection displacement calculation based on forecast horizon
    const hours = selectedHorizonMinutes / 60;
    const speedKmH = 36;
    const headingRad = (55 * Math.PI) / 180;
    const dLat = (hours * speedKmH * Math.cos(headingRad)) / 111;
    const dLon = (hours * speedKmH * Math.sin(headingRad)) / 102;

    // 1. Doppler Radar Station Sweep Rings
    if (showRadarRings) {
      const radars = [
        { lat: 23.287, lon: 77.345, name: 'DWR Bhopal (S-Band)' },
        { lat: 22.722, lon: 75.801, name: 'DWR Indore (C-Band)' },
        { lat: 21.152, lon: 79.062, name: 'DWR Nagpur (S-Band)' }
      ];

      radars.forEach((r) => {
        L.circle([r.lat, r.lon], {
          radius: 120000,
          color: '#0284c7',
          weight: 1,
          dashArray: '4, 6',
          fill: false,
          opacity: 0.4
        }).addTo(group);

        L.circle([r.lat, r.lon], {
          radius: 220000,
          color: '#0369a1',
          weight: 1,
          dashArray: '2, 8',
          fill: false,
          opacity: 0.25
        }).addTo(group);

        const radarIcon = L.divIcon({
          className: 'custom-radar-icon',
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute w-5 h-5 rounded-full bg-cyan-500/20 animate-ping"></span>
              <span class="w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-900 shadow"></span>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([r.lat, r.lon], { icon: radarIcon })
          .bindTooltip(`<b>${r.name}</b><br><span style="font-family: monospace;">VCP-21 Convective Sweep</span>`, {
            className: 'bg-slate-900 text-cyan-300 border border-slate-700 font-sans text-xs',
            direction: 'top'
          })
          .addTo(group);
      });
    }

    // 2. Satellite Cloud Top IR Gradient / Deep Convection Contours
    if (showSatelliteIR) {
      const satelliteBands = [
        { lat: 23.32 + dLat, lon: 77.48 + dLon, r: 85000, temp: -62, hex: '#4f46e5', opacity: 0.28 },
        { lat: 22.80 + dLat, lon: 75.95 + dLon, r: 70000, temp: -56, hex: '#6366f1', opacity: 0.22 },
        { lat: 22.30 + dLat, lon: 77.90 + dLon, r: 60000, temp: -52, hex: '#818cf8', opacity: 0.18 }
      ];

      satelliteBands.forEach((band) => {
        L.circle([band.lat, band.lon], {
          radius: band.r,
          color: '#a5b4fc',
          weight: 1,
          dashArray: '3, 5',
          fillColor: band.hex,
          fillOpacity: band.opacity
        })
          .bindTooltip(`<b>INSAT-3DR Deep Convection</b><br>Cloud-Top Brightness: <span style="color:#a5b4fc; font-weight:bold;">${band.temp}°C</span>`, {
            direction: 'center'
          })
          .addTo(group);
      });
    }

    // Convective Lifecycle Profile for active horizon
    const currentPhase = getLifecyclePhase(selectedHorizonMinutes, 52);

    // 3. Convective Storm Cells & Tracking Motion Vectors
    if (showStormCells) {
      stormCells.forEach((cell) => {
        const cLat = cell.centroid[0] + dLat;
        const cLon = cell.centroid[1] + dLon;

        // Dynamic simulated reflectivity throughout development cycle
        const simulatedDbz = Math.min(68, Math.max(20, Math.round(cell.maxReflectivityDbz * currentPhase.reflectivityMultiplier)));
        
        let strokeColor = '#22c55e';
        let fillColor = '#22c55e';
        let fillOpacity = 0.35;
        let severityTag = 'MODERATE CELL';

        if (simulatedDbz >= 55) {
          strokeColor = '#f43f5e';
          fillColor = '#be123c';
          fillOpacity = 0.55;
          severityTag = 'SEVERE HAIL CORE';
        } else if (simulatedDbz >= 45) {
          strokeColor = '#f97316';
          fillColor = '#ea580c';
          fillOpacity = 0.45;
          severityTag = 'HIGH CONVECTION';
        } else if (simulatedDbz >= 35) {
          strokeColor = '#eab308';
          fillColor = '#ca8a04';
          fillOpacity = 0.35;
          severityTag = 'MODERATE RAIN';
        } else {
          strokeColor = '#06b6d4';
          fillColor = '#0891b2';
          fillOpacity = 0.25;
          severityTag = 'DISSIPATING STRATIFORM';
        }

        // Polygon footprint
        const polyCoords: L.LatLngExpression[] = cell.polygonCoordinates.map(([lat, lon]) => [lat + dLat, lon + dLon]);
        L.polygon(polyCoords, {
          color: strokeColor,
          weight: simulatedDbz >= 55 ? 3 : 2,
          fillColor: fillColor,
          fillOpacity: fillOpacity
        })
          .bindTooltip(`
            <div style="font-family: monospace; font-size: 11px;">
              <b>Storm Cell #${cell.id} (${cell.name})</b><br>
              Phase: <span style="color: #38bdf8; font-weight: bold;">${currentPhase.stageName}</span><br>
              Simulated Core: <span style="color: ${strokeColor}; font-weight: bold;">${simulatedDbz} dBZ (${severityTag})</span><br>
              Echo Top: <b>${(cell.echoTopKm * (simulatedDbz / Math.max(1, cell.maxReflectivityDbz))).toFixed(1)} km</b><br>
              Motion: ${cell.motionSpeedKmh} km/h @ ${cell.motionHeadingDeg}°
            </div>
          `, { direction: 'top' })
          .addTo(group);

        // Motion Vector Extrapolation
        const heading = (cell.motionHeadingDeg * Math.PI) / 180;
        const vectorLenKm = (cell.motionSpeedKmh * 0.75);
        const vEndLat = cLat + (vectorLenKm * Math.cos(heading)) / 111;
        const vEndLon = cLon + (vectorLenKm * Math.sin(heading)) / 102;

        L.polyline([[cLat, cLon], [vEndLat, vEndLon]], {
          color: strokeColor,
          weight: 2.5,
          dashArray: '3, 4',
          opacity: 0.85
        }).addTo(group);
      });
    }

    // 4. Real-Time Lightning Strikes (CG & IC)
    if (showLightning && selectedHorizonMinutes === 0) {
      lightningStrikes.forEach((strike) => {
        const isCg = strike.type === 'CG';
        const isFresh = strike.ageSeconds < 60;

        const lightningIcon = L.divIcon({
          className: 'lightning-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer">
              ${isFresh ? '<span class="absolute w-6 h-6 rounded-full bg-amber-400/40 animate-ping"></span>' : ''}
              <div class="w-5 h-5 rounded-full ${isCg ? 'bg-amber-500' : 'bg-cyan-400'} border border-slate-900 flex items-center justify-center shadow-lg">
                <span class="text-[9px] font-bold text-slate-950 font-mono">⚡</span>
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([strike.latitude, strike.longitude], { icon: lightningIcon })
          .bindTooltip(`
            <div style="font-family: monospace; font-size: 11px;">
              <b>${strike.type === 'CG' ? 'Cloud-to-Ground (CG)' : 'Intra-Cloud (IC)'} Strike</b><br>
              Peak Current: <span style="color: #fbbf24;">${strike.peakCurrentKa} kA</span><br>
              Detected: <span>${strike.ageSeconds}s ago</span>
            </div>
          `, { direction: 'top' })
          .addTo(group);
      });
    }

    // 5. Active Weather Observatories & Convective Radar Network (36 Stations)
    const filteredStations = ALL_LOCATIONS.filter(loc => {
      if (stationCategory !== 'ALL' && loc.category !== stationCategory) return false;
      if (stationSearch.trim()) {
        const query = stationSearch.toLowerCase();
        return loc.name.toLowerCase().includes(query) || loc.subtext.toLowerCase().includes(query);
      }
      return true;
    });

    filteredStations.forEach((loc) => {
      const isSelected = loc.id === selectedLocationId;
      let badgeColor = '#22c55e';
      if (loc.risk === 'SEVERE') badgeColor = '#f43f5e';
      else if (loc.risk === 'HIGH') badgeColor = '#f97316';
      else if (loc.risk === 'MODERATE') badgeColor = '#eab308';

      const cityIcon = L.divIcon({
        className: 'city-marker',
        html: `
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all shadow-md cursor-pointer whitespace-nowrap ${
            isSelected 
              ? 'bg-cyan-500 text-slate-950 ring-2 ring-white scale-110 z-50' 
              : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:border-cyan-400 hover:scale-105'
          }">
            <span style="background-color: ${badgeColor}; width: 6px; height: 6px; border-radius: 50%; shrink: 0;"></span>
            <span>${loc.name}</span>
            <span class="text-[9px] opacity-75 font-normal">(${loc.dbz} dBZ)</span>
          </div>
        `,
        iconSize: [110, 22],
        iconAnchor: [55, 11]
      });

      const marker = L.marker([loc.lat, loc.lon], { icon: cityIcon }).addTo(group);
      marker.on('click', () => {
        onSelectLocation(loc.id);
        map.flyTo([loc.lat, loc.lon], Math.max(map.getZoom(), 8), { duration: 0.6 });
      });
    });

  }, [
    selectedHorizonMinutes, 
    selectedLocationId, 
    stormCells, 
    lightningStrikes, 
    showRadarRings, 
    showSatelliteIR, 
    showLightning, 
    showStormCells, 
    stationCategory,
    stationSearch,
    onSelectLocation
  ]);

  const activeFrame = radarFrames[currentFrameIndex];
  const formattedRadarTime = activeFrame ? new Date(activeFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const isLatestFrame = currentFrameIndex === radarFrames.length - 1;

  // Calculate relative minutes from now for current frame
  const getRelativeFrameLabel = () => {
    if (!activeFrame) return 'Syncing...';
    if (isLatestFrame) return 'LIVE NOW';
    const nowSec = Math.floor(Date.now() / 1000);
    const diffMin = Math.round((nowSec - activeFrame.time) / 60);
    return `-${diffMin}m ago`;
  };

  const currentPhase = getLifecyclePhase(selectedHorizonMinutes, 52);

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden flex flex-col h-[640px] md:h-[680px] shadow-2xl">
      {/* Top Map HUD Controls - Mobile Responsive */}
      <div className="absolute top-2 left-2 right-2 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        {/* Station Navigation & Category Filter Bar (36 Stations) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 bg-slate-950/95 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono shadow-xl">
          <div className="flex items-center gap-1.5 flex-1 min-w-[180px] sm:min-w-[220px]">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400 text-[10px] hidden md:inline">OBSERVATORY:</span>
            <select
              value={selectedLocationId}
              onChange={(e) => {
                const locId = e.target.value;
                onSelectLocation(locId);
                const found = ALL_LOCATIONS.find(l => l.id === locId);
                if (found && mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([found.lat, found.lon], Math.max(mapInstanceRef.current.getZoom(), 8), { duration: 0.6 });
                }
              }}
              className="bg-slate-900 border border-slate-700/80 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-cyan-400 cursor-pointer font-bold flex-1 w-full max-w-full sm:max-w-sm"
              title="Select any of the 36 Weather Radar & District Stations across MP and India"
            >
              <optgroup label="Madhya Pradesh Districts (26 Stations)">
                {ALL_LOCATIONS.filter(l => l.category === 'MP').map(l => (
                  <option key={l.id} value={l.id}>
                    📍 {l.name} — {l.risk} ({l.dbz} dBZ)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Pan-India High-Convection Hubs (10 Stations)">
                {ALL_LOCATIONS.filter(l => l.category === 'NATIONAL').map(l => (
                  <option key={l.id} value={l.id}>
                    📡 {l.name} — {l.risk} ({l.dbz} dBZ)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-slate-500 hidden lg:inline">RADAR PINS:</span>
            <button
              onClick={() => setStationCategory('ALL')}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                stationCategory === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              All (36)
            </button>
            <button
              onClick={() => setStationCategory('MP')}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                stationCategory === 'MP' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              MP (26)
            </button>
            <button
              onClick={() => setStationCategory('NATIONAL')}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                stationCategory === 'NATIONAL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              National (10)
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {/* Layer Visibility Toggles */}
          <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-xs shadow-xl shrink-0">
            {/* Live Radar Toggle */}
            <button
              onClick={() => setShowLiveRainViewer(!showLiveRainViewer)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold transition-all text-xs ${
                showLiveRainViewer
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Toggle Live Real-Time Radar Reflectivity Overlay"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${showLiveRainViewer ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
              <CloudRain className="w-3.5 h-3.5" />
              <span>RADAR OVERLAY</span>
            </button>

            <button
              onClick={() => setShowRadarRings(!showRadarRings)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors text-xs ${
                showRadarRings ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle DWR Range Rings (120km/220km sweeps)"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DWR</span>
            </button>

            <button
              onClick={() => setShowSatelliteIR(!showSatelliteIR)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors text-xs ${
                showSatelliteIR ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle INSAT-3DR Deep Convection Infrared contours"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">INSAT</span>
            </button>

            <button
              onClick={() => setShowLightning(!showLightning)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors text-xs ${
                showLightning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Lightning Discharges"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lightning</span>
            </button>

            <button
              onClick={() => setShowStormCells(!showStormCells)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors text-xs ${
                showStormCells ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Convective Cell Footprints & Motion Vectors"
            >
              <Wind className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cells</span>
            </button>
          </div>

          {/* Basemap Switcher (Satellite, 3D Topo, Dark, OSM) */}
          <div className="flex items-center gap-1 bg-slate-950/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-[11px] font-mono shadow-xl shrink-0">
            <span className="text-[10px] text-slate-500 hidden xl:inline px-1">VIEW:</span>
            <button
              onClick={() => setBasemapType('satellite')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-bold cursor-pointer ${
                basemapType === 'satellite'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Esri World Imagery High-Res Satellite with Terrain & Atmosphere"
            >
              <span>🛰️</span>
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setBasemapType('topo')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all font-bold cursor-pointer ${
                basemapType === 'topo'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="3D Topographic Shaded Relief, Mountain Ridges & River Valleys"
            >
              <span>🏔️</span>
              <span>3D Topo</span>
            </button>
            <button
              onClick={() => setBasemapType('dark')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all font-bold cursor-pointer ${
                basemapType === 'dark'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Midnight Tactical Dark Gray Canvas"
            >
              <span>🌌</span>
              <span>Dark</span>
            </button>
            <button
              onClick={() => setBasemapType('osm')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all font-bold cursor-pointer ${
                basemapType === 'osm'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="OpenStreetMap Standard Navigation"
            >
              <span>🗺️</span>
              <span>Street</span>
            </button>
          </div>
        </div>

        {/* Dynamic Real-Time Radar Player Bar */}
        {showLiveRainViewer && (
          <div className="bg-slate-950/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-xl">
            {/* Play/Pause & Live Frame Indicator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1.5 rounded-lg transition-all ${
                  isPlaying 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                }`}
                title={isPlaying ? 'Pause Radar Loop Animation' : 'Play Radar Loop Animation'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              <div className="flex items-center gap-1.5 text-emerald-300">
                <span className={`w-2 h-2 rounded-full ${isLatestFrame ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`}></span>
                <span className="font-bold text-white">{getRelativeFrameLabel()}</span>
                <span className="text-slate-400 text-[11px]">({formattedRadarTime || 'Syncing...'})</span>
              </div>
            </div>

            {/* Radar Timeline Frame Slider */}
            <div className="flex items-center gap-2 flex-1 max-w-[200px] sm:max-w-xs mx-1">
              <input
                type="range"
                min="0"
                max={Math.max(0, radarFrames.length - 1)}
                value={currentFrameIndex >= 0 ? currentFrameIndex : 0}
                onChange={(e) => {
                  setIsPlaying(false); // Pause on manual scrub
                  setCurrentFrameIndex(parseInt(e.target.value, 10));
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                title="Scrub Radar Timeline (Past 2 Hours Doppler Scans)"
              />
              <span className="text-[10px] text-slate-400 shrink-0">
                {currentFrameIndex + 1}/{radarFrames.length}
              </span>
            </div>

            {/* Quick Controls: Speed, Opacity, Settings Dropdown */}
            <div className="flex items-center gap-2">
              {/* Playback speed pills */}
              <div className="hidden sm:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                <button
                  onClick={() => setPlaybackSpeed(1400)}
                  className={`px-1.5 py-0.5 rounded ${playbackSpeed === 1400 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  0.5x
                </button>
                <button
                  onClick={() => setPlaybackSpeed(800)}
                  className={`px-1.5 py-0.5 rounded ${playbackSpeed === 800 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setPlaybackSpeed(400)}
                  className={`px-1.5 py-0.5 rounded ${playbackSpeed === 400 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  2x
                </button>
              </div>

              {/* Refresh radar button */}
              <button
                onClick={fetchRainViewerMaps}
                disabled={isLoadingRadar}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Fetch Latest Real-time Radar Scan from Open API"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoadingRadar ? 'animate-spin text-cyan-400' : ''}`} />
              </button>

              {/* Toggle Advanced Radar Settings Panel */}
              <button
                onClick={() => setShowAdvancedRadarPanel(!showAdvancedRadarPanel)}
                className={`p-1 rounded flex items-center gap-1 transition-colors ${
                  showAdvancedRadarPanel ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
                title="Radar Color Palette & Opacity Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showAdvancedRadarPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {/* Advanced Dynamic Radar Controls Dropdown */}
        {showLiveRainViewer && showAdvancedRadarPanel && (
          <div className="bg-slate-950/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <span className="text-white font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Dynamic Radar Reflectivity Layer Configuration
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Open Weather Radar API Feed (WMO)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Color Scheme */}
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] block">REFLECTIVITY PALETTE:</span>
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 text-xs outline-none focus:border-cyan-400"
                >
                  {COLOR_SCHEMES.map(cs => (
                    <option key={cs.id} value={cs.id}>{cs.name}</option>
                  ))}
                </select>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>LAYER OPACITY:</span>
                  <span className="text-cyan-300">{Math.round(radarOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={radarOpacity}
                  onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Smoothing mode */}
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] block">RADAR PROCESSING:</span>
                <button
                  onClick={() => setSmoothRadar(!smoothRadar)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    smoothRadar 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {smoothRadar ? '✓ Spatial Interpolation (Smooth)' : 'Raw Doppler Pixels'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Storm Lifecycle & Radar Playback Time-Slider HUD */}
      <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 z-[1000] flex flex-col gap-1 pointer-events-auto">
        <div className="bg-slate-950/95 backdrop-blur-md p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-1.5 sm:gap-2 text-xs font-mono">
          
          {/* Top Row: Convective Phase Badge & Real-Time Telemetry */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-800/80 pb-1.5 sm:pb-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border shadow-sm ${currentPhase.badgeColor}`}>
                <span>{currentPhase.icon}</span>
                <span className="truncate max-w-[180px] sm:max-w-none">{currentPhase.stageName}</span>
              </div>
              <span className="text-[11px] text-slate-400 hidden xl:inline max-w-lg truncate">
                {currentPhase.description}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              {/* Dynamic Storm Reflectivity Core */}
              <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 sm:py-1 rounded-lg border border-slate-800 text-[10px] sm:text-[11px]">
                <span className="text-slate-400">CORE:</span>
                <span className={`font-bold ${currentPhase.simulatedDbz >= 55 ? 'text-rose-400 animate-pulse' : currentPhase.simulatedDbz >= 45 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {currentPhase.simulatedDbz} dBZ
                </span>
              </div>

              {/* Lightning Discharge Rate */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 sm:py-1 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400">LTG:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-current" />
                  ~{currentPhase.simulatedFlashRate}/m
                </span>
              </div>

              {/* Echo Top */}
              <div className="hidden md:flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400">TOP:</span>
                <span className="text-purple-300 font-bold">{currentPhase.echoTopKm}km</span>
              </div>

              {/* Time from Initiation Badge */}
              <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] sm:text-xs">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>+{selectedHorizonMinutes}m</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Playback Controls + Scrub Slider + Speed & Loop Controls */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3">
            
            {/* Playback Controls Group */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Jump to T+0m (Initiation) */}
              <button
                onClick={() => {
                  setIsStormCyclePlaying(false);
                  onSelectHorizon(0);
                  if (radarFrames.length > 0) setCurrentFrameIndex(0);
                }}
                className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Rewind to Storm Initiation (T+0m)"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              {/* Step Backward -15m */}
              <button
                onClick={handleStepBackward}
                className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Step Backward -15 minutes"
              >
                <ChevronDown className="w-3.5 h-3.5 rotate-90" />
              </button>

              {/* Animated Loop Play / Pause Button */}
              <button
                onClick={() => setIsStormCyclePlaying(!isStormCyclePlaying)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isStormCyclePlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/30'
                }`}
                title={isStormCyclePlaying ? 'Pause Storm Development Loop' : 'Animate Looping Storm Development Cycle (0-120m)'}
              >
                {isStormCyclePlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>LOOP</span>
                  </>
                )}
              </button>

              {/* Step Forward +15m */}
              <button
                onClick={handleStepForward}
                className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Step Forward +15 minutes"
              >
                <ChevronUp className="w-3.5 h-3.5 rotate-90" />
              </button>

              {/* Jump to T+120m (Dissipation) */}
              <button
                onClick={() => {
                  setIsStormCyclePlaying(false);
                  onSelectHorizon(120);
                  if (radarFrames.length > 0) setCurrentFrameIndex(radarFrames.length - 1);
                }}
                className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Fast-forward to Final Dissipation (T+120m)"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time-Slider Control (0 to 120m) with Snap Ticks */}
            <div className="flex-1 min-w-[140px] sm:min-w-[200px] px-1 sm:px-2 flex flex-col gap-1">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="15"
                  value={selectedHorizonMinutes}
                  onChange={handleTimeSliderChange}
                  className="w-full accent-cyan-400 h-1.5 sm:h-2 bg-slate-800 rounded-lg cursor-pointer transition-all"
                  title="Drag time-slider to scrub through the 0-120 minute storm development cycle"
                />
              </div>

              {/* Ticks & Step Pills */}
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-400 font-mono">
                {STORM_CYCLE_STEPS.map((step) => {
                  const isActive = selectedHorizonMinutes === step;
                  return (
                    <button
                      key={step}
                      onClick={() => {
                        setIsStormCyclePlaying(false);
                        onSelectHorizon(step);
                        if (radarFrames.length > 0) {
                          setCurrentFrameIndex(Math.floor((step / 120) * (radarFrames.length - 1)));
                        }
                      }}
                      className={`transition-all px-0.5 sm:px-1 py-0.5 rounded cursor-pointer ${
                        isActive
                          ? 'text-cyan-300 font-bold scale-105 bg-cyan-950/80 border border-cyan-500/50'
                          : 'hover:text-white'
                      }`}
                    >
                      {step === 0 ? '0' : `${step}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speed & Loop Controls + dBZ Legend */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
              {/* Speed Buttons */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[9px] sm:text-[10px]">
                <button
                  onClick={() => setStormCycleSpeed(2000)}
                  className={`px-1 sm:px-1.5 py-0.5 rounded cursor-pointer ${stormCycleSpeed === 2000 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Slow 0.5x speed"
                >
                  .5x
                </button>
                <button
                  onClick={() => setStormCycleSpeed(1200)}
                  className={`px-1 sm:px-1.5 py-0.5 rounded cursor-pointer ${stormCycleSpeed === 1200 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Normal 1.0x speed"
                >
                  1x
                </button>
                <button
                  onClick={() => setStormCycleSpeed(600)}
                  className={`px-1 sm:px-1.5 py-0.5 rounded cursor-pointer ${stormCycleSpeed === 600 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Fast 2.0x scan"
                >
                  2x
                </button>
              </div>

              {/* Loop Mode Toggle */}
              <button
                onClick={() => setIsContinuousLoop(!isContinuousLoop)}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer ${
                  isContinuousLoop
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Toggle continuous looping animation"
              >
                <Repeat className={`w-3 h-3 ${isContinuousLoop ? 'text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">{isContinuousLoop ? 'LOOP' : 'ONCE'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
