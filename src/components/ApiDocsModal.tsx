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
  Cpu
} from 'lucide-react';
import { downloadProjectZip } from '../utils/downloadZip';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'realApis' | 'endpoints' | 'deployment'>('realApis');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const realApisList = [
    {
      name: 'ISRO MOSDAC (INSAT-3DR / INSAT-3DS Satellite Feeds)',
      agency: 'Indian Space Research Organisation (ISRO)',
      url: 'https://www.mosdac.gov.in',
      registrationUrl: 'https://www.mosdac.gov.in/user/register',
      authType: 'Free Academic / Research Registration (API Key & FTP credentials provided)',
      formats: 'HDF5, NetCDF-4, GeoTIFF',
      products: [
        'IMG_TIR1 (Thermal Infrared 10.8µm - Cloud Top Temp at 4km)',
        'IMG_WV (Water Vapour 6.8µm - Upper Troposphere Moisture)',
        'HEM (Hydro-Estimator Rainfall Rate mm/h)',
        'CTBT (Cloud Top Brightness Temp Rapid Scan every 15 min)'
      ],
      sampleCode: `# Python code to fetch latest INSAT-3DR HDF5 file from MOSDAC
import ftplib, h5py

ftp = ftplib.FTP('ftp.mosdac.gov.in')
ftp.login('YOUR_MOSDAC_USERNAME', 'YOUR_MOSDAC_PASSWORD')
ftp.cwd('/data/INSAT3DR/L1B/HRRS/')

filename = '3RIMG_29SEP2026_1800_L1B_STD.h5'
with open(filename, 'wb') as f:
    ftp.retrbinary(f'RETR {filename}', f.write)

print("Downloaded INSAT-3DR Rapid Scan frame successfully!")`
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
      ],
      sampleCode: `# Ingest IMD Doppler Radar mosaic or AWS stations
import requests

url = "https://mausam.imd.gov.in/api/radar_data"
# or data.gov.in API endpoint
params = {"api-key": "YOUR_DATA_GOV_IN_API_KEY", "format": "json"}
response = requests.get(url, params=params)
radar_cells = response.json()`
    },
    {
      name: 'Open-Meteo Global Atmospheric Convective API (Live & Zero-Key)',
      agency: 'Open-Meteo & ECMWF / NOAA GFS',
      url: 'https://open-meteo.com',
      registrationUrl: 'https://open-meteo.com/en/docs',
      authType: '100% Free & Open Access (No API Key Required for fair use)',
      formats: 'REST JSON, Protocol Buffers',
      products: [
        'Current Surface Temperature, Dewpoint, Relative Humidity',
        'Hourly CAPE (Convective Available Potential Energy J/kg)',
        'Lifted Index (°C), Surface Pressure (hPa), Wind Gusts (km/h)'
      ],
      sampleCode: `# Live Open-Meteo atmospheric API fetch across any coordinate in India
import requests

url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": 22.57,    # Kolkata
    "longitude": 88.36,
    "current": "temperature_2m,relative_humidity_2m,dew_point_2m,surface_pressure,wind_speed_10m,wind_gusts_10m",
    "hourly": "cape,lifted_index",
    "timezone": "Asia/Kolkata"
}
res = requests.get(url, params=params).json()
print("Real-time Kolkata CAPE:", res['hourly']['cape'][12], "J/kg")`
    },
    {
      name: 'RainViewer Live Doppler Radar Tile API',
      agency: 'RainViewer Worldwide Radar Mosaic',
      url: 'https://www.rainviewer.com/api.html',
      registrationUrl: 'https://www.rainviewer.com/api.html',
      authType: 'Free Public API for radar tiles (No key required for standard tiles)',
      formats: 'XYZ Map Tiles (PNG), GeoJSON past & future nowcast frames',
      products: [
        'Global Composite Doppler Reflectivity (Updated every 10 min)',
        'Past 2 hours radar loop + 30 min optical flow forecast tiles'
      ],
      sampleCode: `# Fetch latest radar tile timestamps
import requests
meta = requests.get('https://api.rainviewer.com/public/weather-maps.json').json()
latest_ts = meta['radar']['past'][-1]['time']
tile_url = f"https://tilecache.rainviewer.com/v2/radar/{latest_ts}/256/{{z}}/{{x}}/{{y}}/2/1_1.png"
print("Live tile URL template:", tile_url)`
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
      ],
      sampleCode: `# Ingest active Indian disaster alerts from Sachet
import requests, xml.etree.ElementTree as ET

sachet_feed = "https://sachet.ndma.gov.in/cap_feed.xml"
res = requests.get(sachet_feed)
root = ET.fromstring(res.content)
for alert in root.findall('.//{urn:oasis:names:tc:emergency:cap:1.2}alert'):
    print("Active Alert:", alert.find('.//{urn:oasis:names:tc:emergency:cap:1.2}headline').text)`
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
                SIH26072 Data Pipelines · Official IMD / ISRO Feeds · REST Documentation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('realApis')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold transition-colors ${
              activeTab === 'realApis'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Official Government & Real APIs</span>
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold transition-colors ${
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
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold transition-colors ${
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
          {/* TAB 1: REAL GOVERNMENT & METEOROLOGICAL APIS */}
          {activeTab === 'realApis' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs text-slate-300 space-y-1 font-mono">
                <span className="text-cyan-300 font-bold block">
                  HOW TO CONNECT REAL DATA FOR SIH26072 OPERATIONAL EVALUATION:
                </span>
                <p className="text-slate-400 font-sans leading-relaxed">
                  StormSight AI is architected with a modular ETL (Extract-Transform-Load) ingestion adapter pattern. 
                  Below are the 5 official, authorized atmospheric and radar feeds used in India with exact registration portals, format specs, and copy-pasteable Python ingestion code.
                </p>
              </div>

              <div className="space-y-4">
                {realApisList.map((api, idx) => (
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

                    {/* Code Snippet Box */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>PYTHON INGESTION SNIPPET:</span>
                        <button
                          onClick={() => handleCopySnippet(api.sampleCode, `snippet-${idx}`)}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {copiedSnippet === `snippet-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSnippet === `snippet-${idx}` ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <div className="bg-[#030610] p-3 rounded-lg border border-slate-800/80 font-mono text-[10px] text-cyan-200 overflow-x-auto">
                        <pre>{api.sampleCode}</pre>
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
