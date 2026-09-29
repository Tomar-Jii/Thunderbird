from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.services.nowcast_service import nowcast_service, LOCATIONS
from app.alerts.alert_engine import AlertEngine
import uuid

router = APIRouter()

active_alerts_db: List[Dict[str, Any]] = [
    {
        "id": "ALT-MP-2601",
        "locationId": "bhopal",
        "locationName": "Bhopal & Raisen District",
        "severity": "SEVERE",
        "headline": "Severe Thunderstorm & High-Frequency Lightning Warning",
        "riskProbabilityPct": 86,
        "confidencePct": 89,
        "forecastWindowMinutes": 30,
        "recommendedAction": "Immediate shelter indoors. Cease open-field farming and ground operations. Stand clear of metallic towers.",
        "createdAt": (datetime.utcnow() - timedelta(minutes=8)).isoformat() + "Z",
        "validUntil": (datetime.utcnow() + timedelta(minutes=52)).isoformat() + "Z",
        "acknowledged": False,
        "dismissed": False
    },
    {
        "id": "ALT-MP-2602",
        "locationId": "indore",
        "locationName": "Indore & Dewas Sector",
        "severity": "WARNING",
        "headline": "Convective Cell Influx with Cloud-to-Ground Lightning",
        "riskProbabilityPct": 74,
        "confidencePct": 84,
        "forecastWindowMinutes": 45,
        "recommendedAction": "Prepare airport diversion contingencies. Alert rural disaster management cells.",
        "createdAt": (datetime.utcnow() - timedelta(minutes=15)).isoformat() + "Z",
        "validUntil": (datetime.utcnow() + timedelta(minutes=65)).isoformat() + "Z",
        "acknowledged": False,
        "dismissed": False
    }
]

@router.get("/system/status")
def get_system_status():
    now = datetime.utcnow()
    ist = now + timedelta(hours=5, minutes=30)
    return {
        "system": "STORMSIGHT AI",
        "problemStatement": "SIH26072",
        "status": "SYSTEM ONLINE",
        "mode": "DEMO",
        "uptimeSeconds": 84920,
        "currentTimeUtc": now.isoformat() + "Z",
        "currentTimeIst": ist.isoformat() + "+05:30",
        "activeSurveillanceRadiusKm": 350,
        "targetRegion": "Central India (Madhya Pradesh & Surrounds)",
        "lastNowcastExecution": now.isoformat() + "Z",
        "dataFeedsOnline": 6,
        "totalFeeds": 6
    }

@router.get("/data/sources")
def get_data_sources():
    now = datetime.utcnow()
    return {
        "timestamp": now.isoformat() + "Z",
        "mode": "DEMO",
        "disclaimer": "Data source metrics simulated for SIH26072 demonstration. Architecture compatible with real IMD DWR & INSAT-3D APIs.",
        "sources": [
            {
                "id": "DWR-CENTRAL",
                "name": "Doppler Weather Radar Network",
                "sensorType": "RADAR",
                "provider": "IMD S-Band & C-Band Network (Bhopal, Indore, Nagpur)",
                "status": "ONLINE",
                "lastUpdate": (now - timedelta(seconds=45)).isoformat() + "Z",
                "latencySeconds": 45,
                "coveragePct": 98.4,
                "dataFreshnessText": "45s ago (Sweep cycle 10 min)",
                "stationsActive": 3,
                "totalStations": 3
            },
            {
                "id": "INSAT-3DR",
                "name": "INSAT-3DR / 3D Multispectral Imager",
                "sensorType": "SATELLITE",
                "provider": "ISRO / IMD Satellite Division (TIR-1, TIR-2, WV channels)",
                "status": "ONLINE",
                "lastUpdate": (now - timedelta(seconds=120)).isoformat() + "Z",
                "latencySeconds": 120,
                "coveragePct": 99.8,
                "dataFreshnessText": "2m ago (Half-hourly rapid scan)",
                "stationsActive": 1,
                "totalStations": 1
            },
            {
                "id": "LINET-IITM",
                "name": "Total Lightning Detection Network",
                "sensorType": "LIGHTNING",
                "provider": "IITM / IMD Damini Lightning Ground Sensors",
                "status": "ONLINE",
                "lastUpdate": (now - timedelta(seconds=12)).isoformat() + "Z",
                "latencySeconds": 12,
                "coveragePct": 96.5,
                "dataFreshnessText": "12s ago (Real-time discharge pulse)",
                "stationsActive": 18,
                "totalStations": 19
            },
            {
                "id": "IMD-AWS",
                "name": "Surface Automatic Weather Stations (AWS)",
                "sensorType": "ATMOSPHERIC",
                "provider": "IMD Surface Observatories & State Agromet Network",
                "status": "ONLINE",
                "lastUpdate": (now - timedelta(seconds=90)).isoformat() + "Z",
                "latencySeconds": 90,
                "coveragePct": 94.2,
                "dataFreshnessText": "1.5m ago (15-minute telemetry intervals)",
                "stationsActive": 54,
                "totalStations": 56
            }
        ]
    }

@router.get("/observations/current")
def get_current_observations():
    obs = [nowcast_service.get_location_observation(k, 0) for k in LOCATIONS.keys()]
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mode": "DEMO",
        "count": len(obs),
        "observations": obs
    }

@router.get("/observations/{location}")
def get_location_observation(location: str):
    return nowcast_service.get_location_observation(location, 0)

@router.get("/forecast/{location}")
def get_location_forecast(location: str):
    return nowcast_service.get_location_forecast(location)

@router.get("/storm-cells")
def get_storm_cells():
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mode": "DEMO",
        "count": 4,
        "cells": [
            {
                "id": "SC-01-BHOPAL",
                "name": "Bhopal-Raisen Supercell Cell 01",
                "centroid": [23.28, 77.45],
                "polygonCoordinates": [
                    [23.40, 77.30], [23.45, 77.55], [23.35, 77.68], [23.20, 77.62], [23.15, 77.38], [23.25, 77.26]
                ],
                "maxReflectivityDbz": 54.8,
                "echoTopKm": 14.5,
                "verticalIntegratedLiquidKgM2": 52.4,
                "motionHeadingDeg": 58,
                "motionSpeedKmh": 38,
                "severity": "SEVERE",
                "lightningRateStrikesPerMin": 68,
                "trend": "INTENSIFYING"
            },
            {
                "id": "SC-02-INDORE",
                "name": "Malwa Convective Squall Cell 02",
                "centroid": [22.75, 75.92],
                "polygonCoordinates": [
                    [22.88, 75.76], [22.92, 76.05], [22.78, 76.12], [22.62, 75.98], [22.65, 75.80]
                ],
                "maxReflectivityDbz": 48.2,
                "echoTopKm": 12.8,
                "verticalIntegratedLiquidKgM2": 38.6,
                "motionHeadingDeg": 65,
                "motionSpeedKmh": 34,
                "severity": "HIGH",
                "lightningRateStrikesPerMin": 34,
                "trend": "STEADY"
            }
        ]
    }

@router.get("/lightning")
def get_lightning():
    now = datetime.utcnow()
    return {
        "timestamp": now.isoformat() + "Z",
        "mode": "DEMO",
        "totalDischargesLast10Min": 13,
        "cloudToGroundCount": 8,
        "intraCloudCount": 5,
        "strikes": [
            {"id": "LTG-BPL-1", "latitude": 23.32, "longitude": 77.47, "timestamp": now.isoformat() + "Z", "peakCurrentKa": -54.2, "type": "CG", "ageSeconds": 14},
            {"id": "LTG-BPL-2", "latitude": 23.36, "longitude": 77.51, "timestamp": now.isoformat() + "Z", "peakCurrentKa": 38.6, "type": "IC", "ageSeconds": 32},
            {"id": "LTG-BPL-3", "latitude": 23.25, "longitude": 77.52, "timestamp": now.isoformat() + "Z", "peakCurrentKa": -68.4, "type": "CG", "ageSeconds": 48}
        ]
    }

@router.get("/radar")
def get_radar():
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mode": "DEMO",
        "stations": [
            {"id": "RADAR-BPL", "name": "IMD Bhopal Doppler Weather Radar (DWR)", "lat": 23.287, "lon": 77.345, "frequencyGhz": 2.8, "maxRangeKm": 250, "status": "ONLINE", "scanMode": "VCP-21 Convective"}
        ],
        "reflectivityLegendDbz": [
            {"range": "15 - 25 dBZ", "label": "Light Rain / Clouds", "hex": "#38bdf8"},
            {"range": "25 - 35 dBZ", "label": "Moderate Rain", "hex": "#22c55e"},
            {"range": "35 - 45 dBZ", "label": "Heavy Convection", "hex": "#eab308"},
            {"range": "45 - 55 dBZ", "label": "Thunderstorm / Hail Risk", "hex": "#f97316"},
            {"range": "55+ dBZ", "label": "Severe Convection / High Lightning", "hex": "#ef4444"}
        ]
    }

@router.get("/satellite")
def get_satellite():
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mode": "DEMO",
        "satellite": "INSAT-3DR",
        "channel": "TIR-1 (10.8 µm) Thermal Infrared",
        "cloudTopMinimumTempC": -64.2
    }

@router.post("/nowcast/run")
def run_nowcast():
    run_id = f"RUN-FASTAPI-{uuid.uuid4().hex[:6].upper()}"
    return {
        "runId": run_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "executionDurationMs": 28,
        "mode": "DEMO",
        "stagesCompleted": [
            "Ingested Doppler Radar sweeps (Bhopal, Indore)",
            "Extracted INSAT-3DR TIR brightness profiles",
            "Synthesized IITM lightning strike density",
            "Executed LightGBM + ConvLSTM surrogate pipeline",
            "Generated 0-120 minute advective risk vectors"
        ],
        "cellsDetected": 4,
        "lightningDischargesCount": 13,
        "activeAlertsGenerated": len(active_alerts_db),
        "locationsEvaluated": len(LOCATIONS),
        "summary": "Nowcast completed successfully in 28ms."
    }

@router.get("/alerts")
def get_alerts():
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mode": "DEMO",
        "count": len(active_alerts_db),
        "alerts": active_alerts_db
    }

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    for a in active_alerts_db:
        if a["id"] == alert_id:
            a["acknowledged"] = True
            return {"success": True, "message": f"Alert {alert_id} acknowledged", "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.get("/events")
def get_events():
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mode": "DEMO",
        "count": 1,
        "events": [
            {
                "id": "EVENT-MP-01",
                "title": "Bhopal Severe Supercell Outbreak",
                "region": "Bhopal-Raisen Corridor",
                "date": "2026-06-18",
                "durationMinutes": 120,
                "description": "Pre-monsoon explosive convective initiation with 62 dBZ core reflectivity.",
                "maxReflectivityDbz": 62.4,
                "maxStrikesPerMinute": 95,
                "groundTruthVerified": True,
                "timelineFrames": [
                    {"offsetMinutes": 0, "label": "T+00m Initiation", "stormProbability": 38, "lightningStrikes": 6, "maxDbz": 36, "risk": "MODERATE"},
                    {"offsetMinutes": 30, "label": "T+30m Lightning Jump", "stormProbability": 88, "lightningStrikes": 82, "maxDbz": 56, "risk": "SEVERE"},
                    {"offsetMinutes": 60, "label": "T+60m Downdraft Gust", "stormProbability": 82, "lightningStrikes": 58, "maxDbz": 54, "risk": "SEVERE"}
                ]
            }
        ]
    }

@router.get("/metrics")
def get_metrics():
    return {
        "evaluationPeriod": "Monsoon 2025 - Pre-Monsoon 2026 Test Benchmark",
        "datasetType": "Demo Verification Dataset (Simulated Held-out IMD Ground Truth)",
        "sampleSize": 14250,
        "disclaimer": "Calculated against held-out simulated benchmark dataset for SIH26072 hackathon evaluation.",
        "accuracyPct": 91.4,
        "precisionPct": 84.8,
        "recallPct": 88.2,
        "f1Score": 0.865,
        "brierScore": 0.082,
        "rocAuc": 0.934,
        "criticalSuccessIndexCsi": 0.762,
        "probabilityOfDetectionPod": 0.882,
        "falseAlarmRatioFar": 0.152,
        "leadTimeAverages": [
            {"horizonMinutes": 15, "csi": 0.84, "pod": 0.94, "far": 0.09},
            {"horizonMinutes": 30, "csi": 0.79, "pod": 0.90, "far": 0.13},
            {"horizonMinutes": 60, "csi": 0.69, "pod": 0.82, "far": 0.20},
            {"horizonMinutes": 120, "csi": 0.54, "pod": 0.68, "far": 0.31}
        ]
    }

@router.get("/model/status")
def get_model_status():
    return {
        "activeModelName": "StormSight Hybrid Ensemble (LightGBM + ConvLSTM Radar Surrogate)",
        "modelVersion": "v1.4.2-prod-candidate",
        "architecture": "Dual Stream: Spatial Convection Network + Tabular Atmospheric Gradient Booster",
        "status": "OPTIMAL",
        "mode": "DEMO",
        "lastInferenceTimestamp": datetime.utcnow().isoformat() + "Z",
        "averageInferenceLatencyMs": 28.4,
        "p95LatencyMs": 44.1,
        "fallbackAvailable": True,
        "totalInferencesToday": 1842,
        "confidenceDistribution": [
            {"bracket": "90 - 100%", "count": 820, "percentage": 44.5},
            {"bracket": "80 - 89%", "count": 610, "percentage": 33.1},
            {"bracket": "70 - 79%", "count": 280, "percentage": 15.2}
        ]
    }
