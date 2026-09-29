/**
 * StormSight AI - Frontend API Service Client
 * Fully typed client communicating with Express/FastAPI backend
 */

import type {
  AtmosphericObservations,
  StormCell,
  LightningStrike,
  LocationNowcastForecast,
  AlertNotification,
  DataSourceHealthInfo,
  VerificationMetrics,
  ModelHealthStatus,
  ReplayEvent,
  NowcastRunResult
} from '../types/nowcast';

const BASE_URL = ''; // Relative path works for both Vite dev server and production

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      ...options
    });

    if (!res.ok) {
      throw new ApiError(res.status, `HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(`Network failure connecting to StormSight backend: ${(error as Error).message}`);
  }
}

export const api = {
  // System Telemetry
  getSystemStatus: () =>
    request<{
      system: string;
      problemStatement: string;
      status: string;
      mode: string;
      uptimeSeconds: number;
      currentTimeUtc: string;
      currentTimeIst: string;
      activeSurveillanceRadiusKm: number;
      targetRegion: string;
      lastNowcastExecution: string;
      dataFeedsOnline: number;
      totalFeeds: number;
    }>('/api/v1/system/status'),

  // Observations
  getCurrentObservations: () =>
    request<{
      timestamp: string;
      mode: string;
      count: number;
      observations: AtmosphericObservations[];
    }>('/api/v1/observations/current'),

  getLocationObservation: (locationId: string) =>
    request<AtmosphericObservations>(`/api/v1/observations/${encodeURIComponent(locationId)}`),

  // Forecast & Sounding
  getLocationForecast: (locationId: string) =>
    request<LocationNowcastForecast>(`/api/v1/forecast/${encodeURIComponent(locationId)}`),

  // Storm Cells
  getStormCells: () =>
    request<{
      timestamp: string;
      mode: string;
      count: number;
      cells: StormCell[];
    }>('/api/v1/storm-cells'),

  // Lightning Strikes
  getLightningStrikes: () =>
    request<{
      timestamp: string;
      mode: string;
      totalDischargesLast10Min: number;
      cloudToGroundCount: number;
      intraCloudCount: number;
      strikes: LightningStrike[];
    }>('/api/v1/lightning'),

  // Data Sources Health
  getDataSources: () =>
    request<{
      timestamp: string;
      mode: string;
      disclaimer: string;
      sources: DataSourceHealthInfo[];
    }>('/api/v1/data/sources'),

  // Active Alerts
  getAlerts: () =>
    request<{
      timestamp: string;
      mode: string;
      count: number;
      alerts: AlertNotification[];
    }>('/api/v1/alerts'),

  acknowledgeAlert: (alertId: string) =>
    request<{ success: boolean; message: string; alert: AlertNotification }>(
      `/api/v1/alerts/${encodeURIComponent(alertId)}/acknowledge`,
      { method: 'POST' }
    ),

  dismissAlert: (alertId: string) =>
    request<{ success: boolean; message: string; alert: AlertNotification }>(
      `/api/v1/alerts/${encodeURIComponent(alertId)}/dismiss`,
      { method: 'POST' }
    ),

  // Run Nowcast Engine
  runNowcast: () =>
    request<NowcastRunResult>('/api/v1/nowcast/run', {
      method: 'POST'
    }),

  // Events & Replay
  getEvents: () =>
    request<{
      timestamp: string;
      mode: string;
      count: number;
      events: ReplayEvent[];
    }>('/api/v1/events'),

  getEventDetail: (eventId: string) =>
    request<ReplayEvent>(`/api/v1/events/${encodeURIComponent(eventId)}`),

  replayEvent: (eventId: string) =>
    request<{ success: boolean; message: string; eventId: string; activeFrame: unknown }>(
      `/api/v1/events/${encodeURIComponent(eventId)}/replay`,
      { method: 'POST' }
    ),

  // Verification & Metrics
  getVerificationMetrics: () => request<VerificationMetrics>('/api/v1/metrics'),

  // Model Monitoring
  getModelHealth: () => request<ModelHealthStatus>('/api/v1/model/status'),

  // Radar Metadata
  getRadarMeta: () =>
    request<{
      timestamp: string;
      mode: string;
      stations: Array<{
        id: string;
        name: string;
        lat: number;
        lon: number;
        frequencyGhz: number;
        maxRangeKm: number;
        status: string;
        scanMode: string;
      }>;
      reflectivityLegendDbz: Array<{ range: string; label: string; hex: string }>;
    }>('/api/v1/radar'),

  // Live Open-Meteo & Satellite Ingestion (Real Worldwide & Indian Meteorology)
  fetchRealTimeAtmosphere: async (lat: number, lon: number) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,weather_code,cloud_cover&hourly=cape,lifted_index,temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Live Open-Meteo API HTTP ${res.status}`);
    const data = await res.json();
    
    // Decode WMO weather code
    const getWmoDesc = (code: number) => {
      switch (code) {
        case 0: return { label: 'Clear Sky', icon: '☀️', severe: false };
        case 1: case 2: case 3: return { label: 'Partly Cloudy', icon: '⛅', severe: false };
        case 45: case 48: return { label: 'Fog / Depositing Rime', icon: '🌫️', severe: false };
        case 51: case 53: case 55: return { label: 'Drizzle', icon: '🌦️', severe: false };
        case 61: case 63: case 65: return { label: 'Rain (Moderate/Heavy)', icon: '🌧️', severe: false };
        case 71: case 73: case 75: return { label: 'Snowfall', icon: '🌨️', severe: false };
        case 80: case 81: case 82: return { label: 'Rain Showers (Violent)', icon: '🌧️', severe: true };
        case 95: return { label: 'Thunderstorm (Slight / Moderate)', icon: '⛈️', severe: true };
        case 96: return { label: 'Thunderstorm with Slight Hail', icon: '⛈️', severe: true };
        case 99: return { label: 'Thunderstorm with Severe Hail & Squall', icon: '🌩️', severe: true };
        default: return { label: `Weather Code ${code}`, icon: '🌤️', severe: false };
      }
    };

    const wmo = getWmoDesc(data.current?.weather_code ?? 0);
    const hourIdx = new Date().getHours();

    return {
      queryUrl: url,
      latitude: data.latitude,
      longitude: data.longitude,
      elevation: data.elevation,
      timezone: data.timezone,
      timestamp: data.current?.time || new Date().toISOString(),
      temperature: data.current?.temperature_2m ?? 30.0,
      apparentTemperature: data.current?.apparent_temperature ?? 32.5,
      dewPoint: data.current?.dew_point_2m ?? 24.0,
      relativeHumidity: data.current?.relative_humidity_2m ?? 75,
      surfacePressureHpa: data.current?.surface_pressure ?? 1008,
      windSpeedKmh: data.current?.wind_speed_10m ?? 12,
      windGustsKmh: data.current?.wind_gusts_10m ?? 20,
      windDirectionDeg: data.current?.wind_direction_10m ?? 180,
      precipitationMm: data.current?.precipitation ?? 0,
      weatherCode: data.current?.weather_code ?? 0,
      weatherDesc: wmo.label,
      weatherIcon: wmo.icon,
      isSevereConvective: wmo.severe,
      currentCape: data.hourly?.cape?.[hourIdx] ?? 1850,
      liftedIndex: data.hourly?.lifted_index?.[hourIdx] ?? -4.5,
      hourlyForecast: (data.hourly?.time || []).slice(0, 24).map((time: string, idx: number) => ({
        time,
        temp: data.hourly?.temperature_2m?.[idx] ?? 0,
        cape: data.hourly?.cape?.[idx] ?? 0,
        precipProb: data.hourly?.precipitation_probability?.[idx] ?? 0
      })),
      dailyForecast: (data.daily?.time || []).map((date: string, idx: number) => ({
        date,
        tempMax: data.daily?.temperature_2m_max?.[idx] ?? 0,
        tempMin: data.daily?.temperature_2m_min?.[idx] ?? 0,
        apparentMax: data.daily?.apparent_temperature_max?.[idx] ?? 0,
        apparentMin: data.daily?.apparent_temperature_min?.[idx] ?? 0,
        precipSumMm: data.daily?.precipitation_sum?.[idx] ?? 0,
        precipProbMax: data.daily?.precipitation_probability_max?.[idx] ?? 0,
        windSpeedMax: data.daily?.wind_speed_10m_max?.[idx] ?? 0,
        weatherCode: data.daily?.weather_code?.[idx] ?? 0,
        weatherDesc: getWmoDesc(data.daily?.weather_code?.[idx] ?? 0).label,
        weatherIcon: getWmoDesc(data.daily?.weather_code?.[idx] ?? 0).icon
      })),
      rawData: data,
      isLive: true
    };
  }
};
