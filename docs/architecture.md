# StormSight AI — System Architecture

**Project Identity**: StormSight AI  
**Problem Statement**: SIH26072  
**Organization**: Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)  
**Theme**: Disaster Management  

---

## 1. Executive Summary

StormSight AI is a state-of-the-art decision-support and nowcasting platform engineered to predict severe convective thunderstorms and high-frequency lightning strikes over a 0–120 minute forecast horizon across Central India (Madhya Pradesh focus).

The system unifies 5 disparate sensor streams:
1. **Doppler Weather Radars (DWR)**: S-Band & C-Band reflectivity cores (dBZ), radial velocity, and vertical integrated liquid (VIL).
2. **Geostationary Satellite (INSAT-3D/3DR)**: Thermal Infrared (TIR-1 10.8 µm), Water Vapor (WV 6.8 µm), and rapid cloud-top cooling rates.
3. **Lightning Detection Networks (IITM / IMD Damini)**: Real-time Cloud-to-Ground (CG) and Intra-Cloud (IC) discharge pulses with strike age tracking.
4. **Surface Automatic Weather Stations (AWS)**: 15-minute thermodynamic observations (temperature, dew point, pressure drop, and surface wind shear).
5. **Numerical Weather Prediction (NWP)**: NCMRWF/IMD 4km Convection-Permitting Models (HRRR/UM) supplying background environmental shear and stability indices.

---

## 2. High-Level Data Flow

```
[ Doppler Weather Radar ] \
[ INSAT-3DR Satellite   ]  \
[ Damini Lightning Net  ]   -> [ Ingestion & Harmonization ] -> [ Spatiotemporal Feature Pipeline ]
[ Surface AWS Stations  ]  /
[ NCMRWF 4km NWP        ] /
                                         |
                                         v
                         [ Dual-Stream Ensemble Engine ]
                          - ConvLSTM Spatial Radar Advection
                          - LightGBM Tabular Gradient Booster
                          - Bayesian Probability Calibration
                                         |
                                         v
                          [ 0-120m Advective Risk Grid ]
                                         |
                        +----------------+----------------+
                        |                                 |
                        v                                 v
          [ Leaflet Geospatial UI ]             [ Autonomous Alert Engine ]
          - Real-time strike decays             - SEVERE / WARNING / WATCH
          - Storm centroid motion               - Geo-fenced District Bulletins
          - SHAP Explainability                 - Automated Dissemination
```

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Leaflet Maps, Lucide Icons.
- **Backend / Dev Runtime**: Node.js/Express server (AI Studio environment) + Python 3.11 FastAPI with Pydantic v2.
- **Deployment Compatibility**: Vercel (Web frontend) & Render / Railway / Fly.io / Docker (Backend).
