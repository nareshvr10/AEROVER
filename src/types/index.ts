export type MissionType = 
  | 'missing_person' 
  | 'flood_response' 
  | 'landslide_response' 
  | 'forest_search' 
  | 'disaster_assessment' 
  | 'emergency_recon';

export type MissionPriority = 'low' | 'medium' | 'high' | 'critical';

export type MissionStatus = 'planned' | 'ready' | 'active' | 'paused' | 'completed' | 'aborted';

export interface GeoPoint {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface Waypoint {
  id: string;
  order: number;
  name: string;
  coordinates: GeoPoint;
  reached?: boolean;
  notes?: string;
}

export type SectorStatus = 'pending' | 'assigned' | 'in_progress' | 'completed';

export interface SearchSector {
  id: string;
  name: string;
  assignedTeamId?: string;
  status: SectorStatus;
  polygon: GeoPoint[]; // minimum 3 points
  areaSquareKm?: number;
  priority: MissionPriority;
  notes?: string;
}

export interface Mission {
  id: string;
  name: string;
  type: MissionType;
  priority: MissionPriority;
  status: MissionStatus;
  description: string;
  searchAreaBoundary: GeoPoint[];
  sectors: SearchSector[];
  waypoints: Waypoint[];
  assignedOperator: string;
  assignedTeamIds: string[];
  startTime?: string;
  completionTime?: string;
  lastUpdated: string;
  notes: string;
  isSimulatedData?: boolean;
}

export type DetectionClass = 'person' | 'vehicle' | 'smoke' | 'fire' | 'debris' | 'structure' | 'other';
export type DetectionStatus = 'pending' | 'confirmed' | 'rejected';

export interface BoundingBox {
  x: number; // 0 to 1 percentage
  y: number;
  width: number;
  height: number;
}

export interface AIDetection {
  id: string;
  missionId: string;
  timestamp: string;
  className: DetectionClass;
  confidence: number; // 0 to 1
  boundingBox?: BoundingBox;
  imageSnapshotUrl?: string;
  modelName: string;
  modelVersion: string;
  status: DetectionStatus;
  coordinates?: GeoPoint;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  isSimulated: boolean;
}

export type SignalSourceType = 
  | 'authorized_radio_receiver' 
  | 'device_inventory_api' 
  | 'operator_observation' 
  | 'df_bearing_adapter';

export interface SignalObservation {
  id: string;
  missionId: string;
  sourceType: SignalSourceType;
  timestamp: string;
  frequencyMhz?: number;
  channel?: string;
  signalStrengthDbm?: number;
  reportedDeviceCount?: number;
  reportedBearingDeg?: number;
  bearingConfidence?: number;
  dataQuality: 'high' | 'medium' | 'low';
  operatorNotes: string;
  authorizedSourceId: string;
  isSimulated: boolean;
}

export interface DroneTelemetry {
  droneId: string;
  linkStatus: 'connected' | 'disconnected' | 'connecting' | 'warning' | 'error';
  timestamp: string;
  batteryPercent?: number;
  batteryVoltage?: number;
  gpsValid: boolean;
  gpsSatellites?: number;
  latitude?: number;
  longitude?: number;
  altitudeMeters?: number;
  speedMps?: number;
  headingDeg?: number;
  pitchDeg?: number;
  rollDeg?: number;
  sensorHealth: {
    imu: boolean;
    barometer: boolean;
    compass: boolean;
    gps: boolean;
  };
  lastHeartbeatMsAgo: number;
  isSimulated: boolean;
  notes?: string;
}

export type TeamRole = 'ground_searcher' | 'drone_pilot' | 'medic' | 'incident_commander' | 'logistics' | 'dog_handler';
export type CheckInStatus = 'checked_in' | 'in_transit' | 'on_site' | 'checked_out' | 'standby';

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  callsign: string;
  contactAuthorized?: string;
}

export interface SARTeam {
  id: string;
  name: string;
  callsign: string;
  assignedMissionId?: string;
  leaderName: string;
  leaderContact?: string;
  members: TeamMember[];
  checkInStatus: CheckInStatus;
  lastCheckInTime: string;
  currentTask: string;
  sharedLocation?: GeoPoint; // Only intentionally shared authorized GPS
  notes?: string;
}

export type AlertSeverity = 'informational' | 'low' | 'medium' | 'high' | 'critical';
export type AlertSource = 'camera' | 'gps' | 'drone' | 'ai_service' | 'network' | 'operator' | 'telemetry';

export interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: AlertSource;
  timestamp: string;
  missionId?: string;
  acknowledged: boolean;
  resolved: boolean;
  operatorNotes?: string;
  isSimulated: boolean;
}

export type DeviceType = 
  | 'droidcam_video' 
  | 'browser_webcam' 
  | 'rtsp_ip_stream' 
  | 'atgm336h_gps' 
  | 'telemetry_radio' 
  | 'signal_receiver' 
  | 'ai_vision_server' 
  | 'fastapi_backend';

export interface DeviceConnection {
  id: string;
  name: string;
  type: DeviceType;
  endpointUrl: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error' | 'unconfigured';
  lastPingTime?: string;
  lastErrorMessage?: string;
  autoReconnect: boolean;
  driverVersion?: string;
  metadata?: Record<string, any>;
}

export type CoordinateFormat = 'decimal_degrees' | 'degrees_minutes_seconds';
export type DistanceUnit = 'metric_meters' | 'imperial_feet';

export interface AppSettings {
  theme: 'dark' | 'light';
  coordinateFormat: CoordinateFormat;
  distanceUnit: DistanceUnit;
  timeDisplay: 'utc' | 'local';
  cameraSourceUrl: string;
  activeCameraType: 'webcam' | 'droidcam' | 'test_feed';
  apiBackendUrl: string;
  dataRetentionDays: number;
  simulationMode: boolean; // clearly marks simulated data
}

export interface MissionReport {
  reportId: string;
  missionId: string;
  missionName: string;
  generatedAt: string;
  generatedBy: string;
  summary: string;
  searchType: string;
  startTime: string;
  completionTime?: string;
  assignedCommander: string;
  teamsInvolved: string[];
  totalSectors: number;
  completedSectors: number;
  validGpsPointsRecorded: number;
  reviewedDetectionsCount: number;
  confirmedTargetsCount: number;
  totalAlertsLogged: number;
  resolvedAlertsLogged: number;
  observationsLogged: number;
  finalOutcome: string;
  recommendations: string;
  limitationsDisclosure: string;
}
