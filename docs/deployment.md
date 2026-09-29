# StormSight AI — Deployment Guide

Instructions for deploying StormSight AI locally, in cloud environments (Vercel, Render, Railway, Fly.io), and via Docker.

---

## 1. Local Development (Full-Stack Monorepo)

```bash
# Clone the repository
git clone https://github.com/your-org/stormsight-ai.git
cd stormsight-ai

# Install frontend and backend server dependencies
npm install

# Start development server (serves web app + all /api/v1 endpoints on port 3000)
npm run dev

# Open in browser
open http://localhost:3000
```

---

## 2. Docker & Container Deployment

### Run Complete Monorepo via Docker Compose:
```bash
docker-compose up --build
```
This spins up:
- Web and Node API on port `3000`
- Python FastAPI backend on port `8000`

### Build and Run Standalone Container:
```bash
docker build -t stormsight-ai .
docker run -d -p 3000:3000 --name stormsight-app stormsight-ai
```

---

## 3. Cloud Deployments

### A. Vercel Deployment (Frontend / Web)
1. Push the code to GitHub.
2. Link the repository to your Vercel account.
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy!

### B. Render / Railway / Fly.io (Python FastAPI Backend)
1. Navigate to the `backend/` directory or select it as the root directory on Render.
2. Environment: `Python 3.11`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Health Check Path: `/health`

---

## 4. Environment Variables

Create `.env` based on `.env.example`:
```env
PORT=3000
NODE_ENV=development
API_BASE_URL=
FASTAPI_PORT=8000
ENABLE_DEMO_MODE=true
```
