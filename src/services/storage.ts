import { 
  Mission, 
  SARTeam, 
  SystemAlert, 
  AIDetection, 
  SignalObservation, 
  DeviceConnection, 
  DroneTelemetry, 
  AppSettings,
  MissionReport 
} from '../types';

const STORAGE_KEYS = {
  MISSIONS: 'aerover_missions_v1',
  TEAMS: 'aerover_teams_v1',
  ALERTS: 'aerover_alerts_v1',
  DETECTIONS: 'aerover_detections_v1',
  OBSERVATIONS: 'aerover_observations_v1',
  DEVICES: 'aerover_devices_v1',
  SETTINGS: 'aerover_settings_v1',
  REPORTS: 'aerover_reports_v1',
  ACTIVE_MISSION_ID: 'aerover_active_mission_id_v1',
  TELEMETRY: 'aerover_telemetry_v1'
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  coordinateFormat: 'decimal_degrees',
  distanceUnit: 'metric_meters',
  timeDisplay: 'utc',
  cameraSourceUrl: 'http://192.168.1.105:4747/video',
  activeCameraType: 'test_feed',
  apiBackendUrl: 'http://localhost:8000',
  dataRetentionDays: 30,
  simulationMode: true
};

// Mount Rainier / Cascade wilderness reference coordinates
const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'MSN-2026-001',
    name: 'Cascade Ridge Sector Bravo',
    type: 'missing_person',
    priority: 'high',
    status: 'active',
    description: 'Search for overdue 28yo solo hiker last seen near Ridge Trailhead Mile 4. Weather deteriorating with evening fog.',
    searchAreaBoundary: [
      { lat: 46.8523, lng: -121.7603 },
      { lat: 46.8654, lng: -121.7451 },
      { lat: 46.8582, lng: -121.7225 },
      { lat: 46.8410, lng: -121.7380 },
      { lat: 46.8523, lng: -121.7603 }
    ],
    sectors: [
      {
        id: 'SEC-A1',
        name: 'Sector Alpha (Ridge Crest)',
        assignedTeamId: 'TM-01',
        status: 'in_progress',
        polygon: [
          { lat: 46.8523, lng: -121.7603 },
          { lat: 46.8654, lng: -121.7451 },
          { lat: 46.8590, lng: -121.7480 },
          { lat: 46.8523, lng: -121.7603 }
        ],
        areaSquareKm: 1.42,
        priority: 'high',
        notes: 'Steep scree slope. Drone optical scan prioritized.'
      },
      {
        id: 'SEC-B2',
        name: 'Sector Bravo (Creek Basin)',
        assignedTeamId: 'TM-02',
        status: 'assigned',
        polygon: [
          { lat: 46.8590, lng: -121.7480 },
          { lat: 46.8654, lng: -121.7451 },
          { lat: 46.8582, lng: -121.7225 },
          { lat: 46.8520, lng: -121.7350 }
        ],
        areaSquareKm: 2.15,
        priority: 'high',
        notes: 'Heavily wooded ravine. Ground sweep coordinated with aerial thermal scan.'
      },
      {
        id: 'SEC-C3',
        name: 'Sector Charlie (Access Trailhead)',
        assignedTeamId: 'TM-03',
        status: 'completed',
        polygon: [
          { lat: 46.8520, lng: -121.7350 },
          { lat: 46.8582, lng: -121.7225 },
          { lat: 46.8410, lng: -121.7380 },
          { lat: 46.8520, lng: -121.7350 }
        ],
        areaSquareKm: 1.88,
        priority: 'medium',
        notes: 'Trail cleared. Vehicle parked at trailhead confirmed unattended.'
      }
    ],
    waypoints: [
      {
        id: 'WP-1',
        order: 1,
        name: 'Base Incident Post (ICP)',
        coordinates: { lat: 46.8425, lng: -121.7410, altitude: 820 },
        reached: true,
        notes: 'Incident staging and communications trailer deployed.'
      },
      {
        id: 'WP-2',
        order: 2,
        name: 'Last Known Position (LKP)',
        coordinates: { lat: 46.8540, lng: -121.7472, altitude: 1240 },
        reached: true,
        notes: 'Hiker cellular ping reported 09:15 UTC yesterday.'
      },
      {
        id: 'WP-3',
        order: 3,
        name: 'Ridge Overlook Recon',
        coordinates: { lat: 46.8612, lng: -121.7395, altitude: 1560 },
        reached: false,
        notes: 'Primary aerial observation point.'
      },
      {
        id: 'WP-4',
        order: 4,
        name: 'Emergency LZ Bravo',
        coordinates: { lat: 46.8505, lng: -121.7320, altitude: 940 },
        reached: false,
        notes: 'Designated flat clearing for medi-vac landing if needed.'
      }
    ],
    assignedOperator: 'Commander M. Reynolds (AEROVER-OPS)',
    assignedTeamIds: ['TM-01', 'TM-02', 'TM-03'],
    startTime: '2026-10-11T06:30:00Z',
    lastUpdated: '2026-10-11T20:15:00Z',
    notes: 'Initial prototype mission plan with verified geographic bounding box. Test coordinates labeled for prototype verification.',
    isSimulatedData: true
  },
  {
    id: 'MSN-2026-002',
    name: 'Silver Lake Flash Flood Assessment',
    type: 'flood_response',
    priority: 'critical',
    status: 'planned',
    description: 'Post-downpour embankment integrity survey and stranded camper reconnaissance.',
    searchAreaBoundary: [
      { lat: 46.7210, lng: -121.9100 },
      { lat: 46.7350, lng: -121.8950 },
      { lat: 46.7280, lng: -121.8700 },
      { lat: 46.7150, lng: -121.8900 }
    ],
    sectors: [],
    waypoints: [],
    assignedOperator: 'Lt. K. Vance',
    assignedTeamIds: ['TM-01'],
    startTime: '2026-10-12T08:00:00Z',
    lastUpdated: '2026-10-11T19:00:00Z',
    notes: 'Awaiting river gauge stabilization before deploying aerial sweep.',
    isSimulatedData: true
  }
];

const DEFAULT_TEAMS: SARTeam[] = [
  {
    id: 'TM-01',
    name: 'Sierra Aerial Recon',
    callsign: 'RECON-1',
    assignedMissionId: 'MSN-2026-001',
    leaderName: 'Chief J. Martinez',
    leaderContact: 'VHF Ch 16 / Sat-Comm #4',
    members: [
      { id: 'MB-1', name: 'J. Martinez', role: 'drone_pilot', callsign: 'RECON-LEAD' },
      { id: 'MB-2', name: 'D. Zhao', role: 'incident_commander', callsign: 'RECON-COMM' }
    ],
    checkInStatus: 'on_site',
    lastCheckInTime: '2026-10-11T21:10:00Z',
    currentTask: 'Conducting optical aerial sweep over Sector Alpha',
    sharedLocation: { lat: 46.8510, lng: -121.7510 },
    notes: 'Equipped with AEROVER Mobile Field Interface on ruggedized Android tablet.'
  },
  {
    id: 'TM-02',
    name: 'Cascade Alpine Ground SAR',
    callsign: 'GROUND-ALPHA',
    assignedMissionId: 'MSN-2026-001',
    leaderName: 'Capt. R. Sterling',
    leaderContact: 'VHF Ch 09',
    members: [
      { id: 'MB-3', name: 'R. Sterling', role: 'ground_searcher', callsign: 'GROUND-1' },
      { id: 'MB-4', name: 'Dr. E. Thorne', role: 'medic', callsign: 'MEDIC-1' },
      { id: 'MB-5', name: 'T. Harris', role: 'ground_searcher', callsign: 'GROUND-2' }
    ],
    checkInStatus: 'in_transit',
    lastCheckInTime: '2026-10-11T20:50:00Z',
    currentTask: 'Ascending Creek Basin trail with medical evacuation pack',
    sharedLocation: { lat: 46.8480, lng: -121.7420 },
    notes: 'GPS voluntarily broadcasted from team handheld VHF transponder.'
  },
  {
    id: 'TM-03',
    name: 'K9 Search Team Ranger',
    callsign: 'K9-BRAVO',
    assignedMissionId: 'MSN-2026-001',
    leaderName: 'Officer S. Gallagher & Bruno (K9)',
    leaderContact: 'VHF Ch 09',
    members: [
      { id: 'MB-6', name: 'S. Gallagher', role: 'dog_handler', callsign: 'K9-LEAD' }
    ],
    checkInStatus: 'on_site',
    lastCheckInTime: '2026-10-11T20:00:00Z',
    currentTask: 'Completed trailhead sweep, holding at Incident Post',
    sharedLocation: { lat: 46.8425, lng: -121.7410 },
    notes: 'Scent article verified at vehicle site.'
  }
];

const DEFAULT_ALERTS: SystemAlert[] = [
  {
    id: 'ALT-101',
    severity: 'informational',
    title: 'AEROVER Operations Ready',
    description: 'Command system initialized. Ready for mission monitoring and device configuration.',
    source: 'operator',
    timestamp: '2026-10-11T21:00:00Z',
    missionId: 'MSN-2026-001',
    acknowledged: true,
    resolved: true,
    operatorNotes: 'Routine system boot validation completed.',
    isSimulated: true
  },
  {
    id: 'ALT-102',
    severity: 'low',
    title: 'Hardware Controller Disconnected',
    description: 'Software-only prototype active. Physical flight controller not connected (as designed for initial prototype).',
    source: 'drone',
    timestamp: '2026-10-11T21:15:00Z',
    missionId: 'MSN-2026-001',
    acknowledged: true,
    resolved: false,
    operatorNotes: 'Hardware telemetry adapter is in standby/simulation adapter mode.',
    isSimulated: true
  },
  {
    id: 'ALT-103',
    severity: 'medium',
    title: 'Weather Warning: Ridge Fog Impending',
    description: 'Visibility drop predicted in Sector Alpha over the next 45 minutes.',
    source: 'network',
    timestamp: '2026-10-11T21:30:00Z',
    missionId: 'MSN-2026-001',
    acknowledged: false,
    resolved: false,
    isSimulated: true
  }
];

const DEFAULT_DETECTIONS: AIDetection[] = [
  {
    id: 'DET-2026-01',
    missionId: 'MSN-2026-001',
    timestamp: '2026-10-11T21:22:15Z',
    className: 'person',
    confidence: 0.88,
    boundingBox: { x: 0.42, y: 0.35, width: 0.16, height: 0.28 },
    modelName: 'YOLOv8-SAR-Adapter',
    modelVersion: 'v1.4.0-test',
    status: 'pending',
    coordinates: { lat: 46.8552, lng: -121.7481 },
    notes: 'Candidate human figure detected on rocky ridge shelf. High visibility jacket suspected. Pending operator visual review.',
    isSimulated: true
  },
  {
    id: 'DET-2026-02',
    missionId: 'MSN-2026-001',
    timestamp: '2026-10-11T20:45:00Z',
    className: 'vehicle',
    confidence: 0.94,
    boundingBox: { x: 0.15, y: 0.60, width: 0.25, height: 0.20 },
    modelName: 'YOLOv8-SAR-Adapter',
    modelVersion: 'v1.4.0-test',
    status: 'confirmed',
    coordinates: { lat: 46.8422, lng: -121.7412 },
    reviewedBy: 'Commander M. Reynolds',
    reviewedAt: '2026-10-11T20:50:00Z',
    notes: 'Confirmed stationary SUV at Trailhead parking lot corresponding to missing party license plate.',
    isSimulated: true
  },
  {
    id: 'DET-2026-03',
    missionId: 'MSN-2026-001',
    timestamp: '2026-10-11T19:30:10Z',
    className: 'smoke',
    confidence: 0.61,
    boundingBox: { x: 0.70, y: 0.20, width: 0.20, height: 0.25 },
    modelName: 'YOLOv8-SAR-Adapter',
    modelVersion: 'v1.4.0-test',
    status: 'rejected',
    coordinates: { lat: 46.8620, lng: -121.7310 },
    reviewedBy: 'Commander M. Reynolds',
    reviewedAt: '2026-10-11T19:40:00Z',
    notes: 'Operator review concluded this is low-altitude valley moisture condensation, not smoke or fire.',
    isSimulated: true
  }
];

const DEFAULT_OBSERVATIONS: SignalObservation[] = [
  {
    id: 'SIG-2026-01',
    missionId: 'MSN-2026-001',
    sourceType: 'authorized_radio_receiver',
    timestamp: '2026-10-11T20:18:00Z',
    frequencyMhz: 156.8,
    channel: 'VHF Marine Ch 16 (Emergency Call)',
    signalStrengthDbm: -72,
    reportedDeviceCount: 1,
    reportedBearingDeg: 42,
    bearingConfidence: 0.82,
    dataQuality: 'high',
    operatorNotes: 'Brief audible distress call received via authorized base station receiver. Directional antenna reported 42 deg azimuth.',
    authorizedSourceId: 'DEV-RCV-01',
    isSimulated: true
  },
  {
    id: 'SIG-2026-02',
    missionId: 'MSN-2026-001',
    sourceType: 'device_inventory_api',
    timestamp: '2026-10-11T19:00:00Z',
    frequencyMhz: 433.92,
    signalStrengthDbm: -95,
    reportedDeviceCount: 2,
    dataQuality: 'medium',
    operatorNotes: 'Authorized mountain repeater telemetry ping registered beacon beacon packet.',
    authorizedSourceId: 'DEV-REP-02',
    isSimulated: true
  }
];

const DEFAULT_DEVICES: DeviceConnection[] = [
  {
    id: 'DEV-CAM-01',
    name: 'DroidCam Wireless Mobile Camera',
    type: 'droidcam_video',
    endpointUrl: 'http://192.168.1.105:4747/video',
    status: 'disconnected',
    lastPingTime: '2026-10-11T21:00:00Z',
    lastErrorMessage: 'No live stream detected at endpoint. Connect phone via Wi-Fi or USB tether.',
    autoReconnect: false,
    driverVersion: 'DroidCam WebClient v1.2'
  },
  {
    id: 'DEV-CAM-02',
    name: 'Browser Local Webcam / Rear Camera',
    type: 'browser_webcam',
    endpointUrl: 'browser:navigator.mediaDevices',
    status: 'disconnected',
    autoReconnect: true,
    driverVersion: 'WebRTC MediaStream API'
  },
  {
    id: 'DEV-GPS-01',
    name: 'ATGM336H GPS Serial Receiver',
    type: 'atgm336h_gps',
    endpointUrl: '/dev/ttyUSB0 (Baud 9600)',
    status: 'unconfigured',
    lastErrorMessage: 'Hardware adapter awaiting physical USB-to-UART or WebSerial integration.',
    autoReconnect: false,
    driverVersion: 'NMEA 0183 Adapter v0.9'
  },
  {
    id: 'DEV-TEL-01',
    name: 'Radio Telemetry Transceiver (433MHz)',
    type: 'telemetry_radio',
    endpointUrl: 'serial:COM3',
    status: 'disconnected',
    lastErrorMessage: 'No physical flight controller link. Operating in software prototype mode.',
    autoReconnect: false
  },
  {
    id: 'DEV-AI-01',
    name: 'Edge AI Vision Service (YOLOv8)',
    type: 'ai_vision_server',
    endpointUrl: 'http://localhost:5000/v1/detect',
    status: 'disconnected',
    lastErrorMessage: 'Model inference server not responding. System using fallback vision pipeline.',
    autoReconnect: false
  },
  {
    id: 'DEV-API-01',
    name: 'AEROVER Python FastAPI Backend',
    type: 'fastapi_backend',
    endpointUrl: 'http://localhost:8000',
    status: 'disconnected',
    lastErrorMessage: 'Backend service offline. Operating in client-side repository persistence mode.',
    autoReconnect: true
  }
];

const DEFAULT_TELEMETRY: DroneTelemetry = {
  droneId: 'AEROVER-AIR-01 (Simulation)',
  linkStatus: 'disconnected',
  timestamp: new Date().toISOString(),
  batteryPercent: 84,
  batteryVoltage: 15.6,
  gpsValid: true,
  gpsSatellites: 14,
  latitude: 46.8540,
  longitude: -121.7450,
  altitudeMeters: 145.2,
  speedMps: 7.8,
  headingDeg: 128,
  pitchDeg: -2.1,
  rollDeg: 1.4,
  sensorHealth: {
    imu: true,
    barometer: true,
    compass: true,
    gps: true
  },
  lastHeartbeatMsAgo: 140,
  isSimulated: true,
  notes: 'Software simulation fixture. Physical drone controller not connected.'
};

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  }

  static getSettings(): AppSettings {
    return this.getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static updateSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  static getMissions(): Mission[] {
    return this.getItem(STORAGE_KEYS.MISSIONS, DEFAULT_MISSIONS);
  }

  static getMissionById(id: string): Mission | undefined {
    return this.getMissions().find(m => m.id === id);
  }

  static saveMission(mission: Mission): void {
    const list = this.getMissions();
    const index = list.findIndex(m => m.id === mission.id);
    if (index >= 0) {
      list[index] = mission;
    } else {
      list.unshift(mission);
    }
    this.setItem(STORAGE_KEYS.MISSIONS, list);
  }

  static deleteMission(id: string): void {
    const list = this.getMissions().filter(m => m.id !== id);
    this.setItem(STORAGE_KEYS.MISSIONS, list);
  }

  static getActiveMissionId(): string {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_MISSION_ID);
    if (saved) return saved;
    const missions = this.getMissions();
    return missions[0]?.id || 'MSN-2026-001';
  }

  static setActiveMissionId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MISSION_ID, id);
  }

  static getTeams(): SARTeam[] {
    return this.getItem(STORAGE_KEYS.TEAMS, DEFAULT_TEAMS);
  }

  static saveTeam(team: SARTeam): void {
    const list = this.getTeams();
    const idx = list.findIndex(t => t.id === team.id);
    if (idx >= 0) {
      list[idx] = team;
    } else {
      list.push(team);
    }
    this.setItem(STORAGE_KEYS.TEAMS, list);
  }

  static deleteTeam(id: string): void {
    const list = this.getTeams().filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.TEAMS, list);
  }

  static getAlerts(): SystemAlert[] {
    return this.getItem(STORAGE_KEYS.ALERTS, DEFAULT_ALERTS);
  }

  static saveAlert(alert: SystemAlert): void {
    const list = this.getAlerts();
    const idx = list.findIndex(a => a.id === alert.id);
    if (idx >= 0) {
      list[idx] = alert;
    } else {
      list.unshift(alert);
    }
    this.setItem(STORAGE_KEYS.ALERTS, list);
  }

  static acknowledgeAlert(id: string, notes?: string): void {
    const list = this.getAlerts();
    const alert = list.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      if (notes) alert.operatorNotes = notes;
      this.setItem(STORAGE_KEYS.ALERTS, list);
    }
  }

  static resolveAlert(id: string): void {
    const list = this.getAlerts();
    const alert = list.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      alert.acknowledged = true;
      this.setItem(STORAGE_KEYS.ALERTS, list);
    }
  }

  static getDetections(): AIDetection[] {
    return this.getItem(STORAGE_KEYS.DETECTIONS, DEFAULT_DETECTIONS);
  }

  static saveDetection(detection: AIDetection): void {
    const list = this.getDetections();
    const idx = list.findIndex(d => d.id === detection.id);
    if (idx >= 0) {
      list[idx] = detection;
    } else {
      list.unshift(detection);
    }
    this.setItem(STORAGE_KEYS.DETECTIONS, list);
  }

  static reviewDetection(id: string, status: 'confirmed' | 'rejected', reviewer: string, notes?: string): void {
    const list = this.getDetections();
    const item = list.find(d => d.id === id);
    if (item) {
      item.status = status;
      item.reviewedBy = reviewer;
      item.reviewedAt = new Date().toISOString();
      if (notes) item.notes = notes;
      this.setItem(STORAGE_KEYS.DETECTIONS, list);
    }
  }

  static getObservations(): SignalObservation[] {
    return this.getItem(STORAGE_KEYS.OBSERVATIONS, DEFAULT_OBSERVATIONS);
  }

  static saveObservation(obs: SignalObservation): void {
    const list = this.getObservations();
    const idx = list.findIndex(o => o.id === obs.id);
    if (idx >= 0) {
      list[idx] = obs;
    } else {
      list.unshift(obs);
    }
    this.setItem(STORAGE_KEYS.OBSERVATIONS, list);
  }

  static getDevices(): DeviceConnection[] {
    return this.getItem(STORAGE_KEYS.DEVICES, DEFAULT_DEVICES);
  }

  static updateDevice(device: DeviceConnection): void {
    const list = this.getDevices();
    const idx = list.findIndex(d => d.id === device.id);
    if (idx >= 0) {
      list[idx] = device;
    } else {
      list.push(device);
    }
    this.setItem(STORAGE_KEYS.DEVICES, list);
  }

  static deleteDevice(id: string): void {
    const list = this.getDevices().filter(d => d.id !== id);
    this.setItem(STORAGE_KEYS.DEVICES, list);
  }

  static getTelemetry(): DroneTelemetry {
    return this.getItem(STORAGE_KEYS.TELEMETRY, DEFAULT_TELEMETRY);
  }

  static updateTelemetry(telemetry: Partial<DroneTelemetry>): void {
    const current = this.getTelemetry();
    const updated = { ...current, ...telemetry, timestamp: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.TELEMETRY, updated);
  }

  static getReports(): MissionReport[] {
    return this.getItem(STORAGE_KEYS.REPORTS, []);
  }

  static saveReport(report: MissionReport): void {
    const list = this.getReports();
    const idx = list.findIndex(r => r.reportId === report.reportId);
    if (idx >= 0) {
      list[idx] = report;
    } else {
      list.unshift(report);
    }
    this.setItem(STORAGE_KEYS.REPORTS, list);
  }

  static resetToDefault(): void {
    this.setItem(STORAGE_KEYS.MISSIONS, DEFAULT_MISSIONS);
    this.setItem(STORAGE_KEYS.TEAMS, DEFAULT_TEAMS);
    this.setItem(STORAGE_KEYS.ALERTS, DEFAULT_ALERTS);
    this.setItem(STORAGE_KEYS.DETECTIONS, DEFAULT_DETECTIONS);
    this.setItem(STORAGE_KEYS.OBSERVATIONS, DEFAULT_OBSERVATIONS);
    this.setItem(STORAGE_KEYS.DEVICES, DEFAULT_DEVICES);
    this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.setItem(STORAGE_KEYS.TELEMETRY, DEFAULT_TELEMETRY);
  }
}
