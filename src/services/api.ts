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
    }>('/api/v1/radar')
};
