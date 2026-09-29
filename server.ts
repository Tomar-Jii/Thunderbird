import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// CORS & Security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Primary Central India / MP Locations
const LOCATIONS: Record<string, { id: string; name: string; state: string; lat: number; lon: number; elevation: number }> = {
  bhopal: { id: 'bhopal', name: 'Bhopal Central', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, elevation: 527 },
  indore: { id: 'indore', name: 'Indore Metro', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, elevation: 553 },
  jabalpur: { id: 'jabalpur', name: 'Jabalpur East', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864, elevation: 411 },
  gwalior: { id: 'gwalior', name: 'Gwalior North', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828, elevation: 197 },
  ujjain: { id: 'ujjain', name: 'Ujjain Division', state: 'Madhya Pradesh', lat: 23.1765, lon: 75.7885, elevation: 494 },
  sagar: { id: 'sagar', name: 'Sagar Bundelkhand', state: 'Madhya Pradesh', lat: 23.8388, lon: 78.7378, elevation: 538 },
  narmadapuram: { id: 'narmadapuram', name: 'Narmadapuram Valley', state: 'Madhya Pradesh', lat: 22.7519, lon: 77.7289, elevation: 285 },
  nagpur: { id: 'nagpur', name: 'Nagpur Border Radar Area', state: 'Maharashtra / MP Border', lat: 21.1458, lon: 79.0882, elevation: 310 }
};

// In-memory simulation state
let nowcastRunCounter = 104;
let lastNowcastRunTime = new Date().toISOString();
let simulatedOffsetMinutes = 0; // used during event replays

interface AlertItem {
  id: string;
  locationId: string;
  locationName: string;
  severity: 'INFO' | 'WATCH' | 'WARNING' | 'SEVERE';
  headline: string;
  riskProbabilityPct: number;
  confidencePct: number;
  forecastWindowMinutes: number;
  recommendedAction: string;
  createdAt: string;
  validUntil: string;
  acknowledged: boolean;
  dismissed: boolean;
}

let activeAlerts: AlertItem[] = [
  {
    id: 'ALT-MP-2601',
    locationId: 'bhopal',
    locationName: 'Bhopal & Raisen District',
    severity: 'SEVERE',
    headline: 'Severe Thunderstorm & High-Frequency Lightning Warning',
    riskProbabilityPct: 86,
    confidencePct: 89,
    forecastWindowMinutes: 30,
    recommendedAction: 'Immediate shelter indoors. Cease open-field farming and ground operations. Stand clear of metallic towers.',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    validUntil: new Date(Date.now() + 52 * 60000).toISOString(),
    acknowledged: false,
    dismissed: false
  },
  {
    id: 'ALT-MP-2602',
    locationId: 'indore',
    locationName: 'Indore & Dewas Sector',
    severity: 'WARNING',
    headline: 'Convective Cell Influx with Cloud-to-Ground Lightning',
    riskProbabilityPct: 74,
    confidencePct: 84,
    forecastWindowMinutes: 45,
    recommendedAction: 'Prepare airport diversion contingencies. Alert rural disaster management cells.',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    validUntil: new Date(Date.now() + 65 * 60000).toISOString(),
    acknowledged: false,
    dismissed: false
  },
  {
    id: 'ALT-MP-2603',
    locationId: 'jabalpur',
    locationName: 'Jabalpur & Narmada Basin',
    severity: 'WATCH',
    headline: 'Developing Cumulonimbus Tower with Elevated CAPE (>2600 J/kg)',
    riskProbabilityPct: 58,
    confidencePct: 78,
    forecastWindowMinutes: 60,
    recommendedAction: 'Monitor radar reflectivity updates. Restrict high-altitude line maintenance.',
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    validUntil: new Date(Date.now() + 80 * 60000).toISOString(),
    acknowledged: true,
    dismissed: false
  },
  {
    id: 'ALT-MP-2604',
    locationId: 'gwalior',
    locationName: 'Gwalior Chambal Belt',
    severity: 'INFO',
    headline: 'Pre-convective Boundary Layer Moisture Convergence',
    riskProbabilityPct: 32,
    confidencePct: 75,
    forecastWindowMinutes: 90,
    recommendedAction: 'Advisory watch only. Standard AWS telemetry surveillance active.',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    validUntil: new Date(Date.now() + 110 * 60000).toISOString(),
    acknowledged: true,
    dismissed: false
  }
];

// Helper to compute deterministic simulated parameters
function getDeterministicLocationMetrics(locKey: string, timeOffsetMin = 0) {
  const loc = LOCATIONS[locKey] || LOCATIONS.bhopal;
  const t = (Date.now() / 100000 + timeOffsetMin * 0.1) % 100;
  
  // Base parameters per location
  let baseCape = 2450;
  let baseDbz = 46;
  let baseStormProb = 82;
  let baseLightningProb = 79;
  let baseWind = 42;
  let baseHumid = 84;

  if (locKey === 'bhopal') {
    baseCape = 2850 + Math.sin(t) * 120;
    baseDbz = 52 + Math.cos(t) * 4;
    baseStormProb = 86;
    baseLightningProb = 84;
    baseWind = 48;
    baseHumid = 87;
  } else if (locKey === 'indore') {
    baseCape = 2300 + Math.cos(t) * 150;
    baseDbz = 45 + Math.sin(t) * 3;
    baseStormProb = 72;
    baseLightningProb = 68;
    baseWind = 36;
    baseHumid = 79;
  } else if (locKey === 'jabalpur') {
    baseCape = 2150;
    baseDbz = 38;
    baseStormProb = 56;
    baseLightningProb = 52;
    baseWind = 28;
    baseHumid = 76;
  } else if (locKey === 'gwalior') {
    baseCape = 1450;
    baseDbz = 24;
    baseStormProb = 31;
    baseLightningProb = 26;
    baseWind = 22;
    baseHumid = 64;
  } else if (locKey === 'ujjain') {
    baseCape = 2400;
    baseDbz = 44;
    baseStormProb = 69;
    baseLightningProb = 65;
    baseWind = 34;
    baseHumid = 81;
  } else {
    baseCape = 1800;
    baseDbz = 32;
    baseStormProb = 45;
    baseLightningProb = 40;
    baseWind = 25;
    baseHumid = 72;
  }

  // Lead time adjustment (as lead time increases, confidence slightly drops and storm probability evolves)
  const decayFactor = Math.cos((timeOffsetMin / 120) * Math.PI);
  const adjustedProb = Math.min(96, Math.max(10, Math.round(baseStormProb + (timeOffsetMin > 0 ? (timeOffsetMin <= 45 ? 6 : -18) : 0))));
  const adjustedLightning = Math.min(94, Math.max(5, Math.round(baseLightningProb + (timeOffsetMin > 0 ? (timeOffsetMin <= 30 ? 8 : -22) : 0))));
  const adjustedConfidence = Math.max(62, Math.round(92 - timeOffsetMin * 0.18));

  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
  if (adjustedProb >= 80 || baseDbz >= 50) riskLevel = 'SEVERE';
  else if (adjustedProb >= 65 || baseDbz >= 40) riskLevel = 'HIGH';
  else if (adjustedProb >= 40 || baseDbz >= 28) riskLevel = 'MODERATE';

  return {
    locationId: loc.id,
    locationName: loc.name,
    latitude: loc.lat,
    longitude: loc.lon,
    timestamp: new Date().toISOString(),
    temperatureC: 29.4 - (baseDbz > 40 ? 4.2 : 0),
    humidityPct: baseHumid,
    pressureHpa: 1004.2 - (baseCape / 1000) * 1.8,
    windSpeedKmh: baseWind,
    windDirectionDeg: 245,
    windDirectionCompass: 'WSW',
    capeJkg: Math.round(baseCape),
    cinJkg: 34,
    precipitationMmPerHour: Math.round(baseDbz > 45 ? 38 : baseDbz > 35 ? 18 : 3),
    radarReflectivityDbz: Math.round(baseDbz),
    satelliteCloudIndex: 88,
    cloudTopTempC: -58.4,
    lightningDensityPerKm2: baseLightningProb > 70 ? 4.8 : 1.2,
    lightningTrend: baseLightningProb > 70 ? 'INCREASING' : 'STABLE' as const,
    stormMotionHeadingDeg: 55,
    stormMotionSpeedKmh: 36,
    dataSourceMode: 'DEMO' as const,
    stormProbabilityPct: adjustedProb,
    lightningProbabilityPct: adjustedLightning,
    confidencePct: adjustedConfidence,
    riskLevel
  };
}

// 1. Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'StormSight AI Nowcast Engine',
    version: '1.4.2',
    timestamp: new Date().toISOString(),
    backendFramework: 'Node/Express (Dual Mode: Python/FastAPI Ready)',
    mode: 'DEMO / SIMULATION (SIH26072)',
    organization: 'Ministry of Earth Sciences / India Meteorological Department'
  });
});

// 2. System Status
app.get('/api/v1/system/status', (req: Request, res: Response) => {
  res.json({
    system: 'STORMSIGHT AI',
    problemStatement: 'SIH26072',
    status: 'SYSTEM ONLINE',
    mode: 'DEMO',
    uptimeSeconds: 84920,
    currentTimeUtc: new Date().toISOString(),
    currentTimeIst: new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().replace('Z', '+05:30'),
    activeSurveillanceRadiusKm: 350,
    targetRegion: 'Central India (Madhya Pradesh & Surrounds)',
    lastNowcastExecution: lastNowcastRunTime,
    dataFeedsOnline: 6,
    totalFeeds: 6
  });
});

// 3. Data Sources Health
app.get('/api/v1/data/sources', (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    mode: 'DEMO',
    disclaimer: 'Data source metrics simulated for SIH26072 demonstration. Architecture compatible with real IMD DWR & INSAT-3D APIs.',
    sources: [
      {
        id: 'DWR-CENTRAL',
        name: 'Doppler Weather Radar Network',
        sensorType: 'RADAR',
        provider: 'IMD S-Band & C-Band Network (Bhopal, Indore, Nagpur)',
        status: 'ONLINE',
        lastUpdate: new Date(Date.now() - 45000).toISOString(),
        latencySeconds: 45,
        coveragePct: 98.4,
        dataFreshnessText: '45s ago (Sweep cycle 10 min)',
        stationsActive: 3,
        totalStations: 3
      },
      {
        id: 'INSAT-3DR',
        name: 'INSAT-3DR / 3D Multispectral Imager',
        sensorType: 'SATELLITE',
        provider: 'ISRO / IMD Satellite Division (TIR-1, TIR-2, WV channels)',
        status: 'ONLINE',
        lastUpdate: new Date(Date.now() - 120000).toISOString(),
        latencySeconds: 120,
        coveragePct: 99.8,
        dataFreshnessText: '2m ago (Half-hourly rapid scan)',
        stationsActive: 1,
        totalStations: 1
      },
      {
        id: 'LINET-IITM',
        name: 'Total Lightning Detection Network',
        sensorType: 'LIGHTNING',
        provider: 'IITM / IMD Damini Lightning Ground Sensors',
        status: 'ONLINE',
        lastUpdate: new Date(Date.now() - 12000).toISOString(),
        latencySeconds: 12,
        coveragePct: 96.5,
        dataFreshnessText: '12s ago (Real-time discharge pulse)',
        stationsActive: 18,
        totalStations: 19
      },
      {
        id: 'IMD-AWS',
        name: 'Surface Automatic Weather Stations (AWS)',
        sensorType: 'ATMOSPHERIC',
        provider: 'IMD Surface Observatories & State Agromet Network',
        status: 'ONLINE',
        lastUpdate: new Date(Date.now() - 90000).toISOString(),
        latencySeconds: 90,
        coveragePct: 94.2,
        dataFreshnessText: '1.5m ago (15-minute telemetry intervals)',
        stationsActive: 54,
        totalStations: 56
      },
      {
        id: 'NWP-NCMRWF',
        name: 'Convection-Permitting NWP Model (HRRR / UM)',
        sensorType: 'NWP',
        provider: 'NCMRWF / IMD 4km Rapid Refresh Model',
        status: 'ONLINE',
        lastUpdate: new Date(Date.now() - 1800000).toISOString(),
        latencySeconds: 1800,
        coveragePct: 100.0,
        dataFreshnessText: '30m ago (Hourly run cycle assimilation)',
        stationsActive: 1,
        totalStations: 1
      },
      {
        id: 'UPPER-AIR-RS',
        name: 'Radiosonde Sounding & GNSS PWV',
        sensorType: 'ATMOSPHERIC',
        provider: 'IMD Upper Air Atmospheric Profiles',
        status: 'ONLINE',
        lastUpdate: new Date(Date.now() - 3600000).toISOString(),
        latencySeconds: 3600,
        coveragePct: 92.0,
        dataFreshnessText: '1h ago (00/12 UTC sounding interpolation)',
        stationsActive: 4,
        totalStations: 4
      }
    ]
  });
});

// 4. Current Observations
app.get('/api/v1/observations/current', (req: Request, res: Response) => {
  const observations = Object.keys(LOCATIONS).map((key) => {
    const data = getDeterministicLocationMetrics(key, 0);
    return data;
  });

  res.json({
    timestamp: new Date().toISOString(),
    mode: 'DEMO',
    count: observations.length,
    observations
  });
});

// 5. Single Location Observation
app.get('/api/v1/observations/:location', (req: Request, res: Response) => {
  const locKey = (req.params.location || 'bhopal').toLowerCase();
  const data = getDeterministicLocationMetrics(locKey, 0);
  res.json(data);
});

// 6. Storm Cells (Convective polygons and motion vectors)
app.get('/api/v1/storm-cells', (req: Request, res: Response) => {
  // 4 dynamic cells in MP region
  const cells = [
    {
      id: 'SC-01-BHOPAL',
      name: 'Bhopal-Raisen Supercell Cell 01',
      centroid: [23.28, 77.45],
      polygonCoordinates: [
        [23.40, 77.30],
        [23.45, 77.55],
        [23.35, 77.68],
        [23.20, 77.62],
        [23.15, 77.38],
        [23.25, 77.26]
      ],
      maxReflectivityDbz: 54.8,
      echoTopKm: 14.5,
      verticalIntegratedLiquidKgM2: 52.4,
      motionHeadingDeg: 58,
      motionSpeedKmh: 38,
      severity: 'SEVERE' as const,
      lightningRateStrikesPerMin: 68,
      trend: 'INTENSIFYING' as const
    },
    {
      id: 'SC-02-INDORE',
      name: 'Malwa Convective Squall Cell 02',
      centroid: [22.75, 75.92],
      polygonCoordinates: [
        [22.88, 75.76],
        [22.92, 76.05],
        [22.78, 76.12],
        [22.62, 75.98],
        [22.65, 75.80]
      ],
      maxReflectivityDbz: 48.2,
      echoTopKm: 12.8,
      verticalIntegratedLiquidKgM2: 38.6,
      motionHeadingDeg: 65,
      motionSpeedKmh: 34,
      severity: 'HIGH' as const,
      lightningRateStrikesPerMin: 34,
      trend: 'STEADY' as const
    },
    {
      id: 'SC-03-JABALPUR',
      name: 'Narmada Valley Multi-Cell 03',
      centroid: [23.15, 80.05],
      polygonCoordinates: [
        [23.25, 79.92],
        [23.30, 80.18],
        [23.18, 80.24],
        [23.05, 80.08],
        [23.10, 79.95]
      ],
      maxReflectivityDbz: 41.5,
      echoTopKm: 10.9,
      verticalIntegratedLiquidKgM2: 24.8,
      motionHeadingDeg: 45,
      motionSpeedKmh: 30,
      severity: 'MODERATE' as const,
      lightningRateStrikesPerMin: 18,
      trend: 'STEADY' as const
    },
    {
      id: 'SC-04-SATPURA',
      name: 'Satpura Foothills Convective Band 04',
      centroid: [22.25, 77.85],
      polygonCoordinates: [
        [22.38, 77.70],
        [22.42, 78.02],
        [22.28, 78.10],
        [22.15, 77.88]
      ],
      maxReflectivityDbz: 46.1,
      echoTopKm: 11.6,
      verticalIntegratedLiquidKgM2: 32.0,
      motionHeadingDeg: 62,
      motionSpeedKmh: 32,
      severity: 'HIGH' as const,
      lightningRateStrikesPerMin: 29,
      trend: 'INTENSIFYING' as const
    }
  ];

  res.json({
    timestamp: new Date().toISOString(),
    mode: 'DEMO',
    count: cells.length,
    cells
  });
});

// 7. Lightning Strikes (Cloud-to-Ground and Intra-Cloud events with age decay)
app.get('/api/v1/lightning', (req: Request, res: Response) => {
  const now = Date.now();
  const strikes: Array<{
    id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    peakCurrentKa: number;
    type: 'CG' | 'IC';
    ageSeconds: number;
  }> = [];

  // Cluster around Bhopal (Cell 01)
  const bhopalPoints = [
    { dlat: 0.04, dlon: 0.02, ka: -54.2, type: 'CG' as const, age: 14 },
    { dlat: 0.08, dlon: 0.06, ka: 38.6, type: 'IC' as const, age: 32 },
    { dlat: -0.03, dlon: 0.07, ka: -68.4, type: 'CG' as const, age: 48 },
    { dlat: 0.12, dlon: -0.01, ka: 24.1, type: 'IC' as const, age: 72 },
    { dlat: 0.01, dlon: 0.11, ka: -82.9, type: 'CG' as const, age: 95 },
    { dlat: -0.06, dlon: 0.04, ka: 42.0, type: 'IC' as const, age: 120 },
    { dlat: 0.05, dlon: 0.14, ka: -47.3, type: 'CG' as const, age: 145 },
    { dlat: 0.09, dlon: 0.08, ka: -31.8, type: 'CG' as const, age: 180 },
    { dlat: -0.02, dlon: -0.05, ka: 19.5, type: 'IC' as const, age: 240 }
  ];

  bhopalPoints.forEach((p, idx) => {
    strikes.push({
      id: `LTG-BPL-${idx + 1}`,
      latitude: Number((23.28 + p.dlat).toFixed(4)),
      longitude: Number((77.45 + p.dlon).toFixed(4)),
      timestamp: new Date(now - p.age * 1000).toISOString(),
      peakCurrentKa: p.ka,
      type: p.type,
      ageSeconds: p.age
    });
  });

  // Cluster around Indore (Cell 02)
  const indorePoints = [
    { dlat: 0.03, dlon: 0.04, ka: -44.5, type: 'CG' as const, age: 25 },
    { dlat: -0.04, dlon: 0.08, ka: 29.8, type: 'IC' as const, age: 64 },
    { dlat: 0.07, dlon: -0.02, ka: -58.1, type: 'CG' as const, age: 110 },
    { dlat: -0.02, dlon: 0.12, ka: 34.2, type: 'IC' as const, age: 210 }
  ];

  indorePoints.forEach((p, idx) => {
    strikes.push({
      id: `LTG-IDR-${idx + 1}`,
      latitude: Number((22.75 + p.dlat).toFixed(4)),
      longitude: Number((75.92 + p.dlon).toFixed(4)),
      timestamp: new Date(now - p.age * 1000).toISOString(),
      peakCurrentKa: p.ka,
      type: p.type,
      ageSeconds: p.age
    });
  });

  // Cluster around Satpura / Narmada (Cell 03 & 04)
  const eastPoints = [
    { lat: 23.18, lon: 80.08, ka: -39.0, type: 'CG' as const, age: 40 },
    { lat: 23.22, lon: 80.14, ka: 26.5, type: 'IC' as const, age: 135 },
    { lat: 22.28, lon: 77.92, ka: -52.4, type: 'CG' as const, age: 85 },
    { lat: 22.34, lon: 78.01, ka: 31.0, type: 'IC' as const, age: 160 }
  ];

  eastPoints.forEach((p, idx) => {
    strikes.push({
      id: `LTG-EST-${idx + 1}`,
      latitude: p.lat,
      longitude: p.lon,
      timestamp: new Date(now - p.age * 1000).toISOString(),
      peakCurrentKa: p.ka,
      type: p.type,
      ageSeconds: p.age
    });
  });

  res.json({
    timestamp: new Date().toISOString(),
    mode: 'DEMO',
    totalDischargesLast10Min: strikes.length,
    cloudToGroundCount: strikes.filter((s) => s.type === 'CG').length,
    intraCloudCount: strikes.filter((s) => s.type === 'IC').length,
    strikes
  });
});

// 8. Radar Layer Metadata & Polygons
app.get('/api/v1/radar', (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    mode: 'DEMO',
    stations: [
      { id: 'RADAR-BPL', name: 'IMD Bhopal Doppler Weather Radar (DWR)', lat: 23.287, lon: 77.345, frequencyGhz: 2.8, maxRangeKm: 250, status: 'ONLINE', scanMode: 'VCP-21 Convective' },
      { id: 'RADAR-IDR', name: 'IMD Indore Doppler Weather Radar', lat: 22.722, lon: 75.801, frequencyGhz: 5.6, maxRangeKm: 250, status: 'ONLINE', scanMode: 'VCP-21 Convective' },
      { id: 'RADAR-NGP', name: 'IMD Nagpur Doppler Weather Radar', lat: 21.152, lon: 79.062, frequencyGhz: 2.8, maxRangeKm: 250, status: 'ONLINE', scanMode: 'Standard Surveillance' }
    ],
    reflectivityLegendDbz: [
      { range: '15 - 25 dBZ', label: 'Light Rain / Clouds', hex: '#38bdf8' },
      { range: '25 - 35 dBZ', label: 'Moderate Rain', hex: '#22c55e' },
      { range: '35 - 45 dBZ', label: 'Heavy Convection', hex: '#eab308' },
      { range: '45 - 55 dBZ', label: 'Thunderstorm / Hail Risk', hex: '#f97316' },
      { range: '55+ dBZ', label: 'Severe Convection / High Lightning', hex: '#ef4444' }
    ]
  });
});

// 9. Satellite Observation Layer
app.get('/api/v1/satellite', (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    mode: 'DEMO',
    satellite: 'INSAT-3DR',
    channel: 'TIR-1 (10.8 µm) Thermal Infrared',
    resolutionKm: 4.0,
    cloudTopMinimumTempC: -64.2,
    deepConvectionZones: [
      { region: 'Bhopal-Vidisha Corridor', minTempC: -62.5, convectiveCategory: 'Overshooting Cloud Top' },
      { region: 'Nimar-Malwa Convergence', minTempC: -56.8, convectiveCategory: 'Mature Cb Cell' },
      { region: 'Satpura Uplift Ridge', minTempC: -51.2, convectiveCategory: 'Developing Cumulonimbus' }
    ]
  });
});

// 10. Forecast Timeline (0 - 120 mins) for a location
app.get('/api/v1/forecast/:location', (req: Request, res: Response) => {
  const locKey = (req.params.location || 'bhopal').toLowerCase();
  const currentObs = getDeterministicLocationMetrics(locKey, 0);

  const horizonSteps = [0, 15, 30, 45, 60, 90, 120];
  const horizons = horizonSteps.map((min) => {
    const metrics = getDeterministicLocationMetrics(locKey, min);
    return {
      minutesAhead: min,
      timestamp: new Date(Date.now() + min * 60000).toISOString(),
      stormProbabilityPct: metrics.stormProbabilityPct,
      lightningProbabilityPct: metrics.lightningProbabilityPct,
      confidencePct: metrics.confidencePct,
      riskLevel: metrics.riskLevel,
      expectedReflectivityDbz: Math.round(metrics.radarReflectivityDbz * (min <= 45 ? 1.05 : 0.85)),
      expectedLightningStrikes: Math.round(metrics.lightningProbabilityPct * 0.7)
    };
  });

  // Explainable AI factors
  const isHighRisk = currentObs.stormProbabilityPct >= 70;
  const explainability = {
    primaryDrivers: [
      {
        factor: 'Atmospheric Instability (CAPE)',
        importancePct: isHighRisk ? 88 : 45,
        observationValue: `${currentObs.capeJkg} J/kg`,
        contribution: isHighRisk ? ('POSITIVE' as const) : ('NEUTRAL' as const),
        description: 'Elevated buoyancy energy fueling rapid updraft acceleration within the mid-troposphere.'
      },
      {
        factor: 'Doppler Radar Reflectivity Core',
        importancePct: isHighRisk ? 82 : 38,
        observationValue: `${currentObs.radarReflectivityDbz} dBZ`,
        contribution: isHighRisk ? ('POSITIVE' as const) : ('NEUTRAL' as const),
        description: 'High-density hydrometeor core indicating active grapple and supercooled liquid collision zone.'
      },
      {
        factor: 'Total Lightning Jump Trend',
        importancePct: isHighRisk ? 85 : 30,
        observationValue: currentObs.lightningTrend,
        contribution: isHighRisk ? ('POSITIVE' as const) : ('NEUTRAL' as const),
        description: 'Rapid surge in intra-cloud discharge precursor preceding cloud-to-ground flash rate amplification.'
      },
      {
        factor: 'Satellite Cloud-Top Rapid Cooling',
        importancePct: 74,
        observationValue: `${currentObs.cloudTopTempC} °C`,
        contribution: 'POSITIVE' as const,
        description: 'Vigorous vertical cloud growth punching through the tropopause equilibrium level.'
      },
      {
        factor: 'Low-Level Boundary Moisture Convergence',
        importancePct: 69,
        observationValue: `${currentObs.humidityPct}% RH`,
        contribution: 'POSITIVE' as const,
        description: 'Sustained moisture flux feeding convective updraft roots.'
      },
      {
        factor: 'Deep Tropospheric Bulk Wind Shear',
        importancePct: 61,
        observationValue: `${currentObs.windSpeedKmh} km/h WSW`,
        contribution: 'POSITIVE' as const,
        description: 'Organized shear tilting storm updrafts, enabling sustained multi-cell propagation.'
      }
    ],
    meteorologicalReasoning: isHighRisk
      ? `High-risk convective signature: Rapid intra-cloud lightning surge coincided with Doppler radar reflectivity exceeding 50 dBZ. Thermodynamic sounding exhibits high CAPE (${currentObs.capeJkg} J/kg) with minimal convective inhibition (${currentObs.cinJkg} J/kg), driving vigorous multi-cell storm regeneration moving northeast at 36 km/h.`
      : `Moderate convective risk: Atmospheric moisture and moderate thermodynamic buoyancy are present, but capping inversion partially retards explosive updraft breakout. Continued monitoring advised.`
  };

  res.json({
    locationId: currentObs.locationId,
    locationName: currentObs.locationName,
    latitude: currentObs.latitude,
    longitude: currentObs.longitude,
    issuedAt: new Date().toISOString(),
    dataSourceMode: 'DEMO',
    currentRisk: currentObs.riskLevel,
    stormProbabilityPct: currentObs.stormProbabilityPct,
    lightningProbabilityPct: currentObs.lightningProbabilityPct,
    confidencePct: currentObs.confidencePct,
    leadTimeMinutes: 120,
    horizons,
    atmosphericSounding: currentObs,
    explainability
  });
});

// 11. Run Nowcast Execution Engine
app.post('/api/v1/nowcast/run', (req: Request, res: Response) => {
  nowcastRunCounter += 1;
  lastNowcastRunTime = new Date().toISOString();

  // Create a new fresh alert if not exists
  const runId = `RUN-SIH-2026-${nowcastRunCounter}`;
  
  res.json({
    runId,
    timestamp: lastNowcastRunTime,
    executionDurationMs: 42,
    mode: 'DEMO',
    stagesCompleted: [
      'Ingesting DWR Radar sweep polygons & Doppler radial velocities',
      'Harmonizing INSAT-3DR thermal infrared brightness channels',
      'Synthesizing IITM/IMD lightning flash telemetry',
      'Extracting CAPE/CIN/Shear from AWS soundings & NWP 4km grids',
      'Executing LightGBM + ConvLSTM surrogate inference pipeline',
      'Computing 0-120 minute convective trajectory advection',
      'Generating threshold risk alerts & explainability weights'
    ],
    cellsDetected: 4,
    lightningDischargesCount: 17,
    activeAlertsGenerated: activeAlerts.filter(a => !a.dismissed).length,
    locationsEvaluated: Object.keys(LOCATIONS).length,
    summary: 'Nowcast cycle completed successfully. High-risk convective initiation tracked in Bhopal-Raisen sector with 30-min lead time.'
  });
});

// 12. Get Nowcast Run Detail
app.get('/api/v1/nowcast/:run_id', (req: Request, res: Response) => {
  res.json({
    runId: req.params.run_id,
    timestamp: lastNowcastRunTime,
    status: 'COMPLETED',
    mode: 'DEMO',
    activeModel: 'LightGBM-ConvLSTM-Ensemble-v1.4.2',
    regionsCovered: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar']
  });
});

// 13. Alerts Center
app.get('/api/v1/alerts', (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    mode: 'DEMO',
    count: activeAlerts.length,
    alerts: activeAlerts
  });
});

// Favicon handler to prevent 404
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end();
});

// Acknowledge Alert
app.post('/api/v1/alerts/:alert_id/acknowledge', (req: Request, res: Response) => {
  let alert = activeAlerts.find(a => a.id === req.params.alert_id);
  if (!alert) {
    alert = {
      id: req.params.alert_id,
      locationId: 'bhopal',
      locationName: 'Active Sector',
      severity: 'WARNING',
      headline: 'Real-time WebSocket Severe Alert',
      riskProbabilityPct: 85,
      confidencePct: 90,
      forecastWindowMinutes: 30,
      recommendedAction: 'Stay indoors and monitor updates',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 60000).toISOString(),
      acknowledged: true,
      dismissed: false
    };
    activeAlerts.unshift(alert);
  } else {
    alert.acknowledged = true;
  }
  return res.json({ success: true, message: `Alert ${alert.id} acknowledged`, alert });
});

// Dismiss Alert
app.post('/api/v1/alerts/:alert_id/dismiss', (req: Request, res: Response) => {
  let alert = activeAlerts.find(a => a.id === req.params.alert_id);
  if (!alert) {
    alert = {
      id: req.params.alert_id,
      locationId: 'bhopal',
      locationName: 'Active Sector',
      severity: 'INFO',
      headline: 'Dismissed Stream Alert',
      riskProbabilityPct: 50,
      confidencePct: 90,
      forecastWindowMinutes: 0,
      recommendedAction: 'None',
      createdAt: new Date().toISOString(),
      validUntil: new Date().toISOString(),
      acknowledged: true,
      dismissed: true
    };
    activeAlerts.unshift(alert);
  } else {
    alert.dismissed = true;
  }
  return res.json({ success: true, message: `Alert ${alert.id} dismissed`, alert });
});

// 14. Event Replay Datasets
const HISTORICAL_EVENTS = [
  {
    id: 'EVENT-MP-01',
    title: 'Bhopal Severe Supercell Outbreak',
    region: 'Bhopal-Raisen Corridor',
    date: '2026-06-18',
    durationMinutes: 120,
    description: 'Pre-monsoon explosive convective initiation with 62 dBZ core reflectivity and lightning jump of 95 strikes/min.',
    maxReflectivityDbz: 62.4,
    maxStrikesPerMinute: 95,
    groundTruthVerified: true,
    timelineFrames: [
      { offsetMinutes: 0, label: 'T+00m Initiation', stormProbability: 38, lightningStrikes: 6, maxDbz: 36, risk: 'MODERATE' as const },
      { offsetMinutes: 15, label: 'T+15m Rapid Updraft', stormProbability: 64, lightningStrikes: 24, maxDbz: 46, risk: 'HIGH' as const },
      { offsetMinutes: 30, label: 'T+30m Lightning Jump', stormProbability: 88, lightningStrikes: 82, maxDbz: 56, risk: 'SEVERE' as const },
      { offsetMinutes: 45, label: 'T+45m Peak Convection', stormProbability: 94, lightningStrikes: 95, maxDbz: 62, risk: 'SEVERE' as const },
      { offsetMinutes: 60, label: 'T+60m Downdraft Gust', stormProbability: 82, lightningStrikes: 58, maxDbz: 54, risk: 'SEVERE' as const },
      { offsetMinutes: 90, label: 'T+90m Dissipation', stormProbability: 46, lightningStrikes: 18, maxDbz: 40, risk: 'MODERATE' as const },
      { offsetMinutes: 120, label: 'T+120m Cold Pool', stormProbability: 20, lightningStrikes: 4, maxDbz: 26, risk: 'LOW' as const }
    ]
  },
  {
    id: 'EVENT-MP-02',
    title: 'Indore Convective Squall Line',
    region: 'Malwa Plateau',
    date: '2026-07-04',
    durationMinutes: 120,
    description: 'Fast-moving linear convective system with destructive 65 km/h surface wind gusts and intense cloud-to-ground discharges.',
    maxReflectivityDbz: 55.0,
    maxStrikesPerMinute: 62,
    groundTruthVerified: true,
    timelineFrames: [
      { offsetMinutes: 0, label: 'T+00m Pre-frontal convergence', stormProbability: 30, lightningStrikes: 2, maxDbz: 28, risk: 'LOW' as const },
      { offsetMinutes: 30, label: 'T+30m Bow echo formation', stormProbability: 76, lightningStrikes: 35, maxDbz: 49, risk: 'HIGH' as const },
      { offsetMinutes: 60, label: 'T+60m Apex passage', stormProbability: 90, lightningStrikes: 62, maxDbz: 55, risk: 'SEVERE' as const },
      { offsetMinutes: 90, label: 'T+90m Trailing stratiform', stormProbability: 55, lightningStrikes: 14, maxDbz: 38, risk: 'MODERATE' as const },
      { offsetMinutes: 120, label: 'T+120m Passage complete', stormProbability: 18, lightningStrikes: 2, maxDbz: 22, risk: 'LOW' as const }
    ]
  },
  {
    id: 'EVENT-MP-03',
    title: 'Jabalpur Convective Lightning Cluster',
    region: 'Narmada Valley East',
    date: '2026-08-11',
    durationMinutes: 120,
    description: 'Orographic convection along Satpura ridge triggering high density intra-cloud discharges and localized flash inundation.',
    maxReflectivityDbz: 51.5,
    maxStrikesPerMinute: 48,
    groundTruthVerified: true,
    timelineFrames: [
      { offsetMinutes: 0, label: 'T+00m Orographic lift', stormProbability: 25, lightningStrikes: 4, maxDbz: 30, risk: 'LOW' as const },
      { offsetMinutes: 30, label: 'T+30m Cell aggregation', stormProbability: 60, lightningStrikes: 22, maxDbz: 44, risk: 'MODERATE' as const },
      { offsetMinutes: 60, label: 'T+60m Lightning spike', stormProbability: 84, lightningStrikes: 48, maxDbz: 51, risk: 'SEVERE' as const },
      { offsetMinutes: 90, label: 'T+90m Cell merger', stormProbability: 68, lightningStrikes: 26, maxDbz: 42, risk: 'HIGH' as const },
      { offsetMinutes: 120, label: 'T+120m Dissipation', stormProbability: 22, lightningStrikes: 5, maxDbz: 25, risk: 'LOW' as const }
    ]
  }
];

app.get('/api/v1/events', (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    mode: 'DEMO',
    count: HISTORICAL_EVENTS.length,
    events: HISTORICAL_EVENTS
  });
});

app.get('/api/v1/events/:event_id', (req: Request, res: Response) => {
  const ev = HISTORICAL_EVENTS.find(e => e.id === req.params.event_id) || HISTORICAL_EVENTS[0];
  res.json(ev);
});

app.post('/api/v1/events/:event_id/replay', (req: Request, res: Response) => {
  const ev = HISTORICAL_EVENTS.find(e => e.id === req.params.event_id) || HISTORICAL_EVENTS[0];
  res.json({
    success: true,
    message: `Replaying ${ev.title}`,
    eventId: ev.id,
    activeFrame: ev.timelineFrames[2]
  });
});

// 15. Verification Metrics (CSI, POD, FAR, Brier Score, ROC-AUC)
app.get('/api/v1/metrics', (req: Request, res: Response) => {
  res.json({
    evaluationPeriod: 'Monsoon 2025 - Pre-Monsoon 2026 Test Benchmark',
    datasetType: 'Demo Verification Dataset (Simulated Held-out IMD Ground Truth)',
    sampleSize: 14250,
    disclaimer: 'Calculated against held-out simulated benchmark dataset for SIH26072 hackathon evaluation.',
    accuracyPct: 91.4,
    precisionPct: 84.8,
    recallPct: 88.2,
    f1Score: 0.865,
    brierScore: 0.082,
    rocAuc: 0.934,
    criticalSuccessIndexCsi: 0.762,
    probabilityOfDetectionPod: 0.882,
    falseAlarmRatioFar: 0.152,
    leadTimeAverages: [
      { horizonMinutes: 15, csi: 0.84, pod: 0.94, far: 0.09 },
      { horizonMinutes: 30, csi: 0.79, pod: 0.90, far: 0.13 },
      { horizonMinutes: 45, csi: 0.74, pod: 0.86, far: 0.16 },
      { horizonMinutes: 60, csi: 0.69, pod: 0.82, far: 0.20 },
      { horizonMinutes: 90, csi: 0.61, pod: 0.75, far: 0.25 },
      { horizonMinutes: 120, csi: 0.54, pod: 0.68, far: 0.31 }
    ]
  });
});

// 16. Model Status
app.get('/api/v1/model/status', (req: Request, res: Response) => {
  res.json({
    activeModelName: 'StormSight Hybrid Ensemble (LightGBM + ConvLSTM Radar Surrogate)',
    modelVersion: 'v1.4.2-prod-candidate',
    architecture: 'Dual Stream: Spatial Convection Network (Radar+Satellite) + Tabular Atmospheric Gradient Booster',
    status: 'OPTIMAL',
    mode: 'DEMO',
    lastInferenceTimestamp: lastNowcastRunTime,
    averageInferenceLatencyMs: 28.4,
    p95LatencyMs: 44.1,
    fallbackAvailable: true,
    totalInferencesToday: 1842,
    confidenceDistribution: [
      { bracket: '90 - 100%', count: 820, percentage: 44.5 },
      { bracket: '80 - 89%', count: 610, percentage: 33.1 },
      { bracket: '70 - 79%', count: 280, percentage: 15.2 },
      { bracket: '60 - 69%', count: 95, percentage: 5.2 },
      { bracket: '< 60%', count: 37, percentage: 2.0 }
    ]
  });
});

// 17. API Docs endpoint
app.get('/api/v1/docs', (req: Request, res: Response) => {
  res.json({
    title: 'StormSight AI REST API Reference',
    version: '1.4.2',
    problemStatement: 'SIH26072',
    endpoints: [
      { path: '/health', method: 'GET', description: 'System health, version and uptime' },
      { path: '/api/v1/system/status', method: 'GET', description: 'Real-time telemetry and operation mode' },
      { path: '/api/v1/data/sources', method: 'GET', description: 'Multi-source observation status and latency' },
      { path: '/api/v1/observations/current', method: 'GET', description: 'Current atmospheric observations for all regions' },
      { path: '/api/v1/observations/:location', method: 'GET', description: 'Single location atmospheric sounding' },
      { path: '/api/v1/storm-cells', method: 'GET', description: 'Detected convective storm centroids, dBZ, polygons' },
      { path: '/api/v1/lightning', method: 'GET', description: 'Real-time lightning discharge pulses with age decay' },
      { path: '/api/v1/radar', method: 'GET', description: 'Doppler weather radar coverage and reflectivity metadata' },
      { path: '/api/v1/satellite', method: 'GET', description: 'INSAT-3DR satellite cloud top parameters' },
      { path: '/api/v1/forecast/:location', method: 'GET', description: '0-120 min nowcast horizon, probabilities, explainability' },
      { path: '/api/v1/nowcast/run', method: 'POST', description: 'Trigger on-demand multi-source nowcasting cycle' },
      { path: '/api/v1/alerts', method: 'GET', description: 'Active nowcast severe thunderstorm & lightning warnings' },
      { path: '/api/v1/alerts/:alert_id/acknowledge', method: 'POST', description: 'Acknowledge an active warning' },
      { path: '/api/v1/events', method: 'GET', description: 'Historical & demo storm outbreak events' },
      { path: '/api/v1/metrics', method: 'GET', description: 'Meteorological verification metrics (CSI, POD, FAR, Brier)' },
      { path: '/api/v1/model/status', method: 'GET', description: 'ML inference pipeline health and latency benchmarks' },
      { path: '/api/v1/download/archive', method: 'GET', description: 'Download complete GitHub-ready stormsight-ai.zip archive' }
    ]
  });
});

// 18. Download complete project zip
app.get('/api/v1/download/archive', (req: Request, res: Response) => {
  const localZip = path.resolve(__dirname, 'stormsight-ai.zip');
  const rootZip = path.resolve('/stormsight-ai.zip');
  const targetZip = fs.existsSync(localZip) ? localZip : fs.existsSync(rootZip) ? rootZip : null;

  if (!targetZip) {
    return res.status(404).json({ error: 'Archive stormsight-ai.zip not found' });
  }

  res.download(targetZip, 'stormsight-ai.zip', (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Failed to download stormsight-ai.zip' });
    }
  });
});

// Mount Vite in dev or serve static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StormSight AI] Meteorological Nowcast Engine listening on port ${PORT}`);
    console.log(`[StormSight AI] Mode: DEMO / SIMULATION (SIH26072)`);
    console.log(`[StormSight AI] Health endpoint ready at http://0.0.0.0:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('[StormSight AI] Failed to start server:', err);
  process.exit(1);
});
