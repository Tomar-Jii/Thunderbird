import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { KpiMetrics } from './components/KpiMetrics';
import { InteractiveMap } from './components/InteractiveMap';
import { LocationInspector } from './components/LocationInspector';
import { ForecastEvolutionChart } from './components/ForecastEvolutionChart';
import { ExplainableAiPanel } from './components/ExplainableAiPanel';
import { AlertCenter } from './components/AlertCenter';
import { DataSourceHealth } from './components/DataSourceHealth';
import { MultiSourceFusion } from './components/MultiSourceFusion';
import { EventReplay } from './components/EventReplay';
import { VerificationDashboard } from './components/VerificationDashboard';
import { GuidedDemoModal } from './components/GuidedDemoModal';
import { ApiDocsModal } from './components/ApiDocsModal';
import { SevereWeatherToastStack } from './components/SevereWeatherToastStack';
import { weatherWebSocket, type LiveSevereAlert } from './services/weatherWebSocket';
import { api } from './services/api';
import type { 
  LocationNowcastForecast, 
  StormCell, 
  LightningStrike, 
  AlertNotification, 
  DataSourceHealthInfo, 
  VerificationMetrics, 
  ModelHealthStatus,
  ReplayEvent 
} from './types/nowcast';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw, 
  Wifi, 
  Radio, 
  Wind, 
  CloudRain, 
  Sparkles 
} from 'lucide-react';
import { SoundingProfile } from './components/SoundingProfile';
import { TacticalAviationGrid } from './components/TacticalAviationGrid';
import { ClimateTrends } from './components/ClimateTrends';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('bhopal');
  const [selectedHorizonMinutes, setSelectedHorizonMinutes] = useState<number>(0);

  // Data states
  const [forecast, setForecast] = useState<LocationNowcastForecast | null>(null);
  const [stormCells, setStormCells] = useState<StormCell[]>([]);
  const [lightningStrikes, setLightningStrikes] = useState<LightningStrike[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceHealthInfo[]>([]);
  const [metrics, setMetrics] = useState<VerificationMetrics | null>(null);
  const [modelHealth, setModelHealth] = useState<ModelHealthStatus | null>(null);
  const [events, setEvents] = useState<ReplayEvent[]>([]);

  // WebSocket Live Stream States
  const [wsAlerts, setWsAlerts] = useState<LiveSevereAlert[]>([]);
  const [wsStatus, setWsStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('CONNECTING');

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunningNowcast, setIsRunningNowcast] = useState<boolean>(false);
  const [nowcastNotification, setNowcastNotification] = useState<string | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState<boolean>(false);

  // Fetch forecast for selected location
  const loadForecast = useCallback(async (locId: string) => {
    try {
      const data = await api.getLocationForecast(locId);
      setForecast(data);
    } catch (err) {
      console.error('Error fetching location forecast:', err);
    }
  }, []);

  // Fetch initial telemetry and layers
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        forecastData,
        cellsData,
        lightningData,
        alertsData,
        sourcesData,
        metricsData,
        modelData,
        eventsData
      ] = await Promise.all([
        api.getLocationForecast(selectedLocationId),
        api.getStormCells(),
        api.getLightningStrikes(),
        api.getAlerts(),
        api.getDataSources(),
        api.getVerificationMetrics(),
        api.getModelHealth(),
        api.getEvents()
      ]);

      setForecast(forecastData);
      setStormCells(cellsData.cells);
      setLightningStrikes(lightningData.strikes);
      setAlerts(alertsData.alerts);
      setDataSources(sourcesData.sources);
      setMetrics(metricsData);
      setModelHealth(modelData);
      setEvents(eventsData.events);
    } catch (err) {
      console.error('Failed to load StormSight data:', err);
      setError('Unable to reach backend nowcast engine. Please ensure the dev server is active.');
    } finally {
      setLoading(false);
    }
  }, [selectedLocationId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Update forecast when location changes
  useEffect(() => {
    loadForecast(selectedLocationId);
  }, [selectedLocationId, loadForecast]);

  // Real-Time WebSocket Weather Listener Setup
  useEffect(() => {
    weatherWebSocket.connect();

    const unsubAlert = weatherWebSocket.onAlert((newAlert) => {
      // 1. Push to active toast stack (keep maximum 3 visible at once)
      setWsAlerts(prev => [newAlert, ...prev.slice(0, 2)]);

      // 2. Synchronize with persistent alerts list for Alert Center tab
      const persistentAlert: AlertNotification = {
        id: newAlert.id,
        locationId: newAlert.locationId,
        locationName: newAlert.locationName,
        severity: newAlert.severity === 'SEVERE' ? 'SEVERE' : 'WARNING',
        headline: newAlert.headline,
        riskProbabilityPct: newAlert.type === 'TORNADO' ? 95 : 88,
        confidencePct: 92,
        forecastWindowMinutes: newAlert.expiresInMinutes,
        recommendedAction: newAlert.recommendedAction,
        createdAt: newAlert.timestamp,
        validUntil: new Date(Date.now() + newAlert.expiresInMinutes * 60000).toISOString(),
        acknowledged: false,
        dismissed: false
      };

      setAlerts(prev => [persistentAlert, ...prev]);

      // Auto-dismiss toast from floating stack after 16 seconds
      setTimeout(() => {
        setWsAlerts(prev => prev.filter(a => a.id !== newAlert.id));
      }, 16000);
    });

    const unsubStatus = weatherWebSocket.onStatus((status) => {
      setWsStatus(status);
    });

    return () => {
      unsubAlert();
      unsubStatus();
      weatherWebSocket.disconnect();
    };
  }, []);

  // Run Nowcast Trigger
  const handleRunNowcast = async () => {
    try {
      setIsRunningNowcast(true);
      setNowcastNotification('Ingesting latest multisource observations & running ConvLSTM surrogate...');
      const res = await api.runNowcast();
      await fetchAllData();
      setNowcastNotification(`Nowcast run #${res.runId} completed in ${res.executionDurationMs}ms (${res.summary})`);
      setTimeout(() => setNowcastNotification(null), 4000);
    } catch (err) {
      console.error('Failed to run nowcast cycle:', err);
      setNowcastNotification('Error executing nowcast cycle.');
      setTimeout(() => setNowcastNotification(null), 3000);
    } finally {
      setIsRunningNowcast(false);
    }
  };

  // Toast actions
  const handleDismissToast = (id: string) => {
    setWsAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleAcknowledgeToast = async (id: string) => {
    setWsAlerts(prev => prev.filter(a => a.id !== id));
    await handleAcknowledgeAlert(id);
  };

  const handleViewLocationFromToast = (locId: string) => {
    setSelectedLocationId(locId);
    setSelectedHorizonMinutes(0);
    setActiveTab('dashboard');
  };

  // Alert actions
  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      await api.dismissAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const activeAlertsCount = alerts.filter(a => !a.dismissed).length;
  const sourcesOnlineCount = dataSources.filter(s => s.status === 'ONLINE').length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Floating Real-Time Severe Weather Toast Stack */}
      <SevereWeatherToastStack
        alerts={wsAlerts}
        onDismiss={handleDismissToast}
        onViewLocation={handleViewLocationFromToast}
        onAcknowledge={handleAcknowledgeToast}
      />

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunNowcast={handleRunNowcast}
        isRunningNowcast={isRunningNowcast}
        onStartGuidedDemo={() => setIsDemoModalOpen(true)}
        onOpenDocs={() => setIsDocsModalOpen(true)}
        activeAlertCount={activeAlertsCount}
      />

      {/* Inference Progress Toast */}
      {nowcastNotification && (
        <div className="bg-cyan-950/90 border-b border-cyan-500/50 px-4 py-2 text-xs font-mono text-cyan-200 flex items-center justify-center gap-2 animate-fade-in sticky top-[88px] z-30 backdrop-blur-md">
          <RotateCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>{nowcastNotification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 lg:p-6 space-y-4">
        {/* Real-Time WebSocket Live Stream Bar */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${
                wsStatus === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}></span>
              <Wifi className="w-3 h-3 text-cyan-400" />
              <span className="text-slate-300 font-bold">WEBSOCKET:</span>
              <span className={wsStatus === 'CONNECTED' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {wsStatus === 'CONNECTED' ? 'LIVE OPEN WEATHER STREAM' : wsStatus}
              </span>
            </div>

            <span className="text-slate-400 hidden md:inline text-[11px]">
              Pushing live WMO severe alerts, Tornado Emergency & Flash Flood bulletins
            </span>
          </div>

          {/* Quick Stream Testing Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 hidden sm:inline">TEST STREAM:</span>
            <button
              onClick={() => weatherWebSocket.triggerTestAlert('TORNADO')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
              title="Broadcast a live Tornado Warning alert via WebSocket"
            >
              <Wind className="w-3 h-3 text-rose-400" />
              <span>Simulate Tornado</span>
            </button>

            <button
              onClick={() => weatherWebSocket.triggerTestAlert('FLASH_FLOOD')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
              title="Broadcast a live Flash Flood Emergency alert via WebSocket"
            >
              <CloudRain className="w-3 h-3 text-cyan-400" />
              <span>Simulate Flash Flood</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchAllData}
              className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Top KPI Metrics Bar (Visible across main view) */}
        {forecast && (
          <KpiMetrics
            currentRisk={forecast.currentRisk}
            stormProbabilityPct={forecast.stormProbabilityPct}
            lightningProbabilityPct={forecast.lightningProbabilityPct}
            confidencePct={forecast.confidencePct}
            activeAlertsCount={activeAlertsCount}
            sourcesOnlineCount={sourcesOnlineCount}
            totalSourcesCount={dataSources.length || 6}
            selectedLocationName={forecast.locationName}
          />
        )}

        {/* Tab 1: Main Nowcasting Console */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Left 8 Columns: Interactive Map + Forecast Timeline Chart */}
            <div className="xl:col-span-8 space-y-5">
              <InteractiveMap
                selectedLocationId={selectedLocationId}
                onSelectLocation={(locId) => setSelectedLocationId(locId)}
                selectedHorizonMinutes={selectedHorizonMinutes}
                onSelectHorizon={(min) => setSelectedHorizonMinutes(min)}
                stormCells={stormCells}
                lightningStrikes={lightningStrikes}
                currentRisk={forecast?.currentRisk || 'LOW'}
              />

              {forecast && (
                <ForecastEvolutionChart
                  horizons={forecast.horizons}
                  locationName={forecast.locationName}
                />
              )}
            </div>

            {/* Right 4 Columns: Sounding Telemetry + Explainable AI Panel */}
            <div className="xl:col-span-4 space-y-5">
              <LocationInspector
                forecast={forecast}
                selectedHorizonMinutes={selectedHorizonMinutes}
              />

              {forecast && (
                <ExplainableAiPanel
                  factors={forecast.explainability.primaryDrivers}
                  reasoning={forecast.explainability.meteorologicalReasoning}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab: Climate Trends & Longitudinal Convective Shifts (D3.js) */}
        {activeTab === 'climate' && <ClimateTrends />}

        {/* Tab: Vertical Sounding & 3D Convective Profile */}
        {activeTab === 'sounding' && <SoundingProfile />}

        {/* Tab: Tactical Aviation & Infrastructure Grid Defense */}
        {activeTab === 'tactical' && <TacticalAviationGrid />}

        {/* Tab 2: Alert Center */}
        {activeTab === 'alerts' && (
          <AlertCenter
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onDismiss={handleDismissAlert}
          />
        )}

        {/* Tab 3: Multisource Fusion Pipeline */}
        {activeTab === 'fusion' && <MultiSourceFusion />}

        {/* Tab 4: Event Replay Simulator */}
        {activeTab === 'replay' && <EventReplay events={events} />}

        {/* Tab 5: Meteorological Verification */}
        {activeTab === 'verification' && <VerificationDashboard metrics={metrics} />}

        {/* Tab 6: Sensor & Model Health */}
        {activeTab === 'health' && (
          <DataSourceHealth
            dataSources={dataSources}
            modelHealth={modelHealth}
            onRefresh={fetchAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a12] py-4 px-6 text-xs text-slate-400 font-mono">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-semibold">StormSight AI</span>
            <span>·</span>
            <span>Smart India Hackathon SIH26072</span>
            <span>·</span>
            <span className="text-cyan-400">Ministry of Earth Sciences / IMD</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Notice: Demo prototype using calibrated surrogate models</span>
            <span>·</span>
            <button
              onClick={() => setIsDocsModalOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              API Reference & Deployment
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GuidedDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectLocation={(loc) => setSelectedLocationId(loc)}
        onSelectHorizon={(min) => setSelectedHorizonMinutes(min)}
        onRunNowcast={handleRunNowcast}
        setActiveTab={setActiveTab}
      />

      <ApiDocsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />
    </div>
  );
}
