from pydantic import BaseModel, Field
from typing import List, Optional, Tuple, Literal

RiskLevel = Literal['LOW', 'MODERATE', 'HIGH', 'SEVERE']
AlertSeverity = Literal['INFO', 'WATCH', 'WARNING', 'SEVERE']
SensorType = Literal['RADAR', 'SATELLITE', 'LIGHTNING', 'ATMOSPHERIC', 'NWP', 'SURFACE_AWS']
DataSourceStatus = Literal['ONLINE', 'DEGRADED', 'OFFLINE']

class AtmosphericObservations(BaseModel):
    locationId: str
    locationName: str
    latitude: float
    longitude: float
    timestamp: str
    temperatureC: float
    humidityPct: float
    pressureHpa: float
    windSpeedKmh: float
    windDirectionDeg: float
    windDirectionCompass: str
    capeJkg: int
    cinJkg: int
    precipitationMmPerHour: float
    radarReflectivityDbz: int
    satelliteCloudIndex: int
    cloudTopTempC: float
    lightningDensityPerKm2: float
    lightningTrend: str
    stormMotionHeadingDeg: int
    stormMotionSpeedKmh: int
    dataSourceMode: str
    stormProbabilityPct: int
    lightningProbabilityPct: int
    confidencePct: int
    riskLevel: RiskLevel

class StormCell(BaseModel):
    id: str
    name: str
    centroid: Tuple[float, float]
    polygonCoordinates: List[Tuple[float, float]]
    maxReflectivityDbz: float
    echoTopKm: float
    verticalIntegratedLiquidKgM2: float
    motionHeadingDeg: int
    motionSpeedKmh: int
    severity: RiskLevel
    lightningRateStrikesPerMin: int
    trend: str

class LightningStrike(BaseModel):
    id: str
    latitude: float
    longitude: float
    timestamp: str
    peakCurrentKa: float
    type: Literal['CG', 'IC']
    ageSeconds: int

class ForecastHorizonPoint(BaseModel):
    minutesAhead: int
    timestamp: str
    stormProbabilityPct: int
    lightningProbabilityPct: int
    confidencePct: int
    riskLevel: RiskLevel
    expectedReflectivityDbz: int
    expectedLightningStrikes: int

class ExplainabilityFactor(BaseModel):
    factor: str
    importancePct: int
    observationValue: str
    contribution: str
    description: str

class LocationForecastResponse(BaseModel):
    locationId: str
    locationName: str
    latitude: float
    longitude: float
    issuedAt: str
    dataSourceMode: str
    currentRisk: RiskLevel
    stormProbabilityPct: int
    lightningProbabilityPct: int
    confidencePct: int
    leadTimeMinutes: int
    horizons: List[ForecastHorizonPoint]
    atmosphericSounding: AtmosphericObservations
    explainability: dict

class AlertNotification(BaseModel):
    id: str
    locationId: str
    locationName: str
    severity: AlertSeverity
    headline: str
    riskProbabilityPct: int
    confidencePct: int
    forecastWindowMinutes: int
    recommendedAction: str
    createdAt: str
    validUntil: str
    acknowledged: bool
    dismissed: bool

class DataSourceHealthInfo(BaseModel):
    id: str
    name: str
    sensorType: SensorType
    provider: str
    status: DataSourceStatus
    lastUpdate: str
    latencySeconds: int
    coveragePct: float
    dataFreshnessText: str
    stationsActive: int
    totalStations: int

class VerificationMetrics(BaseModel):
    evaluationPeriod: str
    datasetType: str
    sampleSize: int
    disclaimer: str
    accuracyPct: float
    precisionPct: float
    recallPct: float
    f1Score: float
    brierScore: float
    rocAuc: float
    criticalSuccessIndexCsi: float
    probabilityOfDetectionPod: float
    falseAlarmRatioFar: float
    leadTimeAverages: List[dict]

class ModelHealthStatus(BaseModel):
    activeModelName: str
    modelVersion: str
    architecture: str
    status: str
    mode: str
    lastInferenceTimestamp: str
    averageInferenceLatencyMs: float
    p95LatencyMs: float
    fallbackAvailable: bool
    totalInferencesToday: int
    confidenceDistribution: List[dict]

class NowcastRunResult(BaseModel):
    runId: str
    timestamp: str
    executionDurationMs: int
    mode: str
    stagesCompleted: List[str]
    cellsDetected: int
    lightningDischargesCount: int
    activeAlertsGenerated: int
    locationsEvaluated: int
    summary: str
