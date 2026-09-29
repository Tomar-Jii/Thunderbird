# StormSight AI — REST API Reference (SIH26072)

Base URLs:
- Node/Express Full-Stack: `http://localhost:3000`
- Python FastAPI Standalone: `http://localhost:8000`

---

## Endpoints

### 1. Health & Status
- **`GET /health`**
  - Returns service status, version, and platform metadata.
- **`GET /api/v1/system/status`**
  - Returns operational mode (`DEMO`), UTC/IST clocks, active surveillance radius (350 km), and feed health.

### 2. Sensor Surveillance
- **`GET /api/v1/data/sources`**
  - Returns connection latency, status, coverage %, and update frequency for the 6 observation feeds.
- **`GET /api/v1/observations/current`**
  - Current thermodynamic, radar, and lightning observations across all monitored stations.
- **`GET /api/v1/observations/{location}`**
  - High-resolution atmospheric sounding for a specific station (`bhopal`, `indore`, `jabalpur`, `gwalior`, `ujjain`, `sagar`).

### 3. Convective Tracking
- **`GET /api/v1/storm-cells`**
  - Returns active convective cell centroids, outer boundary polygon coordinates, echo tops, max reflectivity (dBZ), and heading vectors.
- **`GET /api/v1/lightning`**
  - Returns individual lightning discharges (Cloud-to-Ground & Intra-Cloud), peak current in kiloamperes (kA), and strike age in seconds.
- **`GET /api/v1/radar`**
  - Radar station metadata and standard reflectivity dBZ colour scale mapping.
- **`GET /api/v1/satellite`**
  - INSAT-3DR TIR-1 brightness temperatures and deep convection indicators.

### 4. Forecast & Inference
- **`GET /api/v1/forecast/{location}`**
  - Returns 0–120 minute nowcast progression (0, 15, 30, 45, 60, 90, 120m), storm probability %, lightning probability %, confidence %, and SHAP feature attribution weights.
- **`POST /api/v1/nowcast/run`**
  - Triggers on-demand multi-source feature extraction and model inference. Returns run ID and stages completed.

### 5. Alerts & Dissemination
- **`GET /api/v1/alerts`**
  - Active operational alerts with severity (`SEVERE`, `WARNING`, `WATCH`, `INFO`), recommended actions, and confidence.
- **`POST /api/v1/alerts/{id}/acknowledge`**
  - Marks an alert as acknowledged by the operator.
- **`POST /api/v1/alerts/{id}/dismiss`**
  - Dismisses an alert.

### 6. Event Replay & Verification
- **`GET /api/v1/events`**
  - List of ground-truth verified historical convective storm outbreaks.
- **`GET /api/v1/metrics`**
  - Contingency verification skill scores: CSI (0.762), POD (0.882), FAR (0.152), Brier Score (0.082), ROC-AUC (0.934).
- **`GET /api/v1/model/status`**
  - Pipeline inference latency benchmarks (28.4ms average) and confidence distributions.
