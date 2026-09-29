/**
 * StormSight AI - Meteorological Domain Type Definitions
 * SIH26072: AIML based Nowcasting of thunderstorm and lightning
 */

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export type AlertSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'SEVERE';

export type DataSourceStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export type SystemMode = 'LIVE' | 'DEMO' | 'SIMULATION';

export interface GeoLocation {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
}

export interface AtmosphericObservations {
  locationId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  temperatureC: number;
  humidityPct: number;
  pressureHpa: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windDirectionCompass: string;
  capeJkg: number;          // Convective Available Potential Energy (J/kg)
  cinJkg: number;           // Convective Inhibition (J/kg)
  precipitationMmPerHour: number;
  radarReflectivityDbz: number; // Doppler Radar dBZ
  satelliteCloudIndex: number;  // 0-100 or Cloud Top Brightness Temp
  cloudTopTempC: number;
  lightningDensityPerKm2: number;
  lightningTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  stormMotionHeadingDeg: number;
  stormMotionSpeedKmh: number;
  dataSourceMode: SystemMode;
}

export interface StormCell {
  id: string;
  name: string;
  centroid: [number, number]; // [lat, lon]
  polygonCoordinates: [number, number][]; // outer boundary
  maxReflectivityDbz: number;
  echoTopKm: number;
  verticalIntegratedLiquidKgM2: number;
  motionHeadingDeg: number;
  motionSpeedKmh: number;
  severity: RiskLevel;
  lightningRateStrikesPerMin: number;
  trend: 'INTENSIFYING' | 'STEADY' | 'WEAKENING';
}

export interface LightningStrike {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  peakCurrentKa: number;
  type: 'CG' | 'IC'; // Cloud-to-Ground or Intra-Cloud
  ageSeconds: number; // seconds ago
}

export interface ForecastHorizonPoint {
  minutesAhead: number; // 0, 15, 30, 45, 60, 90, 120
  timestamp: string;
  stormProbabilityPct: number;
  lightningProbabilityPct: number;
  confidencePct: number;
  riskLevel: RiskLevel;
  expectedReflectivityDbz: number;
  expectedLightningStrikes: number;
}

export interface ExplainabilityFactor {
  factor: string;
  importancePct: number;
  observationValue: string;
  contribution: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  description: string;
}

export interface LocationNowcastForecast {
  locationId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  issuedAt: string;
  dataSourceMode: SystemMode;
  currentRisk: RiskLevel;
  stormProbabilityPct: number;
  lightningProbabilityPct: number;
  confidencePct: number;
  leadTimeMinutes: number;
  horizons: ForecastHorizonPoint[];
  atmosphericSounding: AtmosphericObservations;
  explainability: {
    primaryDrivers: ExplainabilityFactor[];
    meteorologicalReasoning: string;
  };
}

export interface AlertNotification {
  id: string;
  locationId: string;
  locationName: string;
  severity: AlertSeverity;
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

export interface DataSourceHealthInfo {
  id: string;
  name: string;
  sensorType: 'RADAR' | 'SATELLITE' | 'LIGHTNING' | 'ATMOSPHERIC' | 'NWP' | 'SURFACE_AWS';
  provider: string;
  status: DataSourceStatus;
  lastUpdate: string;
  latencySeconds: number;
  coveragePct: number;
  dataFreshnessText: string;
  stationsActive: number;
  totalStations: number;
}

export interface VerificationMetrics {
  evaluationPeriod: string;
  datasetType: string;
  sampleSize: number;
  disclaimer: string;
  accuracyPct: number;
  precisionPct: number;
  recallPct: number;
  f1Score: number;
  brierScore: number;
  rocAuc: number;
  criticalSuccessIndexCsi: number;
  probabilityOfDetectionPod: number;
  falseAlarmRatioFar: number;
  leadTimeAverages: {
    horizonMinutes: number;
    csi: number;
    pod: number;
    far: number;
  }[];
}

export interface ModelHealthStatus {
  activeModelName: string;
  modelVersion: string;
  architecture: string;
  status: 'OPTIMAL' | 'DEGRADED' | 'STANDBY';
  mode: SystemMode;
  lastInferenceTimestamp: string;
  averageInferenceLatencyMs: number;
  p95LatencyMs: number;
  fallbackAvailable: boolean;
  totalInferencesToday: number;
  confidenceDistribution: {
    bracket: string;
    count: number;
    percentage: number;
  }[];
}

export interface ReplayEvent {
  id: string;
  title: string;
  region: string;
  date: string;
  durationMinutes: number;
  description: string;
  maxReflectivityDbz: number;
  maxStrikesPerMinute: number;
  groundTruthVerified: boolean;
  timelineFrames: {
    offsetMinutes: number;
    label: string;
    stormProbability: number;
    lightningStrikes: number;
    maxDbz: number;
    risk: RiskLevel;
  }[];
}

export interface NowcastRunResult {
  runId: string;
  timestamp: string;
  executionDurationMs: number;
  mode: SystemMode;
  stagesCompleted: string[];
  cellsDetected: number;
  lightningDischargesCount: number;
  activeAlertsGenerated: number;
  locationsEvaluated: number;
  summary: string;
}
