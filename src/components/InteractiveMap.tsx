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
  CloudRain
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
  const [basemapType, setBasemapType] = useState<'dark' | 'satellite' | 'osm'>('dark');

  // Dynamic Real-Time Radar State
  const [showLiveRainViewer, setShowLiveRainViewer] = useState<boolean>(true);
  const [rainViewerHost, setRainViewerHost] = useState<string>('https://tilecache.rainviewer.com');
  const [radarFrames, setRadarFrames] = useState<Array<{ time: number; path: string }>>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(-1);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(false);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.85);
  const [colorScheme, setColorScheme] = useState<number>(2);
  const [smoothRadar, setSmoothRadar] = useState<boolean>(true);

  // Animation & Loop Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(800); // ms per frame
  const [showAdvancedRadarPanel, setShowAdvancedRadarPanel] = useState<boolean>(false);

  // Synthetic & Observation Layers
  const [showRadarRings, setShowRadarRings] = useState(true);
  const [showSatelliteIR, setShowSatelliteIR] = useState(true);
  const [showLightning, setShowLightning] = useState(true);
  const [showStormCells, setShowStormCells] = useState(true);

  // Station Filter & Search State
  const [stationCategory, setStationCategory] = useState<'ALL' | 'MP' | 'NATIONAL'>('ALL');
  const [stationSearch, setStationSearch] = useState<string>('');

  const horizonOptions = [0, 15, 30, 60, 90, 120];

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

    // Default: Esri World Dark Gray Canvas (100% Free, NO API Key watermark)
    const baseLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
      }
    ).addTo(map);
    baseTileLayerRef.current = baseLayer;

    // Labels Reference Overlay
    const labelsLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '',
        maxZoom: 16,
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

  // 4. Update Basemap when changed (Esri Dark, Esri Satellite, OpenStreetMap)
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
      // 100% Free Esri World Imagery (No API key, pristine satellite photos)
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri World Imagery',
          maxZoom: 18
        }
      ).addTo(map);
      satLayer.bringToBack();
      baseTileLayerRef.current = satLayer;

      // Overlay country boundaries and places
      const boundaryLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
          maxZoom: 18,
          zIndex: 200
        }
      ).addTo(map);
      baseLabelsLayerRef.current = boundaryLayer;

    } else if (basemapType === 'osm') {
      // 100% Free OpenStreetMap Standard
      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      osmLayer.bringToBack();
      baseTileLayerRef.current = osmLayer;

    } else {
      // Default: Esri World Dark Gray Base (Pristine clean dark tactical, NO WATERMARKS)
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

    // 3. Convective Storm Cells & Tracking Motion Vectors
    if (showStormCells) {
      stormCells.forEach((cell) => {
        const cLat = cell.centroid[0] + dLat;
        const cLon = cell.centroid[1] + dLon;

        let strokeColor = '#22c55e';
        let fillColor = '#22c55e';
        if (cell.severity === 'SEVERE') {
          strokeColor = '#f43f5e';
          fillColor = '#e11d48';
        } else if (cell.severity === 'HIGH') {
          strokeColor = '#f59e0b';
          fillColor = '#d97706';
        } else if (cell.severity === 'MODERATE') {
          strokeColor = '#eab308';
          fillColor = '#ca8a04';
        }

        // Polygon footprint
        const polyCoords: L.LatLngExpression[] = cell.polygonCoordinates.map(([lat, lon]) => [lat + dLat, lon + dLon]);
        L.polygon(polyCoords, {
          color: strokeColor,
          weight: 2,
          fillColor: fillColor,
          fillOpacity: 0.35
        })
          .bindTooltip(`
            <div style="font-family: monospace; font-size: 11px;">
              <b>Storm Cell #${cell.id} (${cell.name})</b><br>
              Max Reflectivity: <span style="color: #f43f5e; font-weight: bold;">${cell.maxReflectivityDbz} dBZ</span><br>
              Echo Top: <b>${cell.echoTopKm} km</b><br>
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

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden flex flex-col h-[580px] shadow-2xl">
      {/* Top Map HUD Controls - Mobile Responsive */}
      <div className="absolute top-2 left-2 right-2 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        {/* Station Navigation & Category Filter Bar (36 Stations) */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono shadow-xl">
          <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400 text-[10px] hidden sm:inline">OBSERVATORY:</span>
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
              className="bg-slate-900 border border-slate-700/80 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-cyan-400 cursor-pointer font-bold flex-1 max-w-sm"
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
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 hidden md:inline">RADAR PINS:</span>
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
              MP Districts (26)
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

        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-0.5">
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

          {/* Basemap Switcher (100% Free: Esri Dark / Esri Satellite / OSM) */}
          <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-[11px] font-mono shadow-xl shrink-0">
            <button
              onClick={() => setBasemapType('dark')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                basemapType === 'dark' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Esri World Dark Gray (Zero API key, NO watermark)"
            >
              Dark
            </button>
            <button
              onClick={() => setBasemapType('satellite')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                basemapType === 'satellite' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Esri World Imagery High-Res Satellite (Zero API key)"
            >
              Satellite
            </button>
            <button
              onClick={() => setBasemapType('osm')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                basemapType === 'osm' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="OpenStreetMap Standard"
            >
              OSM
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

      {/* Forecast Horizon Timeline Scrubber */}
      <div className="absolute bottom-2 left-2 right-2 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-2xl">
          <span className="text-[10px] font-mono text-slate-400 px-1.5 font-semibold flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">NOWCAST:</span>
          </span>
          {horizonOptions.map((min) => {
            const isSelected = selectedHorizonMinutes === min;
            return (
              <button
                key={min}
                onClick={() => onSelectHorizon(min)}
                className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {min === 0 ? 'NOW' : `+${min}m`}
              </button>
            );
          })}
        </div>

        {/* Doppler dBZ Reflectivity Scale Legend */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 shadow-2xl">
          <span className="text-slate-400">dBZ SCALE:</span>
          <div className="flex items-center gap-0.5">
            <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-l text-[9px]">15 LGT</span>
            <span className="px-1.5 py-0.5 bg-cyan-500 text-slate-950 font-bold text-[9px]">25 MOD</span>
            <span className="px-1.5 py-0.5 bg-green-500 text-slate-950 font-bold text-[9px]">35 HVY</span>
            <span className="px-1.5 py-0.5 bg-yellow-400 text-slate-950 font-bold text-[9px]">45 SVR</span>
            <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold text-[9px]">55 VIO</span>
            <span className="px-1.5 py-0.5 bg-purple-600 text-white font-bold rounded-r text-[9px]">65+ HAIL</span>
          </div>
        </div>
      </div>

      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
