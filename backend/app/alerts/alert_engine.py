from typing import List, Dict, Any
from datetime import datetime, timedelta
import uuid

class AlertEngine:
    """Threshold-driven and ML probability alerting engine for SIH26072."""

    @staticmethod
    def evaluate_and_generate_alerts(
        location_id: str, 
        location_name: str, 
        storm_prob: int, 
        lightning_prob: int, 
        confidence: int, 
        radar_dbz: int
    ) -> List[Dict[str, Any]]:
        alerts = []

        if storm_prob >= 75 or radar_dbz >= 50:
            alerts.append({
                "id": f"ALT-{location_id.upper()[:3]}-{uuid.uuid4().hex[:4].upper()}",
                "locationId": location_id,
                "locationName": f"{location_name} Region",
                "severity": "SEVERE",
                "headline": "Severe Convective Thunderstorm & High-Frequency Lightning Warning",
                "riskProbabilityPct": storm_prob,
                "confidencePct": confidence,
                "forecastWindowMinutes": 30,
                "recommendedAction": "Immediate indoor sheltering. Avoid open terrain, metallic poles, and high-voltage transmission lines.",
                "createdAt": datetime.utcnow().isoformat() + "Z",
                "validUntil": (datetime.utcnow() + timedelta(minutes=45)).isoformat() + "Z",
                "acknowledged": False,
                "dismissed": False
            })
        elif storm_prob >= 60 or radar_dbz >= 40:
            alerts.append({
                "id": f"ALT-{location_id.upper()[:3]}-{uuid.uuid4().hex[:4].upper()}",
                "locationId": location_id,
                "locationName": f"{location_name} Sector",
                "severity": "WARNING",
                "headline": "Elevated Convective Influx with Cloud-to-Ground Lightning Risk",
                "riskProbabilityPct": storm_prob,
                "confidencePct": confidence,
                "forecastWindowMinutes": 45,
                "recommendedAction": "Alert airport and highway operations. Cease outdoor power maintenance.",
                "createdAt": datetime.utcnow().isoformat() + "Z",
                "validUntil": (datetime.utcnow() + timedelta(minutes=60)).isoformat() + "Z",
                "acknowledged": False,
                "dismissed": False
            })
        elif storm_prob >= 40:
            alerts.append({
                "id": f"ALT-{location_id.upper()[:3]}-{uuid.uuid4().hex[:4].upper()}",
                "locationId": location_id,
                "locationName": f"{location_name} Basin",
                "severity": "WATCH",
                "headline": "Developing Convective Cells with Updraft Buoyancy",
                "riskProbabilityPct": storm_prob,
                "confidencePct": confidence,
                "forecastWindowMinutes": 60,
                "recommendedAction": "Standard meteorological watch active. Monitor radar sweeps.",
                "createdAt": datetime.utcnow().isoformat() + "Z",
                "validUntil": (datetime.utcnow() + timedelta(minutes=90)).isoformat() + "Z",
                "acknowledged": False,
                "dismissed": False
            })

        return alerts
