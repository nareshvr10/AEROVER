export interface CameraStreamState {
  isConnected: boolean;
  isConnecting: boolean;
  sourceType: 'webcam' | 'droidcam' | 'test_feed';
  streamUrl?: string;
  error?: string;
  resolution?: { width: number; height: number };
  frameRate?: number;
}

export class CameraAdapter {
  private static mediaStream: MediaStream | null = null;

  static async startWebcam(
    videoElement: HTMLVideoElement,
    preferredFacingMode: 'environment' | 'user' = 'environment'
  ): Promise<{ stream: MediaStream; width: number; height: number; fps: number }> {
    this.stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser does not support navigator.mediaDevices.getUserMedia in this context.');
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: preferredFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.mediaStream = stream;
      videoElement.srcObject = stream;
      await videoElement.play();

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();

      return {
        stream,
        width: settings.width || videoElement.videoWidth || 1280,
        height: settings.height || videoElement.videoHeight || 720,
        fps: settings.frameRate || 30
      };
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Camera access permission was denied by the operator or browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No compatible video camera hardware was found on this device.');
      } else {
        throw new Error(`Failed to initialize camera: ${err.message || 'Unknown device error'}`);
      }
    }
  }

  static stopStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      this.mediaStream = null;
    }
  }

  static captureSnapshot(
    sourceElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): string | null {
    try {
      const canvas = document.createElement('canvas');
      let width = 640;
      let height = 360;

      if (sourceElement instanceof HTMLVideoElement) {
        width = sourceElement.videoWidth || 640;
        height = sourceElement.videoHeight || 360;
      } else if (sourceElement instanceof HTMLImageElement) {
        width = sourceElement.naturalWidth || 640;
        height = sourceElement.naturalHeight || 360;
      } else if (sourceElement instanceof HTMLCanvasElement) {
        width = sourceElement.width;
        height = sourceElement.height;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(sourceElement, 0, 0, width, height);

      // Add tactical timestamp imprint on snapshot
      ctx.fillStyle = 'rgba(11, 20, 32, 0.75)';
      ctx.fillRect(0, height - 28, width, 28);
      ctx.fillStyle = '#4CAF50';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(`AEROVER SNAPSHOT // ${new Date().toISOString()} // UTC`, 14, height - 10);

      return canvas.toDataURL('image/jpeg', 0.92);
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
      return null;
    }
  }
}
