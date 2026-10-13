
import { AIDetection } from '../types';
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

interface ModelHealthResponse {
  model?: string;
  version?: string;
}

interface ModelDetectionResponse {
  detections?: Array<{
    id?: string;
    missionId?: string;
    mission_id?: string;
    timestamp?: string;
    className?: string;
    class_name?: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    bbox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    imageSnapshotUrl?: string;
    modelName?: string;
    model_name?: string;
    modelVersion?: string;
    model_version?: string;
    status?: 'pending' | 'confirmed' | 'rejected';
    notes?: string;
  }>;
}

// Change this URL if your AI inference server uses another address.
const DEFAULT_ENDPOINT = 'http://localhost:5000';

export class DetectionAdapter {
  private static status: VisionModelStatus = {
    isConnected: false,
    modelName: 'YOLOv8-SAR-Recon',
    version: 'offline',
    endpointUrl: DEFAULT_ENDPOINT,
    errorMessage:
      'AI inference server is offline. Start the server before running detection.',
    isFallbackActive: true
  };

  static getModelStatus(): VisionModelStatus {
    return { ...this.status };
  }

  private static normalizeBaseUrl(endpoint?: string): string {
    const raw = (
      endpoint || this.status.endpointUrl || DEFAULT_ENDPOINT
    )
      .trim()
      .replace(/\/+$/, '');

    return raw.replace(/\/(health|predict|detect)$/i, '');
  }

  static async pingModelServer(
    endpoint?: string
  ): Promise<VisionModelStatus> {
    const baseUrl = this.normalizeBaseUrl(endpoint);
    const start = performance.now();

    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(4000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json().catch(() => ({}))) as
        ModelHealthResponse;

      this.status = {
        isConnected: true,
        modelName: data.model || 'YOLOv8-SAR-Recon',
        version: data.version || 'unknown',
        latencyMs: Math.round(performance.now() - start),
        lastPingTime: new Date().toISOString(),
        endpointUrl: baseUrl,
        isFallbackActive: false
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown connection error';

      this.status = {
        isConnected: false,
        modelName: 'YOLOv8-SAR-Recon',
        version: 'offline',
        endpointUrl: baseUrl,
        errorMessage:
          `AI server connection failed: ${message}. ` +
          'Check that the server is running and that CORS allows this dashboard.',
        isFallbackActive: true
      };
    }

    return { ...this.status };
  }

  static async runInference(
    imageDataUrl: string,
    missionId: string
  ): Promise<AIDetection[]> {
    if (!imageDataUrl.startsWith('data:image/')) {
      throw new Error(
        'A valid image snapshot is required before running AI inference.'
      );
    }

    const baseUrl = this.normalizeBaseUrl();

    if (!this.status.isConnected) {
      await this.pingModelServer(baseUrl);
    }

    if (!this.status.isConnected) {
      throw new Error(
        this.status.errorMessage ||
          'AI server is offline. No detection was performed.'
      );
    }

    const start = performance.now();

    let response: Response;

    try {
      response = await fetch(`${baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageDataUrl,
          mission_id: missionId
        }),
        signal: AbortSignal.timeout(20000)
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown network error';

      this.status = {
        ...this.status,
        isConnected: false,
        isFallbackActive: true,
        errorMessage: `Inference request failed: ${message}`
      };

      throw new Error(this.status.errorMessage);
    }

    if (!response.ok) {
      throw new Error(
        `Inference API returned HTTP ${response.status}. No detections were saved.`
      );
    }

    const payload =
      (await response.json()) as ModelDetectionResponse;

    if (!Array.isArray(payload.detections)) {
      throw new Error(
        'Invalid inference response: expected a detections array.'
      );
    }

    const now = new Date().toISOString();

    const detections: AIDetection[] = payload.detections.map(
      (item, index) => {
        const className = item.className || item.class_name;
        const box = item.boundingBox || item.bbox;

        if (!className || !Number.isFinite(item.confidence)) {
          throw new Error(
            `Invalid detection data at index ${index}.`
          );
        }

        if (
          !box ||
          ![box.x, box.y, box.width, box.height].every(Number.isFinite)
        ) {
          throw new Error(
            `Invalid bounding box at detection index ${index}.`
          );
        }

        const detection = {
          id: item.id || `DET-${Date.now()}-${index}`,
          missionId: item.missionId || item.mission_id || missionId,
          timestamp: item.timestamp || now,
          className,
          confidence: Math.max(0, Math.min(1, item.confidence)),
          boundingBox: {
            x: Math.max(0, Math.min(1, box.x)),
            y: Math.max(0, Math.min(1, box.y)),
            width: Math.max(0, Math.min(1, box.width)),
            height: Math.max(0, Math.min(1, box.height))
          },
          imageSnapshotUrl: item.imageSnapshotUrl || imageDataUrl,
          modelName:
            item.modelName ||
            item.model_name ||
            this.status.modelName,
          modelVersion:
            item.modelVersion ||
            item.model_version ||
            this.status.version,
          status: item.status || 'pending',
          notes:
            item.notes || 'Returned by the connected inference server.',
          isSimulated: false
        } as AIDetection;

        StorageService.saveDetection(detection);
        return detection;
      }
    );

    this.status = {
      ...this.status,
      isConnected: true,
      latencyMs: Math.round(performance.now() - start),
      lastPingTime: new Date().toISOString(),
      isFallbackActive: false,
      errorMessage: undefined
    };

    return detections;
  }
}
