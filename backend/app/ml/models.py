from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
import math

class BaseNowcastModel(ABC):
    """Abstract Base Class for Convective Nowcasting Inference Engines."""

    @abstractmethod
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate atmospheric features and produce probabilistic nowcasts.
        
        Args:
            features: Dictionary containing thermodynamic, radar, satellite, 
                      and lightning observations.
        Returns:
            Dictionary with storm_probability, lightning_probability, confidence, and risk_level.
        """
        pass


class DemoNowcastModel(BaseNowcastModel):
    """
    Lightweight, deterministic surrogate nowcast model for SIH26072 hackathon prototype.
    Simulates physics-based convective updraft potential, lightning jumping, and radar cores.
    """

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        cape = float(features.get('cape', 2000))
        cin = float(features.get('cin', 30))
        dbz = float(features.get('radar_reflectivity', 40))
        humidity = float(features.get('humidity', 75))
        lightning_density = float(features.get('lightning_density', 2.0))
        time_offset_min = float(features.get('time_offset_min', 0))

        # Thermodynamic buoyancy score (normalized 0 to 1)
        cape_score = min(1.0, max(0.0, (cape - 1000) / 2500))
        # Radar core severity
        radar_score = min(1.0, max(0.0, (dbz - 25) / 35))
        # Moisture convergence
        moisture_score = min(1.0, max(0.0, (humidity - 50) / 45))
        # Lightning activity
        lightning_score = min(1.0, max(0.0, lightning_density / 6.0))

        # Composite storm probability (0 - 100)
        weighted_prob = (cape_score * 0.35 + radar_score * 0.35 + moisture_score * 0.15 + lightning_score * 0.15) * 100

        # Temporal advection decay over forecast horizon (0 - 120 mins)
        if time_offset_min <= 30:
            temporal_factor = 1.05
        elif time_offset_min <= 60:
            temporal_factor = 0.92
        else:
            temporal_factor = 0.72

        storm_prob = int(min(98, max(5, round(weighted_prob * temporal_factor))))
        lightning_prob = int(min(95, max(4, round(storm_prob * 0.92))))
        confidence = int(max(60, round(94 - time_offset_min * 0.2)))

        risk_level = 'LOW'
        if storm_prob >= 75 or dbz >= 50:
            risk_level = 'SEVERE'
        elif storm_prob >= 60 or dbz >= 40:
            risk_level = 'HIGH'
        elif storm_prob >= 35 or dbz >= 28:
            risk_level = 'MODERATE'

        return {
            'storm_probability': storm_prob,
            'lightning_probability': lightning_prob,
            'confidence': confidence,
            'risk_level': risk_level,
            'model_name': 'DemoNowcastSurrogate-v1.4.2'
        }


class GradientBoostingNowcastModel(BaseNowcastModel):
    """LightGBM / Scikit-learn tabular model placeholder for production training."""

    def __init__(self):
        self.is_trained = False

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        # Falls back to surrogate if weights not loaded
        fallback = DemoNowcastModel()
        result = fallback.predict(features)
        result['model_name'] = 'GradientBoostingNowcast-ProdCandidate'
        return result


class FutureUNetModel(BaseNowcastModel):
    """Deep Learning Spatiotemporal ConvLSTM / U-Net interface for raw radar raster grids."""

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        fallback = DemoNowcastModel()
        result = fallback.predict(features)
        result['model_name'] = 'ConvLSTM-UNet-SpatialSurrogate'
        return result
