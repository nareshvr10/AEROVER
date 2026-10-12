# AEROVER — AI Search & Rescue System

> **“SEE THE UNKNOWN. SAVE LIVES.”**

A professional, responsive emergency search-and-rescue (SAR) command platform designed for mission planning, search sector clearance, aerial camera monitoring, lawful radio/signal observations, and operator-verified computer vision detection.

---

## 1. Brand Architecture

- **AEROVER AIR** — Drone & aerial telemetry system
- **AEROVER MOBILE** — Mobile field mission interface (touch-optimized for Android tablets/phones)
- **AEROVER COMMAND** — Web operations command dashboard
- **AEROVER OPS** — Incident analytics, team tracking, and after-action reporting

*Proposed expansion:* **A**erial **E**mergency **R**econnaissance, **O**bservation, **V**erification and **E**mergency **R**esponse.

---

## 2. Implemented Features & Architecture

### A. Operations & Mission Control
- **Operations Overview Dashboard**: Real-time summary cards, interactive tactical map, live optical feed preview, sector status breakdown, Ground SAR team cards, and latest signal observations.
- **Live Mission Control Room**: Workflow state controls (**Resume Tracking**, **Pause Workflow**, **Complete Mission**, **Abort Mission**), elapsed mission stopwatch, interactive waypoint checklist, sector status cycling, and field incident logger.
- **Tactical Search Map**: Leaflet interactive map with custom dark tactical style, OpenStreetMap toggle, sector polygon boundaries, numbered waypoints, team location pins, Last Known Position (LKP) pin, fit-to-mission bounds, distance calculations, and format conversions (Decimal Degrees $\leftrightarrow$ DMS).
- **Search Sector Geometry Planner**: Click-on-map boundary vertex plotter, automated shoelace area calculation ($km^2$), sector naming, priority assignment, and JSON/CSV export.
- **Mission Planner (CRUD)**: Create, edit, duplicate, search, and delete search mission plans with 6 incident types (*Missing Person, Flood Response, Landslide Response, Forest Search, Disaster Assessment, Emergency Recon*).
- **Mission History Audit Trail**: Searchable historical database of archived search missions and clearance records.

### B. Optical Sensors & Live Camera
- **Dedicated Live Camera Monitor**: Viewport with HUD overlay, crosshairs, full-screen mode, and resolution/FPS diagnostics.
- **Three Camera Source Modes**:
  1. *Simulated Tactical Reconnaissance Feed*: High-definition aerial SAR imagery with simulated bounding boxes.
  2. *Browser Webcam / Mobile Rear Camera*: Utilizes `navigator.mediaDevices.getUserMedia` with rear-camera preference.
  3. *DroidCam IP Stream*: Configurable endpoint (`http://<phone_ip>:4747/video` or `mjpegfeed`) for wireless Android smartphone streaming.
- **Optical Snapshot & Vision Analysis**: Captures timestamped frame data URLs with geographic and temporal imprints.

### C. Sensors, Telemetry & AI Vision
- **Computer Vision Review (Human-in-the-Loop)**: Target review interface for person, vehicle, and smoke detections. Displays confidence scores, bounding boxes, model engine metadata, and operator verification (**Confirm Target** / **Reject Target**).
- **Lawful Signal Observations**: Radio and beacon observation logs adhering to strict statutory privacy constraints. Logs frequency (MHz), channel, signal strength (dBm), AoA bearing azimuth, and data quality without unauthorized network intrusion.
- **Drone Telemetry Diagnostics**: Heartbeat latency, battery status, 3D GPS satellite lock count, airspeed, altitude, attitude angles (pitch, roll, yaw), and sensor health bus (IMU, Barometer, Compass, GNSS).
- **Device & Adapter Manager**: Dynamic connection cards for DroidCam, Webcam, ATGM336H GPS receiver, Telemetry Radio, Edge AI server, and FastAPI backend with active connection test pings.

### D. Team Management, Alerts, Analytics & Reports
- **SAR Team Coordination**: Ground searchers, dog handlers (K9), medical units, and drone pilots with accountability check-in states (*on_site, in_transit, checked_in, standby, checked_out*).
- **Incident Alert Center**: Multi-severity notification hub (*Informational, Low, Medium, High, Critical*) with acknowledgement and resolution workflows.
- **Operations Analytics**: Recharts visualizations for mission status breakdowns, sector clearance progression, AI detection review outcomes, and alert severity distributions.
- **Mission After-Action Reports**: Official print-ready reports with data source limitations disclosure, JSON export, and CSV export.
- **System Diagnostics & Roadmap**: Runtime capability audit, ATGM336H wiring specifications, Capacitor Android packaging instructions, and Python FastAPI backend code.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Mapping**: Leaflet 1.9 with OpenStreetMap & custom dark tactical filter
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: Client-side storage repository (`localStorage`) with clean service abstraction
- **Backend (Optional)**: Python FastAPI with REST and WebSocket contracts in `/backend/main.py`

---

## 4. Local Installation & Running

### Frontend Web Dashboard
```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
# Dashboard opens on http://localhost:3000

# 3. Build for production
npm run build
```

### Optional Python FastAPI Backend
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install requirements
pip install -r requirements.txt

# 3. Run FastAPI backend
uvicorn main:app --reload --port 8000
# API docs available at http://localhost:8000/docs
```

---

## 5. Camera & Sensor Configuration Guide

### A. Configuring DroidCam Phone Stream
1. Install **DroidCam Wireless Webcam** from Google Play Store on your Android device.
2. Connect phone and computer to the same Wi-Fi network (or connect via USB tethering).
3. Open DroidCam on your phone and note the **Wi-Fi IP** and **DroidCam Port** (default `4747`).
4. In AEROVER, go to **Live Camera** or **Device Connections**.
5. Select **DroidCam (IP)** and enter: `http://<phone_ip>:4747/video` (or `http://<phone_ip>:4747/mjpegfeed`).
6. Click **Test & Connect URL**.

*Note on Browser Security:* When accessing AEROVER over HTTPS, modern browsers restrict mixed HTTP content. Run the browser locally or use a secure proxy bridge when connecting to raw HTTP camera endpoints.

---

## 6. Future Hardware Roadmap & Wiring

### ATGM336H GPS UART Receiver
- **Baud Rate**: 9600 bps (8-N-1)
- **NMEA Sentences**: `$GPGGA`, `$GPRMC`, `$GNGGA`
- **Wiring to USB-UART Adapter**:
  - `VCC` $\rightarrow$ 3.3V / 5.0V
  - `GND` $\rightarrow$ Ground
  - `TXD` $\rightarrow$ Adapter RXD
  - `RXD` $\rightarrow$ Adapter TXD (optional)

### Edge AI Vision Server (YOLOv8)
To connect a local YOLOv8 inference container:
```bash
# Example Docker run command:
docker run -p 5000:5000 --gpus all ultralytics/yolov8:latest
```
Endpoint: `http://localhost:5000/v1/detect`

---

## 7. Packaging for Android (Capacitor)

To compile AEROVER into an Android application:
```bash
# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init "AEROVER" "com.aerover.tactical" --web-dir "dist"

# 3. Build web distribution
npm run build

# 4. Add Android platform
npx cap add android

# 5. Sync web assets
npx cap sync android

# 6. Open in Android Studio to build APK
npx cap open android
```

---

## 8. Data-Source Limitations & Safety Boundaries

- **Software Prototype Scope**: AEROVER initializes without requiring physical flight hardware.
- **Workflow Controls vs. Flight Controls**: Software pause and abort actions control incident tracking and logging only; they do not control physical ESC motors.
- **Lawful Signal Protocols**: AEROVER does not perform cellular packet inspection, network interception, or IMSI spoofing.
- **Human-in-the-Loop Verification**: Computer vision predictions are candidate screening flags that require human operator review before initiating field rescue dispatches.
