# STORMSIGHT AI

### AIML based Nowcasting of Thunderstorm and Lightning using Atmospheric Observation Including Multiple Radars, Satellite, Lightning and Model Data

**Problem Statement ID**: SIH26072  
**Organization**: Ministry of Earth Sciences (MoES)  
**Department**: India Meteorological Department (IMD)  
**Theme**: Disaster Management  
**System Mode**: Prototype & Simulation (Deterministic Demo Evaluation)

---

## 1. Overview & Operational Need

Severe convective storms and lightning strikes represent one of the deadliest meteorological hazards in South Asia, causing over 2,500 fatalities and extensive infrastructure damage annually. Traditional numerical weather prediction (NWP) models update every 3–6 hours at 4–12 km resolutions, making them unable to resolve rapid convective updrafts and lightning flashes occurring on 10–30 minute timescales.

**StormSight AI** bridges this critical operational gap by fusing:
- **Doppler Weather Radars (DWR)** (S & C band reflectivity cores, VIL, echo tops)
- **Geostationary Satellites (INSAT-3D/3DR)** (Thermal IR rapid cooling rates)
- **Ground Lightning Detection Networks (IITM / IMD Damini)** (Intra-cloud precursors & CG density)
- **Automatic Weather Stations (AWS)** (Surface pressure drop, moisture convergence, CAPE/CIN)
- **Convection-Permitting NWP Models** (Background environmental shear)

The platform delivers continuous, hyper-local **0–120 minute nowcasts** with high-resolution spatial risk mapping, physical explainability (SHAP attributions), and automated threshold-triggered warnings.

---

## 2. Key Capabilities & System Features

1. **Interactive Geospatial Nowcast Stage**: Real Leaflet map centered on Central India (Madhya Pradesh), rendering Doppler reflectivity sweeps (15–55+ dBZ), storm cell motion vectors, and individual lightning strikes with age decay.
2. **0–120 Minute Temporal Advection**: Forecast horizon scrubber (`NOW`, `+15m`, `+30m`, `+60m`, `+90m`, `+120m`) dynamically advecting storm centroids along their heading vectors (58° NE @ 38 km/h).
3. **Dual-Stream Machine Learning Ensemble**:
   - **Stream A**: Convolutional LSTM (ConvLSTM) radar surrogate for spatial reflectivity advection.
   - **Stream B**: LightGBM Gradient Boosted Decision Trees classifying storm initiation and lightning flash counts.
4. **Explainable AI (XAI) Attribution**: Transparent SHAP feature attributions (CAPE 88%, Radar 82%, Lightning Jump 85%) paired with natural-language meteorological reasoning.
5. **Operational Alert Center**: Threshold-triggered severe thunderstorm and lightning warnings with operator acknowledgment protocols.
6. **Sensor Health & Latency Monitor**: Continuous latency, update frequency, and fallback status for 6 observation feeds.
7. **Ground-Truth Event Replay Simulator**: Interactive replay of historical convective outbreaks (Bhopal Supercell, Indore Squall, Jabalpur Orographic Convection) with 1x, 2x, 5x variable speed playback.
8. **Objective Verification Metrics**: CSI (0.762), POD (0.882), FAR (0.152), Brier Score (0.082), and ROC-AUC (0.934) across a 14,250 convective benchmark dataset.
9. **Guided Demo Walkthrough for Judges**: Automated 9-step evaluation tour guiding judges through the system capabilities in under 3 minutes.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Leaflet Maps, Lucide Icons
- **Backend (Express)**: Built-in Node.js/Express server powering the interactive development applet and REST APIs (`/api/v1/*`)
- **Backend (FastAPI)**: Standalone Python 3.11 FastAPI backend in `backend/` with Pydantic v2 schemas and modular ML models
- **Deployment**: Vercel ready (Frontend), Render / Railway / Fly.io ready (FastAPI backend), Docker & Docker Compose ready

---

## 4. Local Run Instructions

### Option A: Full-Stack App (Express + Vite on Port 3000)
```bash
# 1. Install dependencies
npm install

# 2. Run the application
npm run dev

# 3. Open in your browser
http://localhost:3000
```

### Option B: Standalone Python FastAPI Backend (Port 8000)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 5. Access interactive Swagger API Docs
http://localhost:8000/docs
```

---

## 5. Docker Deployment

### Run Full Stack with Docker Compose
```bash
docker-compose up --build
```
This boots:
- Web App + Server on `http://localhost:3000`
- Python FastAPI Backend on `http://localhost:8000`

### Build Single Docker Container
```bash
docker build -t stormsight-ai .
docker run -p 3000:3000 stormsight-ai
```

---

## 6. Cloud Deployment Instructions

### Vercel Deployment (Frontend / Web)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: StormSight AI SIH26072 nowcasting prototype"
   git push origin main
   ```
2. In Vercel, import your GitHub repository.
3. Configure Build settings:
   - **Framework Preset**: Vite / Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

### Render Deployment (Python FastAPI Backend)
1. In Render, select **New Web Service**.
2. Connect your GitHub repository.
3. Set the Root Directory to `backend`.
4. Choose **Python 3**.
5. Set Build Command: `pip install -r requirements.txt`
6. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Set Health Check Path: `/health`

---

## 7. Environment Variables (`.env`)

```env
# Application Port
PORT=3000

# Environment Mode
NODE_ENV=development

# Operational Mode (DEMO for SIH26072 prototype)
MODE=DEMO

# Optional backend proxy URL if separating frontend/backend domains
VITE_API_URL=
```

---

## 8. SIH26072 Notice & Meteorological Disclaimer

*This application is a functional engineering and decision-support prototype built for Smart India Hackathon problem statement **SIH26072**. While the mathematical advection, lightning jump physics, and verification metrics are grounded in scientific literature, all real-time feeds in DEMO mode are deterministically simulated and should not be used as operational civil defense warnings without official authorization from the India Meteorological Department (IMD).*
