import { AIDetection, DetectionClass } from '../types';
import { StorageService } from './storage';

export interface VisionModelStatus {
  isConnected: boolean;
  modelName: string;
  version: string;
  latencyMs?: number;
  lastPingTime?: string;
  endpointUrl: string;
  errorMessage?: string;
  isFallbackActive: boolean;
}

export class DetectionAdapter {
  private static status: VisionModelStatus = {
    isConnected: false,
    modelName: 'YOLOv8-SAR-Recon',
    version: '8.2.0-fp16',
    endpointUrl: 'http://localhost:5000/v1/detect',
    errorMessage: 'No local edge inference server detected at port 5000. Standby adapter active.',
    isFallbackActive: true
  };

  static getModelStatus(): VisionModelStatus {
    return { ...this.status };
  }

  static async pingModelServer(endpoint?: string): Promise<VisionModelStatus> {
    const url = endpoint || this.status.endpointUrl;
    const start = performance.now();
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        this.status = {
          isConnected: true,
          modelName: data.model || 'YOLOv8-SAR-Recon',
          version: data.version || '8.2.0',
          latencyMs: Math.round(performance.now() - start),
          lastPingTime: new Date().toISOString(),
          endpointUrl: url,
          isFallbackActive: false
        };
      } else {
        throw new Error(`HTTP ${res.status}: Server reported unhealthy`);
      }
    } catch (e: any) {
      this.status = {
        isConnected: false,
        modelName: 'YOLOv8-SAR-Recon',
        version: '8.2.0-standby',
        endpointUrl: url,
        errorMessage: `Connection failed: ${e.message || 'Server unreachable'}. Verify edge server or container is running.`,
        isFallbackActive: true
      };
    }
    return { ...this.status };
  }

  /**
   * Run test or live inference on an image snapshot data URL.
   * If remote edge model is offline, can run prototype test inference with clear simulation flags.
   */
  static async runInference(imageDataUrl: string, missionId: string): Promise<AIDetection[]> {
    if (this.status.isConnected) {
      try {
        const res = await fetch(`${this.status.endpointUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageDataUrl, mission_id: missionId })
        });
        if (res.ok) {
          const results = await res.json();
          return results.detections.map((d: any) => ({
            ...d,
            isSimulated: false
          }));
        }
      } catch (err) {
        console.warn('Live inference failed, falling back to simulated test run:', err);
      }
    }

    // In prototype/simulation mode: Generate a verified test detection record explicitly marked as simulated
    const testClasses: DetectionClass[] = ['person', 'vehicle', 'smoke'];
    const selectedClass = testClasses[Math.floor(Math.random() * testClasses.length)];
    const confidence = parseFloat((0.75 + Math.random() * 0.22).toFixed(2));

    const simulatedDetection: AIDetection = {
      id: `DET-TEST-${Date.now().toString().slice(-4)}`,
      missionId,
      timestamp: new Date().toISOString(),
      className: selectedClass,
      confidence,
      boundingBox: {
        x: 0.3 + Math.random() * 0.3,
        y: 0.25 + Math.random() * 0.3,
        width: 0.15 + Math.random() * 0.1,
        height: 0.2 + Math.random() * 0.1
      },
      imageSnapshotUrl: imageDataUrl,
      modelName: `${this.status.modelName} (Prototype Test)`,
      modelVersion: this.status.version,
      status: 'pending',
      notes: `Test candidate ${selectedClass} generated during camera optical snapshot test. Verified simulation fixture.`,
      isSimulated: true
    };

    StorageService.saveDetection(simulatedDetection);
    return [simulatedDetection];
  }
}
