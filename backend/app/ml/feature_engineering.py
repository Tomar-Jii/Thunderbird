from typing import Dict, Any

class FeaturePipeline:
    """Spatiotemporal feature engineering pipeline for multisource convective data."""

    @staticmethod
    def extract_features(raw_obs: Dict[str, Any], horizon_minutes: int = 0) -> Dict[str, Any]:
        """
        Derive thermodynamic, radar, satellite, and lightning features from raw sensor data.
        """
        cape = float(raw_obs.get('capeJkg', 2200))
        cin = float(raw_obs.get('cinJkg', 30))
        dbz = float(raw_obs.get('radarReflectivityDbz', 45))
        humidity = float(raw_obs.get('humidityPct', 80))
        lightning_density = float(raw_obs.get('lightningDensityPerKm2', 3.5))

        # Atmospheric instability index
        buoyancy_ratio = cape / max(1.0, cin)

        return {
            'cape': cape,
            'cin': cin,
            'buoyancy_ratio': buoyancy_ratio,
            'radar_reflectivity': dbz,
            'humidity': humidity,
            'lightning_density': lightning_density,
            'time_offset_min': horizon_minutes
        }
