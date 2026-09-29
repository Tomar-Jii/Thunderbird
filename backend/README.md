# StormSight AI - Backend (FastAPI)

Production-grade Python/FastAPI backend for **SIH26072**: “AIML based Nowcasting of thunderstorm and lightning using atmospheric observation including multiple radars, satellite, lightning and model data.”

## Architecture
- **Framework**: FastAPI (Asynchronous Python 3.11)
- **Validation**: Pydantic v2 schemas
- **ML Core**: Modular `BaseNowcastModel` interface with `DemoNowcastModel` surrogate and `GradientBoostingNowcastModel` extension hooks
- **Inference Latency**: < 30ms

## Setup & Running

```bash
# 1. Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch dev server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Run unit tests
pytest app/tests/test_api.py
```

## Docker Deployment
```bash
docker build -t stormsight-backend .
docker run -p 8000:8000 stormsight-backend
```
