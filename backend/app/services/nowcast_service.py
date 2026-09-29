from typing import Dict, Any, List
from datetime import datetime, timedelta
import math
from app.ml.models import DemoNowcastModel
from app.ml.feature_engineering import FeaturePipeline
from app.alerts.alert_engine import AlertEngine

LOCATIONS = {
    'bhopal': {'id': 'bhopal', 'name': 'Bhopal Central', 'lat': 23.2599, 'lon': 77.4126, 'cape': 2850, 'dbz': 54, 'wind': 48, 'hum': 87},
    'indore': {'id': 'indore', 'name': 'Indore Metro', 'lat': 22.7196, 'lon': 75.8577, 'cape': 2350, 'dbz': 48, 'wind': 36, 'hum': 79},
    'jabalpur': {'id': 'jabalpur', 'name': 'Jabalpur East', 'lat': 23.1815, 'lon': 79.9864, 'cape': 2100, 'dbz': 38, 'wind': 28, 'hum': 76},
    'gwalior': {'id': 'gwalior', 'name': 'Gwalior North', 'lat': 26.2183, 'lon': 78.1828, 'cape': 1450, 'dbz': 24, 'wind': 22, 'hum': 64},
    'ujjain': {'id': 'ujjain', 'name': 'Ujjain Division', 'lat': 23.1765, 'lon': 75.7885, 'cape': 2400, 'dbz': 45, 'wind': 34, 'hum': 81},
    'sagar': {'id': 'sagar', 'name': 'Sagar Bundelkhand', 'lat': 23.8388, 'lon': 78.7378, 'cape': 1800, 'dbz': 34, 'wind': 25, 'hum': 72},
    'narmadapuram': {'id': 'narmadapuram', 'name': 'Narmadapuram Valley', 'lat': 22.7519, 'lon': 77.7289, 'cape': 2500, 'dbz': 46, 'wind': 32, 'hum': 82}
}

class NowcastService:
    def __init__(self):
        self.model = DemoNowcastModel()

    def get_location_observation(self, location_key: str, time_offset_min: int = 0) -> Dict[str, Any]:
        key = location_key.lower()
        loc = LOCATIONS.get(key, LOCATIONS['bhopal'])

        features = {
            'cape': loc['cape'],
            'cin': 34,
            'radar_reflectivity': loc['dbz'],
            'humidity': loc['hum'],
            'lightning_density': 4.8 if loc['dbz'] >= 45 else 1.2,
            'time_offset_min': time_offset_min
        }

        prediction = self.model.predict(features)

        return {
            'locationId': loc['id'],
            'locationName': loc['name'],
            'latitude': loc['lat'],
            'longitude': loc['lon'],
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'temperatureC': 29.4 - (4.0 if loc['dbz'] > 40 else 0.0),
            'humidityPct': loc['hum'],
            'pressureHpa': 1004.2 - (loc['cape'] / 1000) * 1.8,
            'windSpeedKmh': loc['wind'],
            'windDirectionDeg': 245,
            'windDirectionCompass': 'WSW',
            'capeJkg': loc['cape'],
            'cinJkg': 34,
            'precipitationMmPerHour': 38.0 if loc['dbz'] > 45 else 14.0 if loc['dbz'] > 35 else 2.0,
            'radarReflectivityDbz': loc['dbz'],
            'satelliteCloudIndex': 88,
            'cloudTopTempC': -58.4,
            'lightningDensityPerKm2': 4.8 if loc['dbz'] >= 45 else 1.2,
            'lightningTrend': 'INCREASING' if loc['dbz'] >= 45 else 'STABLE',
            'stormMotionHeadingDeg': 55,
            'stormMotionSpeedKmh': 36,
            'dataSourceMode': 'DEMO',
            'stormProbabilityPct': prediction['storm_probability'],
            'lightningProbabilityPct': prediction['lightning_probability'],
            'confidencePct': prediction['confidence'],
            'riskLevel': prediction['risk_level']
        }

    def get_location_forecast(self, location_key: str) -> Dict[str, Any]:
        current_obs = self.get_location_observation(location_key, 0)
        horizon_steps = [0, 15, 30, 45, 60, 90, 120]

        horizons = []
        now = datetime.utcnow()
        for m in horizon_steps:
            obs = self.get_location_observation(location_key, m)
            horizons.append({
                'minutesAhead': m,
                'timestamp': (now + timedelta(minutes=m)).isoformat() + 'Z',
                'stormProbabilityPct': obs['stormProbabilityPct'],
                'lightningProbabilityPct': obs['lightningProbabilityPct'],
                'confidencePct': obs['confidencePct'],
                'riskLevel': obs['riskLevel'],
                'expectedReflectivityDbz': int(obs['radarReflectivityDbz'] * (1.05 if m <= 45 else 0.85)),
                'expectedLightningStrikes': int(obs['lightningProbabilityPct'] * 0.7)
            })

        is_high = current_obs['stormProbabilityPct'] >= 70

        explainability = {
            'primaryDrivers': [
                {
                    'factor': 'Atmospheric Instability (CAPE)',
                    'importancePct': 88 if is_high else 45,
                    'observationValue': f"{current_obs['capeJkg']} J/kg",
                    'contribution': 'POSITIVE' if is_high else 'NEUTRAL',
                    'description': 'Elevated buoyancy energy fueling rapid updraft acceleration within the mid-troposphere.'
                },
                {
                    'factor': 'Doppler Radar Reflectivity Core',
                    'importancePct': 82 if is_high else 38,
                    'observationValue': f"{current_obs['radarReflectivityDbz']} dBZ",
                    'contribution': 'POSITIVE' if is_high else 'NEUTRAL',
                    'description': 'High-density hydrometeor core indicating active grapple and supercooled liquid collision zone.'
                },
                {
                    'factor': 'Total Lightning Jump Trend',
                    'importancePct': 85 if is_high else 30,
                    'observationValue': current_obs['lightningTrend'],
                    'contribution': 'POSITIVE' if is_high else 'NEUTRAL',
                    'description': 'Rapid surge in intra-cloud discharge precursor preceding cloud-to-ground flash rate amplification.'
                },
                {
                    'factor': 'Satellite Cloud-Top Rapid Cooling',
                    'importancePct': 74,
                    'observationValue': f"{current_obs['cloudTopTempC']} °C",
                    'contribution': 'POSITIVE',
                    'description': 'Vigorous vertical cloud growth punching through the tropopause equilibrium level.'
                },
                {
                    'factor': 'Low-Level Boundary Moisture Convergence',
                    'importancePct': 69,
                    'observationValue': f"{current_obs['humidityPct']}% RH",
                    'contribution': 'POSITIVE',
                    'description': 'Sustained moisture flux feeding convective updraft roots.'
                },
                {
                    'factor': 'Deep Tropospheric Bulk Wind Shear',
                    'importancePct': 61,
                    'observationValue': f"{current_obs['windSpeedKmh']} km/h WSW",
                    'contribution': 'POSITIVE',
                    'description': 'Organized shear tilting storm updrafts, enabling sustained multi-cell propagation.'
                }
            ],
            'meteorologicalReasoning': (
                f"High-risk convective signature: Rapid intra-cloud lightning surge coincided with Doppler radar reflectivity "
                f"exceeding 50 dBZ. Thermodynamic sounding exhibits high CAPE ({current_obs['capeJkg']} J/kg) with minimal convective "
                f"inhibition ({current_obs['cinJkg']} J/kg), driving vigorous multi-cell storm regeneration moving northeast at 36 km/h."
                if is_high else
                "Moderate convective risk: Atmospheric moisture and moderate thermodynamic buoyancy are present, but capping inversion partially retards explosive updraft breakout."
            )
        }

        return {
            'locationId': current_obs['locationId'],
            'locationName': current_obs['locationName'],
            'latitude': current_obs['latitude'],
            'longitude': current_obs['longitude'],
            'issuedAt': now.isoformat() + 'Z',
            'dataSourceMode': 'DEMO',
            'currentRisk': current_obs['riskLevel'],
            'stormProbabilityPct': current_obs['stormProbabilityPct'],
            'lightningProbabilityPct': current_obs['lightningProbabilityPct'],
            'confidencePct': current_obs['confidencePct'],
            'leadTimeMinutes': 120,
            'horizons': horizons,
            'atmosphericSounding': current_obs,
            'explainability': explainability
        }

nowcast_service = NowcastService()
