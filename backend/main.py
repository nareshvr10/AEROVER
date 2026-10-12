"""
AEROVER — Tactical Search & Rescue Backend
FastAPI REST & WebSocket Service
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import asyncio
import json

app = FastAPI(
    title="AEROVER Tactical Backend",
    description="Aerial Emergency Reconnaissance, Observation, Verification and Emergency Response API",
    version="1.0.0"
)

# CORS middleware for local frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory operational store
MISSIONS = []
ALERTS = []
DETECTIONS = []
OBSERVATIONS = []
TEAMS = []

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": "AEROVER Tactical Backend",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/missions")
def get_missions():
    return MISSIONS

@app.post("/api/missions")
def create_mission(mission: dict):
    mission["lastUpdated"] = datetime.utcnow().isoformat()
    MISSIONS.append(mission)
    return mission

@app.get("/api/telemetry/latest")
def get_telemetry():
    return {
        "droneId": "AEROVER-AIR-01",
        "linkStatus": "disconnected",
        "timestamp": datetime.utcnow().isoformat(),
        "batteryPercent": 84,
        "gpsValid": True,
        "latitude": 46.8540,
        "longitude": -121.7450,
        "altitudeMeters": 145.2,
        "speedMps": 7.8,
        "headingDeg": 128,
        "isSimulated": True
    }

@app.get("/api/gps/latest")
def get_latest_gps():
    return {
        "point": {"lat": 46.8540, "lng": -121.7450, "altitude": 145.2},
        "validity": True,
        "accuracyMeters": 3.2,
        "source": "ATGM336H UART Simulator",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/alerts")
def get_alerts():
    return ALERTS

@app.post("/api/alerts")
def post_alert(alert: dict):
    alert["timestamp"] = datetime.utcnow().isoformat()
    ALERTS.append(alert)
    return alert

@app.get("/api/detections")
def get_detections():
    return DETECTIONS

@app.get("/api/observations")
def get_observations():
    return OBSERVATIONS

@app.get("/api/teams")
def get_teams():
    return TEAMS

@app.websocket("/ws/mission-events")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Broadcast periodic heartbeat
            await websocket.send_json({
                "type": "HEARTBEAT",
                "timestamp": datetime.utcnow().isoformat()
            })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
