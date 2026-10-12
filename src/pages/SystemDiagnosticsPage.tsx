import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  Smartphone, 
  Compass, 
  Cpu, 
  Server,
  Layers,
  Code2
} from 'lucide-react';
import { GpsAdapter } from '../services/gpsAdapter';

export const SystemDiagnosticsPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Runtime environment capability tests
  const [envChecks, setEnvChecks] = useState<{
    localStorage: boolean;
    mediaDevices: boolean;
    geolocation: boolean;
    webgl: boolean;
    fullscreen: boolean;
  }>({
    localStorage: false,
    mediaDevices: false,
    geolocation: false,
    webgl: false,
    fullscreen: false
  });

  useEffect(() => {
    let hasWebGl = false;
    try {
      const canvas = document.createElement('canvas');
      hasWebGl = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {}

    setEnvChecks({
      localStorage: typeof localStorage !== 'undefined',
      mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      geolocation: typeof navigator !== 'undefined' && 'geolocation' in navigator,
      webgl: hasWebGl,
      fullscreen: typeof document !== 'undefined' && 'fullscreenEnabled' in document
    });
  }, []);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fastApiCode = `# AEROVER Optional Python FastAPI Backend (backend/main.py)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="AEROVER Tactical Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/telemetry/latest")
def get_telemetry():
    return {
        "droneId": "AEROVER-AIR-01",
        "linkStatus": "disconnected",
        "timestamp": datetime.utcnow().isoformat(),
        "batteryPercent": 84,
        "gpsValid": True,
        "isSimulated": True
    }

# Run with: uvicorn main:app --reload --port 8000
`;

  const capacitorSteps = `# Packaging AEROVER for Android using Capacitor:
# 1. Install Capacitor dependencies:
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor:
npx cap init "AEROVER" "com.aerover.tactical" --web-dir "dist"

# 3. Build web production bundle:
npm run build

# 4. Add Android native project:
npx cap add android

# 5. Sync web bundle to Android:
npx cap sync android

# 6. Open in Android Studio & Run APK:
npx cap open android
`;

  const atgm336hSpecs = `# ATGM336H GNSS / GPS Receiver Hardware Wiring & Specs:
Module: ATGM336H BDS/GPS Dual-mode High Sensitivity Module
Baud Rate: 9600 bps (Default), 8 Data bits, 1 Stop bit, No Parity
NMEA Sentences: $GPGGA, $GNGGA, $GPRMC, $GPGSV
Update Rate: 1Hz (default), configurable up to 10Hz

Pinout to USB-UART Adapter:
- VCC  -> 3.3V / 5.0V DC
- GND  -> Ground
- TXD  -> UART RX on adapter
- RXD  -> UART TX on adapter (optional, for configuration)
- PPS  -> Pulse Per Second (optional precision time synchronization)
`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">System Diagnostics & Hardware Roadmap</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Client environment capability auditing, ATGM336H GPS wiring, FastAPI server code, and Android APK compilation guide.
          </p>
        </div>
      </div>

      {/* Client Environment Diagnostics Grid */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded space-y-3">
        <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider pb-2 border-b border-[#22262E]">
          CLIENT BROWSER & RUNTIME CAPABILITY AUDIT
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex items-center justify-between">
            <span className="text-[#8A9AA5]">LocalStorage</span>
            {envChecks.localStorage ? <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" /> : <XCircle className="w-4 h-4 text-[#FF4B4B]" />}
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex items-center justify-between">
            <span className="text-[#8A9AA5]">MediaDevices</span>
            {envChecks.mediaDevices ? <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" /> : <XCircle className="w-4 h-4 text-[#FF4B4B]" />}
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex items-center justify-between">
            <span className="text-[#8A9AA5]">Geolocation</span>
            {envChecks.geolocation ? <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" /> : <XCircle className="w-4 h-4 text-[#FF4B4B]" />}
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex items-center justify-between">
            <span className="text-[#8A9AA5]">WebGL Canvas</span>
            {envChecks.webgl ? <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" /> : <XCircle className="w-4 h-4 text-[#FF4B4B]" />}
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex items-center justify-between">
            <span className="text-[#8A9AA5]">Fullscreen</span>
            {envChecks.fullscreen ? <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" /> : <XCircle className="w-4 h-4 text-[#FF4B4B]" />}
          </div>
        </div>
      </div>

      {/* Hardware Integration Roadmap */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded space-y-4">
        <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider pb-2 border-b border-[#22262E]">
          5-PHASE HARDWARE & SENSOR INTEGRATION ROADMAP
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-[#182A1F] border border-[#4CAF50] rounded space-y-1">
            <div className="text-[10px] font-mono text-[#4CAF50] font-bold">PHASE 1 (ACTIVE)</div>
            <div className="font-bold text-[#F2F5F7]">Software Prototype</div>
            <p className="text-[11px] text-[#AAB6C2]">
              Complete command dashboard, sector planner, Leaflet map, reports, and simulated fixtures.
            </p>
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded space-y-1">
            <div className="text-[10px] font-mono text-[#8A9AA5] font-bold">PHASE 2</div>
            <div className="font-bold text-[#F2F5F7]">DroidCam & WebCam</div>
            <p className="text-[11px] text-[#8A9AA5]">
              Real-time video ingest from Android phones over Wi-Fi/USB tether and browser cameras.
            </p>
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded space-y-1">
            <div className="text-[10px] font-mono text-[#8A9AA5] font-bold">PHASE 3</div>
            <div className="font-bold text-[#F2F5F7]">ATGM336H GPS Module</div>
            <p className="text-[11px] text-[#8A9AA5]">
              UART serial link to GNSS satellite receiver via WebSerial API or Python backend bridge.
            </p>
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded space-y-1">
            <div className="text-[10px] font-mono text-[#8A9AA5] font-bold">PHASE 4</div>
            <div className="font-bold text-[#F2F5F7]">Edge AI Vision Server</div>
            <p className="text-[11px] text-[#8A9AA5]">
              Deploy YOLOv8 container on local GPU / Jetson Orin for automated real-time frame inference.
            </p>
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded space-y-1">
            <div className="text-[10px] font-mono text-[#8A9AA5] font-bold">PHASE 5</div>
            <div className="font-bold text-[#F2F5F7]">Flight Controller Link</div>
            <p className="text-[11px] text-[#8A9AA5]">
              MAVLink 2.0 telemetry transceiver over 433/915 MHz for live drone flight metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Code Snippets: ATGM336H Specs, Android Capacitor, and FastAPI Backend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATGM336H Hardware Specs */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
              <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#38BDF8]" />
                ATGM336H GPS HARDWARE WIRING SPECIFICATION
              </h3>
              <button
                type="button"
                onClick={() => handleCopy('atgm', atgm336hSpecs)}
                className="text-xs text-[#8A9AA5] hover:text-[#4CAF50] flex items-center gap-1 font-mono"
              >
                {copiedKey === 'atgm' ? <Check className="w-3.5 h-3.5 text-[#4CAF50]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'atgm' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="mt-3 p-3 bg-[#0B1420] border border-[#22262E] rounded font-mono text-[11px] text-[#AAB6C2] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {atgm336hSpecs}
            </pre>
          </div>
        </div>

        {/* Android Packaging Instructions */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
              <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#4CAF50]" />
                ANDROID PACKAGING INSTRUCTIONS (CAPACITOR)
              </h3>
              <button
                type="button"
                onClick={() => handleCopy('cap', capacitorSteps)}
                className="text-xs text-[#8A9AA5] hover:text-[#4CAF50] flex items-center gap-1 font-mono"
              >
                {copiedKey === 'cap' ? <Check className="w-3.5 h-3.5 text-[#4CAF50]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cap' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="mt-3 p-3 bg-[#0B1420] border border-[#22262E] rounded font-mono text-[11px] text-[#AAB6C2] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {capacitorSteps}
            </pre>
          </div>
        </div>
      </div>

      {/* Optional Python FastAPI Backend Source Code */}
      <div className="bg-[#111B25] border border-[#22262E] rounded p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
          <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-[#8A9AA5]" />
            OPTIONAL PYTHON FASTAPI BACKEND SERVICE SOURCE (backend/main.py)
          </h3>
          <button
            type="button"
            onClick={() => handleCopy('py', fastApiCode)}
            className="text-xs text-[#8A9AA5] hover:text-[#4CAF50] flex items-center gap-1 font-mono"
          >
            {copiedKey === 'py' ? <Check className="w-3.5 h-3.5 text-[#4CAF50]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'py' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="mt-3 p-3 bg-[#0B1420] border border-[#22262E] rounded font-mono text-[11px] text-[#38BDF8] overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {fastApiCode}
        </pre>
      </div>
    </div>
  );
};
