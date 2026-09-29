import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  BookOpen, 
  Download, 
  Code, 
  Server, 
  Layers, 
  Copy, 
  Check,
  ExternalLink,
  Globe,
  Radio,
  Satellite,
  ShieldCheck,
  Zap,
  Cpu,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'zeroKey' | 'realApis' | 'endpoints' | 'deployment'>('zeroKey');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  // Zero-Key 100% Free Instant APIs (No verification, no credit card, no wait)
  const zeroKeyApis = [
    {
      name: 'RainViewer Live Composite Doppler Radar Tiles',
      category: 'Doppler Radar Imagery (Real-Time)',
      status: 'Active in StormSight Map',
      endpoint: 'https://api.rainviewer.com/public/weather-maps.json',
      tileFormat: 'https://tilecache.rainviewer.com{path}/256/{z}/{x}/{y}/2/1_1.png',
      auth: '100% Free · No API Key · No Signup Required',
      latency: 'Updated every 10 minutes worldwide & India',
      description: 'Provides real-time composite Doppler radar reflectivity tiles covering India and the entire globe. Returns host and 13 past radar frame paths in JSON format.',
      curlCommand: 'curl -s "https://api.rainviewer.com/public/weather-maps.json"',
      leafletSnippet: `// 1. Fetch live radar timestamps
const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
const data = await res.json();
const latestPath = data.radar.past[data.radar.past.length - 1].path;

// 2. Add Leaflet radar tile layer overlay
L.tileLayer(\`\${data.host}\${latestPath}/256/{z}/{x}/{y}/2/1_1.png\`, {
  opacity: 0.8,
  zIndex: 500
}).addTo(map);`
    },
    {
      name: 'Open-Meteo Global Atmospheric Convective API',
      category: 'Thermodynamics & Forecast (ECMWF / GFS)',
      status: 'Active in StormSight Observatory',
      endpoint: 'https://api.open-meteo.com/v1/forecast?latitude=23.25&longitude=77.41&hourly=cape,lifted_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto',
      tileFormat: 'REST JSON & Protocol Buffers',
      auth: '100% Free · Zero Key · Instant Access',
      latency: 'Sub-100ms response time',
      description: 'Provides hyper-local real-time temperature, dew point, surface pressure, CAPE (Convective Available Potential Energy J/kg), Lifted Index, and 7-day WMO weather codes across any coordinates in India or globally.',
      curlCommand: 'curl -s "https://api.open-meteo.com/v1/forecast?latitude=23.25&longitude=77.41&current=temperature_2m,relative_humidity_2m&hourly=cape"',
      leafletSnippet: `// Fetch real-time live atmosphere across any Indian city
const url = 'https://api.open-meteo.com/v1/forecast?latitude=22.57&longitude=88.36&hourly=cape,lifted_index&daily=weather_code';
const response = await fetch(url);
const liveData = await response.json();
console.log('Live Kolkata CAPE:', liveData.hourly.cape[12], 'J/kg');`
    },
    {
      name: 'Esri World Imagery High-Resolution Satellite Basemap',
      category: 'Satellite Earth Photography (1-Meter Resolution)',
      status: 'Active in Basemap Switcher',
      endpoint: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      tileFormat: 'XYZ Raster Map Tiles',
      auth: 'Free Public Web GIS Tile Service · Zero Key',
      latency: 'Edge cached global CDN',
      description: 'High-resolution true-color satellite imagery covering all Indian terrain, cities, river basins, and mountains. Perfect for overlaying severe radar storm polygons without any API keys or billing.',
      curlCommand: 'curl -I "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/6/28/45"',
      leafletSnippet: `// Add Esri World Satellite Tile Layer in Leaflet
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri World Imagery'
}).addTo(map);`
    },
    {
      name: 'NASA EONET (Earth Observatory Natural Event Tracker)',
      category: 'Natural Hazards & Cyclone/Storm Tracker',
      status: 'Public REST API',
      endpoint: 'https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms',
      tileFormat: 'GeoJSON & REST API',
      auth: '100% Free · No Key · Open NASA Science',
      latency: 'Continuous event detection stream',
      description: 'Provides verified geo-located severe convective storms, tropical cyclones, and atmospheric hazards with bounding coordinates and historical event tracking.',
      curlCommand: 'curl -s "https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms"',
      leafletSnippet: `// Fetch severe storm events from NASA
const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms');
const data = await res.json();
data.events.forEach(event => {
  console.log('NASA Storm:', event.title, event.geometry[0].coordinates);
});`
    },
    {
      name: 'OpenSky Network Aviation ADS-B Flights API',
      category: 'Real-Time Air Traffic Radar',
      status: 'Public REST API',
      endpoint: 'https://opensky-network.org/api/states/all?lamin=8&lomin=68&lamax=37&lomax=97',
      tileFormat: 'JSON State Vectors',
      auth: 'Free Anonymous Access · No Key Required',
      latency: '10-second ADS-B transponder updates',
      description: 'Tracks commercial aircraft positions, altitudes, and speeds over Indian airspace in real-time. Ideal for our Tactical Aviation Wind Shear & Microburst diversion module.',
      curlCommand: 'curl -s "https://opensky-network.org/api/states/all?lamin=8&lomin=68&lamax=37&lomax=97"',
      leafletSnippet: `// Fetch live aircraft over Indian airspace
const res = await fetch('https://opensky-network.org/api/states/all?lamin=8&lomin=68&lamax=37&lomax=97');
const data = await res.json();
// data.states array contains [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, ...]
console.log('Aircraft in Indian Airspace:', data.states.length);`
    },
    {
      name: 'OpenStreetMap Standard & CartoDB Dark Matter',
      category: 'Dark Tactical Basemaps',
      status: 'Active in StormSight Console',
      endpoint: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      tileFormat: 'XYZ Web Mercator Tiles',
      auth: '100% Free · Open Data Commons',
      latency: 'Sub-50ms CDN caching',
      description: 'Dark tactical operational basemap optimized for high-contrast Doppler radar reflectivity overlays and lightning strike animations.',
      curlCommand: 'curl -I "https://a.basemaps.cartocdn.com/dark_all/7/91/56.png"',
      leafletSnippet: `L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);`
    }
  ];

  // Government APIs (Requires verification/ID for long-term production)
  const realApisList = [
    {
      name: 'ISRO MOSDAC (INSAT-3DR / INSAT-3DS Satellite Feeds)',
      agency: 'Indian Space Research Organisation (ISRO)',
      url: 'https://www.mosdac.gov.in',
      registrationUrl: 'https://www.mosdac.gov.in/user/register',
      authType: 'Academic / Research Registration (API Key & FTP credentials provided)',
      formats: 'HDF5, NetCDF-4, GeoTIFF',
      products: [
        'IMG_TIR1 (Thermal Infrared 10.8µm - Cloud Top Temp at 4km)',
        'IMG_WV (Water Vapour 6.8µm - Upper Troposphere Moisture)',
        'HEM (Hydro-Estimator Rainfall Rate mm/h)',
        'CTBT (Cloud Top Brightness Temp Rapid Scan every 15 min)'
      ]
    },
    {
      name: 'IMD Open Data & Mausam Radar Network',
      agency: 'India Meteorological Department (Ministry of Earth Sciences)',
      url: 'https://mausam.imd.gov.in',
      registrationUrl: 'https://data.gov.in/ministrydepartment/india-meteorological-department-imd',
      authType: 'Open Data Govt of India (data.gov.in API Key)',
      formats: 'NetCDF, UF (Universal Format), HDF5, WMS Tiles',
      products: [
        'DWR Doppler Max dBZ (Kolkata, Delhi, Mumbai, Chennai, Patna, Agartala)',
        'Radial Velocity & Spectrum Width (Turbulence / Wind Shear)',
        'AWS (Automatic Weather Stations) Hourly Temperature, Dewpoint, Surface Pressure'
      ]
    },
    {
      name: 'NDMA Sachet Common Alerting Protocol (CAP 1.2)',
      agency: 'National Disaster Management Authority (NDMA)',
      url: 'https://sachet.ndma.gov.in',
      registrationUrl: 'https://sachet.ndma.gov.in',
      authType: 'Institutional / State Disaster Management Authority (SDMA) Integration',
      formats: 'CAP 1.2 XML, GeoRSS, JSON',
      products: [
        'Official Severe Thunderstorm, Lightning & Cyclone Bulletins',
        'Geo-fenced SMS & Telecom Tower Cell Broadcast'
      ]
    }
  ];

  const endpoints = [
    { method: 'GET', path: '/health', desc: 'System health check and version metadata', example: 'curl -X GET http://localhost:3000/health' },
    { method: 'GET', path: '/api/v1/system/status', desc: 'Real-time telemetry, clocks and operating mode', example: 'curl -X GET http://localhost:3000/api/v1/system/status' },
    { method: 'GET', path: '/api/v1/data/sources', desc: 'Status, latency, and coverage of 6 observation feeds', example: 'curl -X GET http://localhost:3000/api/v1/data/sources' },
    { method: 'GET', path: '/api/v1/observations/current', desc: 'Current atmospheric observations across all MP stations', example: 'curl -X GET http://localhost:3000/api/v1/observations/current' },
    { method: 'GET', path: '/api/v1/observations/{location}', desc: 'Atmospheric sounding profile for a specific station (bhopal, indore, etc.)', example: 'curl -X GET http://localhost:3000/api/v1/observations/bhopal' },
    { method: 'GET', path: '/api/v1/storm-cells', desc: 'Detected convective storm centroids, dBZ, echo tops, and motion vectors', example: 'curl -X GET http://localhost:3000/api/v1/storm-cells' },
    { method: 'GET', path: '/api/v1/lightning', desc: 'Real-time Cloud-to-Ground & Intra-Cloud lightning discharges with age decay', example: 'curl -X GET http://localhost:3000/api/v1/lightning' },
    { method: 'GET', path: '/api/v1/forecast/{location}', desc: '0–120m nowcast horizons, probabilities, and XAI feature attributions', example: 'curl -X GET http://localhost:3000/api/v1/forecast/bhopal' },
    { method: 'POST', path: '/api/v1/nowcast/run', desc: 'Trigger on-demand multi-source atmospheric nowcast cycle', example: 'curl -X POST http://localhost:3000/api/v1/nowcast/run' },
    { method: 'GET', path: '/api/v1/alerts', desc: 'Active convective thunderstorm & lightning warnings', example: 'curl -X GET http://localhost:3000/api/v1/alerts' },
    { method: 'POST', path: '/api/v1/alerts/{id}/acknowledge', desc: 'Acknowledge reception of a critical warning', example: 'curl -X POST http://localhost:3000/api/v1/alerts/ALT-MP-2601/acknowledge' },
    { method: 'GET', path: '/api/v1/events', desc: 'Ground-truth verified historical storm outbreak events', example: 'curl -X GET http://localhost:3000/api/v1/events' },
    { method: 'GET', path: '/api/v1/metrics', desc: 'Forecast verification scores (CSI, POD, FAR, Brier, ROC-AUC)', example: 'curl -X GET http://localhost:3000/api/v1/metrics' },
    { method: 'GET', path: '/api/v1/model/status', desc: 'ML pipeline monitoring, inference latency, and surrogate health', example: 'curl -X GET http://localhost:3000/api/v1/model/status' }
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#090e1a] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
                Real Meteorological APIs & Architecture Directory
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                SIH26072 Data Pipelines · 100% Free Zero-Key APIs · Official IMD / ISRO Feeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('zeroKey')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold transition-colors shrink-0 ${
              activeTab === 'zeroKey'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Key Instant Free APIs (No Verification)</span>
          </button>

          <button
            onClick={() => setActiveTab('realApis')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold transition-colors shrink-0 ${
              activeTab === 'realApis'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Official Government Feeds (IMD / ISRO)</span>
          </button>

          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold transition-colors shrink-0 ${
              activeTab === 'endpoints'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>StormSight REST Endpoints (14)</span>
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold transition-colors shrink-0 ${
              activeTab === 'deployment'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Docker & Deployment Guide</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 0: ZERO-KEY INSTANT FREE APIS */}
          {activeTab === 'zeroKey' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-slate-300 space-y-2 font-mono">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>NO VERIFICATION · NO API KEY · NO GOVERNMENT WAIT TIME REQUIRED!</span>
                </div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Government portals (like MOSDAC or data.gov.in) manual employee verification mangte hain jisme 3–7 din lag jaate hain. Hackathons aur real projects ke liye duniya bhar ke atmospheric scientists yeh **100% Free, Zero-Key Open APIs** use karte hain jo bina kisi account ke turant kaam karte hain:
                </p>
              </div>

              <div className="space-y-4">
                {zeroKeyApis.map((api, idx) => (
                  <div key={api.name} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {api.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            {api.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{api.category}</span>
                      </div>

                      <a
                        href={api.endpoint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-mono transition-colors self-start sm:self-auto"
                      >
                        <span>Test Live Endpoint</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {api.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">AUTHENTICATION:</span>
                        <span className="text-emerald-400 font-bold">{api.auth}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block">DATA UPDATE CYCLE:</span>
                        <span className="text-cyan-300">{api.latency}</span>
                      </div>
                    </div>

                    {/* Copyable Code Snippet */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>LEAFLET / JAVASCRIPT INTEGRATION SNIPPET:</span>
                        <button
                          onClick={() => handleCopySnippet(api.leafletSnippet, `zk-${idx}`)}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          {copiedSnippet === `zk-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSnippet === `zk-${idx}` ? 'Copied Snippet' : 'Copy Snippet'}</span>
                        </button>
                      </div>
                      <div className="bg-[#030610] p-3 rounded-lg border border-slate-800/80 font-mono text-[10px] text-cyan-200 overflow-x-auto leading-relaxed">
                        <pre>{api.leafletSnippet}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: REAL GOVERNMENT & METEOROLOGICAL APIS */}
          {activeTab === 'realApis' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs text-slate-300 space-y-1 font-mono">
                <span className="text-cyan-300 font-bold block">
                  HOW TO CONNECT OFFICIAL INDIAN GOVERNMENT FEEDS (POST-HACKATHON DEPLOYMENT):
                </span>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Agar aap final rounds ya ministry implementation ke liye official IMD/ISRO credentials use karna chahte hain, toh in portals par registration form submit karna hota hai (ISRO aur IMD research teams credentials email par provide karti hain).
                </p>
              </div>

              <div className="space-y-4">
                {realApisList.map((api) => (
                  <div key={api.name} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Satellite className="w-4 h-4 text-cyan-400" />
                          <span>{api.name}</span>
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">{api.agency}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <a
                          href={api.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={api.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 transition-colors"
                        >
                          <span>API Signup</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">AUTHENTICATION & ACCESS:</span>
                        <span className="text-slate-200">{api.authType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">DATA FORMATS:</span>
                        <span className="text-amber-400 font-bold">{api.formats}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">KEY ATMOSPHERIC PRODUCTS EXTRACTED:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {api.products.map((p, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: REST ENDPOINTS */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white font-mono uppercase mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>StormSight Production REST Endpoints</span>
              </h4>

              <div className="space-y-2 font-mono text-xs">
                {endpoints.map((ep, idx) => (
                  <div
                    key={ep.path}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ep.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="font-bold text-slate-200">{ep.path}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        {ep.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(ep.example, idx)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
                        title="Copy curl command"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'curl'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCKER & DEPLOYMENT GUIDE */}
          {activeTab === 'deployment' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  CONTAINER & RUNTIME SPECIFICATIONS
                </span>
                <pre className="text-slate-300 leading-relaxed overflow-x-auto whitespace-pre bg-[#040711] p-3 rounded-lg border border-slate-800">
{`# 1. Full-Stack Single-Container Launch (Production Mode on Port 3000)
docker build -t stormsight-ai:latest .
docker run -d --name stormsight-app -p 3000:3000 stormsight-ai:latest

# 2. Multi-Container Orchestration (React Frontend + FastAPI Backend + Redis)
docker-compose up -d --build

# 3. Healthcheck Endpoint
curl http://localhost:3000/health
# Output: {"status":"healthy","version":"1.4.2","sih_problem":"SIH26072"}`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  RECOMMENDED PRODUCTION HARDWARE SPECIFICATIONS
                </span>
                <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                  <li><strong className="text-slate-200">GPU Inference:</strong> 1x NVIDIA T4 (16GB) or A10G (TensorRT ConvLSTM inference &lt; 180ms)</li>
                  <li><strong className="text-slate-200">CPU / RAM:</strong> 8 vCPUs, 32GB RAM (For DWR polar-to-Cartesian coordinate interpolation)</li>
                  <li><strong className="text-slate-200">Storage / Caching:</strong> 256GB NVMe SSD (Rolling 72-hour HDF5 satellite archive)</li>
                  <li><strong className="text-slate-200">Edge Radar Deployment:</strong> Can run on Jetson AGX Orin at radar tower site</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <span>Target Platform: Vercel (Web) & Render/Docker (Backend)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
