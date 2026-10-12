import { StorageService } from './storage';
import { 
  Mission, 
  SystemAlert, 
  DeviceConnection, 
  DroneTelemetry, 
  AIDetection, 
  SignalObservation, 
  SARTeam, 
  MissionReport,
  GeoPoint 
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  source: 'remote_backend' | 'local_storage';
  error?: string;
}

export class ApiAdapter {
  private static getBaseUrl(): string {
    return StorageService.getSettings().apiBackendUrl || 'http://localhost:8000';
  }

  static async checkBackendHealth(): Promise<{ available: boolean; latencyMs?: number; version?: string }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.getBaseUrl()}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        return { available: true, latencyMs: Math.round(performance.now() - start), version: json.version || '1.0.0' };
      }
      return { available: false };
    } catch {
      return { available: false };
    }
  }

  static async getMissions(): Promise<ApiResponse<Mission[]>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/missions`, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {
      // Graceful fallback to local repository
    }
    return { success: true, data: StorageService.getMissions(), source: 'local_storage' };
  }

  static async saveMission(mission: Mission): Promise<ApiResponse<Mission>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mission)
      });
      if (res.ok) {
        const data = await res.json();
        StorageService.saveMission(data);
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {
      // Local fallback
    }
    StorageService.saveMission(mission);
    return { success: true, data: mission, source: 'local_storage' };
  }

  static async getAlerts(): Promise<ApiResponse<SystemAlert[]>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/alerts`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {
      // Fallback
    }
    return { success: true, data: StorageService.getAlerts(), source: 'local_storage' };
  }

  static async getTelemetry(): Promise<ApiResponse<DroneTelemetry>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/telemetry/latest`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {
      // Fallback
    }
    return { success: true, data: StorageService.getTelemetry(), source: 'local_storage' };
  }

  static async getLatestGps(): Promise<ApiResponse<{ point: GeoPoint; validity: boolean; accuracyMeters?: number; source: string; timestamp: string }>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/gps/latest`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {
      // Fallback
    }
    const telem = StorageService.getTelemetry();
    return {
      success: true,
      data: {
        point: { lat: telem.latitude || 46.8540, lng: telem.longitude || -121.7450, altitude: telem.altitudeMeters },
        validity: telem.gpsValid,
        accuracyMeters: telem.gpsValid ? 3.2 : undefined,
        source: telem.isSimulated ? 'Simulation Adapter' : 'Integrated GPS',
        timestamp: telem.timestamp
      },
      source: 'local_storage'
    };
  }

  static async getDetections(): Promise<ApiResponse<AIDetection[]>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/detections`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {}
    return { success: true, data: StorageService.getDetections(), source: 'local_storage' };
  }

  static async getObservations(): Promise<ApiResponse<SignalObservation[]>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/observations`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {}
    return { success: true, data: StorageService.getObservations(), source: 'local_storage' };
  }

  static async getTeams(): Promise<ApiResponse<SARTeam[]>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/teams`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {}
    return { success: true, data: StorageService.getTeams(), source: 'local_storage' };
  }

  static async getDevices(): Promise<ApiResponse<DeviceConnection[]>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/devices`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {}
    return { success: true, data: StorageService.getDevices(), source: 'local_storage' };
  }

  static async getReports(): Promise<ApiResponse<MissionReport[]>> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/reports`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'remote_backend' };
      }
    } catch {}
    return { success: true, data: StorageService.getReports(), source: 'local_storage' };
  }
}
