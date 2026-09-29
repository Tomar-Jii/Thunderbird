import React, { useEffect, useRef, useState } from 'react';
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
  Maximize2
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

const MP_LOCATIONS = [
  { id: 'bhopal', name: 'Bhopal (DWR)', lat: 23.2599, lon: 77.4126, risk: 'SEVERE' as RiskLevel, dbz: 54 },
  { id: 'indore', name: 'Indore (DWR)', lat: 22.7196, lon: 75.8577, risk: 'HIGH' as RiskLevel, dbz: 48 },
  { id: 'jabalpur', name: 'Jabalpur', lat: 23.1815, lon: 79.9864, risk: 'MODERATE' as RiskLevel, dbz: 38 },
  { id: 'gwalior', name: 'Gwalior', lat: 26.2183, lon: 78.1828, risk: 'LOW' as RiskLevel, dbz: 22 },
  { id: 'ujjain', name: 'Ujjain', lat: 23.1765, lon: 75.7885, risk: 'HIGH' as RiskLevel, dbz: 45 },
  { id: 'sagar', name: 'Sagar', lat: 23.8388, lon: 78.7378, risk: 'MODERATE' as RiskLevel, dbz: 34 },
  { id: 'narmadapuram', name: 'Narmadapuram', lat: 22.7519, lon: 77.7289, risk: 'HIGH' as RiskLevel, dbz: 46 }
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

  // Real-Time RainViewer State
  const [showLiveRainViewer, setShowLiveRainViewer] = useState<boolean>(true);
  const [rainViewerHost, setRainViewerHost] = useState<string>('https://tilecache.rainviewer.com');
  const [radarFrames, setRadarFrames] = useState<Array<{ time: number; path: string }>>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(-1);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(false);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.85);

  // Synthetic & Observation Layers
  const [showRadarRings, setShowRadarRings] = useState(true);
  const [showSatelliteIR, setShowSatelliteIR] = useState(true);
  const [showLightning, setShowLightning] = useState(true);
  const [showStormCells, setShowStormCells] = useState(true);

  const horizonOptions = [0, 15, 30, 60, 90, 120];

  // 1. Fetch RainViewer Public Weather Maps JSON (Zero Key Required)
  useEffect(() => {
    let isMounted = true;
    const fetchRainViewerMaps = async () => {
      try {
        setIsLoadingRadar(true);
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) throw new Error(`RainViewer HTTP ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;

        if (data.host && data.radar?.past && data.radar.past.length > 0) {
          setRainViewerHost(data.host);
          setRadarFrames(data.radar.past);
          setCurrentFrameIndex(data.radar.past.length - 1); // Latest frame
        }
      } catch (err) {
        console.warn('Could not load live RainViewer radar frames:', err);
      } finally {
        if (isMounted) setIsLoadingRadar(false);
      }
    };

    fetchRainViewerMaps();
    const interval = setInterval(fetchRainViewerMaps, 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. Initialize Leaflet Map (Using Clean Esri Dark Canvas - NO WATERMARKS)
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

  // 3. Update Basemap when changed (Esri Dark, Esri Satellite, OpenStreetMap)
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

  // 4. Update RainViewer Live Radar Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (rainViewerTileLayerRef.current) {
      map.removeLayer(rainViewerTileLayerRef.current);
      rainViewerTileLayerRef.current = null;
    }

    if (!showLiveRainViewer || radarFrames.length === 0 || currentFrameIndex < 0) return;

    const frame = radarFrames[currentFrameIndex];
    if (!frame) return;

    // RainViewer Tile Format: host + path + /256/{z}/{x}/{y}/2/1_1.png
    const tileUrl = `${rainViewerHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    const radarLayer = L.tileLayer(tileUrl, {
      opacity: radarOpacity,
      zIndex: 500,
      attribution: 'Radar Data &copy; RainViewer / IMD DWR'
    }).addTo(map);

    rainViewerTileLayerRef.current = radarLayer;
  }, [showLiveRainViewer, radarFrames, currentFrameIndex, rainViewerHost, radarOpacity]);

  // 5. Update Synthetic Weather Objects, Lightning, and Sensors
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

    // 5. Major City Observatories
    MP_LOCATIONS.forEach((loc) => {
      const isSelected = loc.id === selectedLocationId;
      let badgeColor = '#22c55e';
      if (loc.risk === 'SEVERE') badgeColor = '#f43f5e';
      else if (loc.risk === 'HIGH') badgeColor = '#f97316';
      else if (loc.risk === 'MODERATE') badgeColor = '#eab308';

      const cityIcon = L.divIcon({
        className: 'city-marker',
        html: `
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold transition-all shadow-md cursor-pointer ${
            isSelected 
              ? 'bg-cyan-500 text-slate-950 ring-2 ring-white scale-110' 
              : 'bg-slate-900/90 text-slate-200 border border-slate-700 hover:border-cyan-400'
          }">
            <span style="background-color: ${badgeColor}; width: 7px; height: 7px; border-radius: 50%;"></span>
            <span>${loc.name}</span>
          </div>
        `,
        iconSize: [90, 24],
        iconAnchor: [45, 12]
      });

      const marker = L.marker([loc.lat, loc.lon], { icon: cityIcon }).addTo(group);
      marker.on('click', () => {
        onSelectLocation(loc.id);
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
    onSelectLocation
  ]);

  const latestFrame = radarFrames[currentFrameIndex];
  const formattedRadarTime = latestFrame ? new Date(latestFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden flex flex-col h-[560px] shadow-2xl">
      {/* Top Map HUD Controls - Mobile Responsive */}
      <div className="absolute top-2 left-2 right-2 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-0.5">
          {/* Layer Visibility Toggles */}
          <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-xs shadow-xl shrink-0">
            <button
              onClick={() => setShowLiveRainViewer(!showLiveRainViewer)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold transition-all text-xs ${
                showLiveRainViewer
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Toggle Live RainViewer Composite Doppler Radar Tiles"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${showLiveRainViewer ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
              <Globe className="w-3.5 h-3.5" />
              <span>RADAR TILES</span>
            </button>

            <button
              onClick={() => setShowRadarRings(!showRadarRings)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors text-xs ${
                showRadarRings ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle DWR Range Rings (120km/220km sweeps)"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DWR</span>
            </button>

            <button
              onClick={() => setShowSatelliteIR(!showSatelliteIR)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors text-xs ${
                showSatelliteIR ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle INSAT-3DR Deep Convection Infrared contours"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">INSAT</span>
            </button>

            <button
              onClick={() => setShowLightning(!showLightning)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors text-xs ${
                showLightning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Lightning Discharges"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lightning</span>
            </button>

            <button
              onClick={() => setShowStormCells(!showStormCells)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors text-xs ${
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

        {/* Live Radar Status Bar & Opacity Control */}
        {showLiveRainViewer && (
          <div className="self-start bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-2 text-[11px] font-mono shadow-lg">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold">LIVE RADAR:</span>
              <span className="text-slate-300">{formattedRadarTime ? `${formattedRadarTime} UTC` : 'Syncing...'}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400 border-l border-slate-800 pl-2">
              <span className="text-[10px]">Opacity:</span>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={radarOpacity}
                onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                className="w-14 accent-emerald-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Forecast Horizon Timeline Scrubber */}
      <div className="absolute bottom-2 left-2 right-2 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-2xl">
          <span className="text-[10px] font-mono text-slate-400 px-1.5 font-semibold flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">HORIZON:</span>
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

        {/* Radar dBZ Reflectivity Scale Legend */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 shadow-2xl">
          <span className="text-slate-400">dBZ:</span>
          <div className="flex items-center gap-0.5">
            <span className="px-1 py-0.5 bg-blue-600 text-white rounded-l">15</span>
            <span className="px-1 py-0.5 bg-cyan-500 text-slate-950 font-bold">25</span>
            <span className="px-1 py-0.5 bg-green-500 text-slate-950 font-bold">35</span>
            <span className="px-1 py-0.5 bg-yellow-400 text-slate-950 font-bold">45</span>
            <span className="px-1 py-0.5 bg-red-600 text-white font-bold">55</span>
            <span className="px-1.5 py-0.5 bg-purple-600 text-white font-bold rounded-r">65+</span>
          </div>
        </div>
      </div>

      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
