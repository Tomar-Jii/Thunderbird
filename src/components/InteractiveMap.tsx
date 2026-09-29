import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  MapPin, 
  Zap, 
  Radio, 
  CloudRain, 
  Compass, 
  Maximize2,
  Wind
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
  { id: 'bhopal', name: 'Bhopal', lat: 23.2599, lon: 77.4126, risk: 'SEVERE' as RiskLevel, dbz: 54 },
  { id: 'indore', name: 'Indore', lat: 22.7196, lon: 75.8577, risk: 'HIGH' as RiskLevel, dbz: 48 },
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

  // Layer visibility toggles
  const [showRadar, setShowRadar] = useState(true);
  const [showSatellite, setShowSatellite] = useState(true);
  const [showLightning, setShowLightning] = useState(true);
  const [showStormCells, setShowStormCells] = useState(true);
  const [showRiskFootprint, setShowRiskFootprint] = useState(true);

  const horizonOptions = [0, 15, 30, 60, 90, 120];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Madhya Pradesh, India
    const map = L.map(mapContainerRef.current, {
      center: [23.35, 77.7],
      zoom: 7,
      minZoom: 5,
      maxZoom: 12,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Dark Matter Basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update dynamic layers when horizon or data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Advection displacement calculation based on forecast horizon
    // e.g. at 35 km/h heading 55 deg: displacement in lat/lon
    const hours = selectedHorizonMinutes / 60;
    const speedKmH = 36;
    const headingRad = (55 * Math.PI) / 180;
    // 1 deg lat ≈ 111 km, 1 deg lon ≈ 102 km in central India
    const dLat = (hours * speedKmH * Math.cos(headingRad)) / 111;
    const dLon = (hours * speedKmH * Math.sin(headingRad)) / 102;

    // 1. Radar Reflectivity Layer (Doppler Radars at Bhopal, Indore, Nagpur)
    if (showRadar) {
      const radars = [
        { lat: 23.287, lon: 77.345, name: 'DWR Bhopal (S-Band)' },
        { lat: 22.722, lon: 75.801, name: 'DWR Indore (C-Band)' },
        { lat: 21.152, lon: 79.062, name: 'DWR Nagpur (S-Band)' }
      ];

      radars.forEach((r) => {
        // Range ring 150km and 250km
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

        // Radar site icon
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
    if (showSatellite) {
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

    // 3. Convective Storm Cells Polygons & Centroids
    if (showStormCells) {
      stormCells.forEach((cell) => {
        // Shift coordinates based on forecast horizon
        const shiftedPolygon: [number, number][] = cell.polygonCoordinates.map(([lat, lon]) => [
          lat + dLat,
          lon + dLon
        ]);
        const shiftedCentroid: [number, number] = [
          cell.centroid[0] + dLat,
          cell.centroid[1] + dLon
        ];

        let strokeColor = '#22c55e';
        let fillColor = '#22c55e';
        if (cell.severity === 'SEVERE') {
          strokeColor = '#f43f5e';
          fillColor = '#e11d48';
        } else if (cell.severity === 'HIGH') {
          strokeColor = '#f97316';
          fillColor = '#ea580c';
        } else if (cell.severity === 'MODERATE') {
          strokeColor = '#eab308';
          fillColor = '#ca8a04';
        }

        // Polygon perimeter
        L.polygon(shiftedPolygon, {
          color: strokeColor,
          weight: 2,
          dashArray: selectedHorizonMinutes > 0 ? '5, 5' : undefined,
          fillColor: fillColor,
          fillOpacity: 0.35
        })
          .bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.5;">
              <div style="font-weight: 700; color: ${strokeColor}; margin-bottom: 4px;">${cell.name}</div>
              <div style="color: #94a3b8; font-family: monospace;">T+${selectedHorizonMinutes}m Position</div>
              <hr style="border: 0; border-top: 1px solid #334155; margin: 6px 0;">
              <div>Reflectivity: <b>${cell.maxReflectivityDbz} dBZ</b></div>
              <div>Echo Top: <b>${cell.echoTopKm} km</b></div>
              <div>Lightning Rate: <b>${cell.lightningRateStrikesPerMin} flashes/min</b></div>
              <div>Motion: <b>${cell.motionHeadingDeg}° @ ${cell.motionSpeedKmh} km/h</b></div>
              <div>Trend: <b style="color: #38bdf8;">${cell.trend}</b></div>
            </div>
          `)
          .addTo(group);

        // Centroid marker with motion vector
        const centroidIcon = L.divIcon({
          className: 'storm-centroid-icon',
          html: `
            <div style="background-color: ${strokeColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${strokeColor};"></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        L.marker(shiftedCentroid, { icon: centroidIcon }).addTo(group);

        // Motion vector leader line
        const vectorEndLat = shiftedCentroid[0] + 0.28 * Math.cos(headingRad);
        const vectorEndLon = shiftedCentroid[1] + 0.28 * Math.sin(headingRad);

        L.polyline([shiftedCentroid, [vectorEndLat, vectorEndLon]], {
          color: '#38bdf8',
          weight: 2,
          opacity: 0.7,
          dashArray: '3, 4'
        }).addTo(group);
      });
    }

    // 4. Lightning Strikes (Total Lightning: CG & IC)
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
        iconSize: [80, 24],
        iconAnchor: [40, 12]
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
    showRadar, 
    showSatellite, 
    showLightning, 
    showStormCells, 
    onSelectLocation
  ]);

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden flex flex-col h-[520px] shadow-2xl">
      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Layer Visibility Toggles */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs shadow-lg">
          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              showRadar ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Doppler Weather Radar 250km reflectivity sweeps"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radar dBZ</span>
          </button>

          <button
            onClick={() => setShowSatellite(!showSatellite)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              showSatellite ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle INSAT-3DR Thermal IR Cloud Top Temperatures"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Satellite IR</span>
          </button>

          <button
            onClick={() => setShowLightning(!showLightning)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              showLightning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Real-Time IITM/IMD Lightning Discharges"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Lightning</span>
          </button>

          <button
            onClick={() => setShowStormCells(!showStormCells)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              showStormCells ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Convective Cell Centroids and Motion Vectors"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Cells</span>
          </button>
        </div>
      </div>

      {/* Forecast Horizon Timeline Scrubber */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-2xl">
          <span className="text-[11px] font-mono text-slate-400 px-2 font-semibold flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>HORIZON:</span>
          </span>
          {horizonOptions.map((min) => {
            const isSelected = selectedHorizonMinutes === min;
            return (
              <button
                key={min}
                onClick={() => onSelectHorizon(min)}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg transition-all ${
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

        {/* Risk Legend */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 shadow-2xl">
          <span className="text-slate-400">RISK:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>LOW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span>MOD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>HIGH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>SEVERE</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
