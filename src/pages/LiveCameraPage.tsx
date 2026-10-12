import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Maximize, 
  Minimize, 
  RefreshCw, 
  Power, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Download, 
  Scan, 
  Smartphone,
  Eye,
  Info
} from 'lucide-react';
import { CameraAdapter } from '../services/cameraAdapter';
import { DetectionAdapter } from '../services/detectionAdapter';
import { AIDetection, Mission } from '../types';

interface LiveCameraPageProps {
  currentMission?: Mission;
  onNewDetection?: (detection: AIDetection) => void;
}

export const LiveCameraPage: React.FC<LiveCameraPageProps> = ({
  currentMission,
  onNewDetection
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [sourceType, setSourceType] = useState<'test_feed' | 'webcam' | 'droidcam'>('test_feed');
  const [droidCamUrl, setDroidCamUrl] = useState<string>('http://192.168.1.105:4747/video');
  const [isConnected, setIsConnected] = useState<boolean>(true); // default test feed is active
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cameraStats, setCameraStats] = useState<{ width: number; height: number; fps: number }>({
    width: 1920,
    height: 1080,
    fps: 30
  });

  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);
  const [aiOverlayEnabled, setAiOverlayEnabled] = useState<boolean>(true);
  const [analyzingSnapshot, setAnalyzingSnapshot] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Cleanup media tracks on unmount
  useEffect(() => {
    return () => {
      CameraAdapter.stopStream();
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      if (sourceType === 'webcam') {
        if (!videoRef.current) throw new Error('Video viewport not mounted.');
        const stats = await CameraAdapter.startWebcam(videoRef.current, 'environment');
        setCameraStats({ width: stats.width, height: stats.height, fps: stats.fps });
        setIsConnected(true);
      } else if (sourceType === 'droidcam') {
        CameraAdapter.stopStream();
        // DroidCam validation
        if (!droidCamUrl.startsWith('http://') && !droidCamUrl.startsWith('https://')) {
          throw new Error('DroidCam URL must include http:// or https:// protocol (e.g. http://192.168.1.105:4747/video or mjpegfeed).');
        }
        setIsConnected(true);
      } else {
        // Test feed
        CameraAdapter.stopStream();
        setIsConnected(true);
        setCameraStats({ width: 1920, height: 1080, fps: 30 });
      }
    } catch (err: any) {
      setIsConnected(false);
      setErrorMessage(err.message || 'Failed to establish camera feed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    CameraAdapter.stopStream();
    setIsConnected(false);
    setErrorMessage(null);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleCaptureSnapshot = async () => {
    let capturedUrl: string | null = null;

    if (sourceType === 'webcam' && videoRef.current) {
      capturedUrl = CameraAdapter.captureSnapshot(videoRef.current);
    } else {
      // Capture canvas representation from tactical image
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = '/src/assets/images/aerover_tactical_hero_1791780893966.jpg';
        await new Promise(r => { img.onload = r; });
        ctx.drawImage(img, 0, 0, 1280, 720);
        ctx.fillStyle = 'rgba(11, 20, 32, 0.75)';
        ctx.fillRect(0, 720 - 32, 1280, 32);
        ctx.fillStyle = '#4CAF50';
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillText(`AEROVER SNAPSHOT // ${new Date().toISOString()} // CASCADE RIDGE`, 16, 720 - 12);
        capturedUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    if (capturedUrl) {
      setLastSnapshot(capturedUrl);

      // Run detection test
      setAnalyzingSnapshot(true);
      setAiMessage('Analyzing frame with AI Vision adapter...');
      try {
        const detections = await DetectionAdapter.runInference(capturedUrl, currentMission?.id || 'MSN-2026-001');
        if (detections.length > 0 && onNewDetection) {
          onNewDetection(detections[0]);
          setAiMessage(`AI Vision identified candidate: ${detections[0].className.toUpperCase()} (${(detections[0].confidence * 100).toFixed(0)}% confidence). Added to review queue.`);
        }
      } catch (err: any) {
        setAiMessage('Inference adapter offline. Snapshot recorded without AI detections.');
      } finally {
        setAnalyzingSnapshot(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Source Bar */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Live Optical Camera Monitor</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Real-time aerial camera feed, DroidCam phone stream adapter, and tactical vision analysis.
          </p>
        </div>

        {/* Source Switcher & Connection Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#0B1420] border border-[#22262E] rounded p-1 text-xs">
            <button
              type="button"
              onClick={() => { setSourceType('test_feed'); handleDisconnect(); }}
              className={`px-3 py-1.5 rounded transition-colors ${
                sourceType === 'test_feed' ? 'bg-[#182A1F] text-[#4CAF50] font-semibold' : 'text-[#8A9AA5] hover:text-[#F2F5F7]'
              }`}
            >
              Test Feed (Simulated)
            </button>
            <button
              type="button"
              onClick={() => { setSourceType('webcam'); handleDisconnect(); }}
              className={`px-3 py-1.5 rounded transition-colors ${
                sourceType === 'webcam' ? 'bg-[#182A1F] text-[#4CAF50] font-semibold' : 'text-[#8A9AA5] hover:text-[#F2F5F7]'
              }`}
            >
              Browser Webcam
            </button>
            <button
              type="button"
              onClick={() => { setSourceType('droidcam'); handleDisconnect(); }}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                sourceType === 'droidcam' ? 'bg-[#182A1F] text-[#4CAF50] font-semibold' : 'text-[#8A9AA5] hover:text-[#F2F5F7]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>DroidCam (IP)</span>
            </button>
          </div>

          {isConnected ? (
            <button
              type="button"
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7F1D1D] hover:bg-[#DC2626] text-white text-xs font-semibold rounded transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded disabled:opacity-50 transition-colors"
            >
              {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
              <span>{isConnecting ? 'Connecting...' : 'Connect Stream'}</span>
            </button>
          )}
        </div>
      </div>

      {/* DroidCam Endpoint Configuration Field if DroidCam Selected */}
      {sourceType === 'droidcam' && (
        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#F2F5F7] uppercase font-mono flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#4CAF50]" />
              DroidCam Phone Video Stream Adapter Configuration
            </h2>
            <span className="text-[11px] text-[#8A9AA5] font-mono">Port default: 4747</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={droidCamUrl}
              onChange={e => setDroidCamUrl(e.target.value)}
              placeholder="http://192.168.1.105:4747/video (or /mjpegfeed)"
              className="flex-1 w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-3 py-2 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
            />
            <button
              type="button"
              onClick={handleConnect}
              className="w-full sm:w-auto px-4 py-2 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50]/60 text-xs font-bold rounded transition-colors whitespace-nowrap"
            >
              Test & Connect URL
            </button>
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded text-xs text-[#8A9AA5] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#F2F5F7] font-semibold">
              <Info className="w-4 h-4 text-[#38BDF8]" />
              <span>How DroidCam Integration Operates in Browser:</span>
            </div>
            <p>
              1. Open DroidCam on your Android smartphone connected to the same Wi-Fi network (or USB tethering).
            </p>
            <p>
              2. Note the Wi-Fi IP and Port displayed on your phone (e.g., <code className="text-[#4CAF50]">192.168.1.105:4747</code>).
            </p>
            <p>
              3. Modern browsers require HTTP streams to originate on the same origin or via an MJPEG bridge / WebRTC proxy if the dashboard is accessed over HTTPS (due to browser mixed-content security rules).
            </p>
          </div>
        </div>
      )}

      {/* Main Video Viewport */}
      <div
        ref={containerRef}
        className="relative bg-black rounded border border-[#22262E] overflow-hidden flex flex-col justify-center items-center min-h-[480px] max-h-[72vh]"
      >
        {/* Error State Banner */}
        {errorMessage && (
          <div className="absolute top-4 left-4 right-4 z-30 p-3 bg-[#7F1D1D]/90 border border-[#EF4444] rounded text-xs text-[#FEE2E2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FCA5A5] shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[#FCA5A5] hover:text-white font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Viewport content based on source */}
        {!isConnected ? (
          <div className="text-center p-8 space-y-3">
            <Camera className="w-12 h-12 text-[#8A9AA5]/40 mx-auto" />
            <div className="text-sm font-bold text-[#F2F5F7]">Camera Stream Disconnected</div>
            <p className="text-xs text-[#8A9AA5] max-w-sm mx-auto">
              Select a video source and click "Connect Stream" to initiate live video monitoring.
            </p>
            <button
              type="button"
              onClick={handleConnect}
              className="px-4 py-2 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded transition-colors"
            >
              Connect Now
            </button>
          </div>
        ) : sourceType === 'webcam' ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-contain max-h-[70vh]"
          />
        ) : sourceType === 'droidcam' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-[#0B1420]">
            <img
              src={droidCamUrl}
              alt="DroidCam Stream Feed"
              onError={() => {
                setErrorMessage(`Could not load video stream from ${droidCamUrl}. Verify phone IP and port, or use Browser Webcam.`);
              }}
              className="w-full h-full object-contain max-h-[70vh]"
            />
          </div>
        ) : (
          /* Simulated Tactical Reconnaissance Feed */
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src="/src/assets/images/aerover_tactical_hero_1791780893966.jpg"
              alt="Simulated Aerial Recon Feed"
              className="w-full h-full object-cover max-h-[70vh] brightness-90"
            />
          </div>
        )}

        {/* Tactical HUD Overlay (When Connected) */}
        {isConnected && (
          <>
            {/* Top Tactical Banner */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#0B1420]/80 backdrop-blur-sm border border-[#22262E] px-3 py-1.5 rounded text-[11px] font-mono text-[#4CAF50]">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
              <span>LIVE RECON FEED</span>
              <span className="text-[#8A9AA5]">|</span>
              <span className="text-[#F2F5F7]">
                {sourceType === 'droidcam' ? 'DROIDCAM STREAM' : sourceType === 'webcam' ? 'HARDWARE WEBCAM' : 'SIMULATION FEED'}
              </span>
            </div>

            {/* Top Right Resolution & FPS */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-[#0B1420]/80 backdrop-blur-sm border border-[#22262E] px-3 py-1.5 rounded text-[11px] font-mono text-[#8A9AA5]">
              <span>{cameraStats.width}x{cameraStats.height}</span>
              <span className="text-[#22262E]">|</span>
              <span className="text-[#4CAF50]">{cameraStats.fps} FPS</span>
            </div>

            {/* Center Reticle / Crosshair */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-24 h-24 border border-[#4CAF50]/40 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full" />
              </div>
            </div>

            {/* AI Vision Bounding Box Overlay if enabled */}
            {aiOverlayEnabled && (
              <div className="absolute top-[32%] left-[45%] w-[18%] h-[24%] border-2 border-[#FF4B4B] bg-[#FF4B4B]/15 pointer-events-none rounded-xs">
                <div className="absolute -top-6 left-0 bg-[#FF4B4B] text-white px-1.5 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
                  <Scan className="w-3 h-3" />
                  <span>TARGET: PERSON 88%</span>
                </div>
              </div>
            )}

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between bg-[#0B1420]/85 backdrop-blur-sm border border-[#22262E] px-4 py-2 rounded text-xs">
              <div className="flex items-center gap-4 text-[#8A9AA5] font-mono text-[11px]">
                <span>POS: 46.8552° N, 121.7481° W</span>
                <span className="hidden sm:inline">ALT: 145m</span>
                <span className="hidden sm:inline">SPD: 7.8 m/s</span>
              </div>

              {/* Viewport Control Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAiOverlayEnabled(prev => !prev)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                    aiOverlayEnabled
                      ? 'bg-[#182A1F] text-[#4CAF50] border-[#4CAF50]/60'
                      : 'bg-[#111B25] text-[#8A9AA5] border-[#22262E]'
                  }`}
                  title="Toggle AI Detection Overlays"
                >
                  AI Overlay: {aiOverlayEnabled ? 'ON' : 'OFF'}
                </button>

                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  disabled={analyzingSnapshot}
                  className="px-3 py-1 bg-[#4CAF50] hover:bg-[#388E3C] text-[#0B1420] text-xs font-bold rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>{analyzingSnapshot ? 'Analyzing...' : 'Snapshot & AI Scan'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="p-1.5 bg-[#111B25] hover:bg-[#182A1F] text-[#8A9AA5] hover:text-white rounded border border-[#22262E] transition-colors"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* AI Inference Feedback Notice */}
      {aiMessage && (
        <div className="p-3 bg-[#182A1F] border border-[#4CAF50] rounded text-xs text-[#F2F5F7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4CAF50] shrink-0" />
            <span>{aiMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAiMessage(null)}
            className="text-[#8A9AA5] hover:text-white font-mono text-xs ml-3"
          >
            Clear
          </button>
        </div>
      )}

      {/* Recent Snapshot Preview Strip */}
      {lastSnapshot && (
        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              LATEST CAPTURED SNAPSHOT
            </h3>
            <a
              href={lastSnapshot}
              download={`AEROVER-SNAPSHOT-${Date.now()}.jpg`}
              className="text-xs text-[#4CAF50] hover:underline flex items-center gap-1 font-mono"
            >
              <Download className="w-3.5 h-3.5" /> Download JPEG
            </a>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={lastSnapshot}
              alt="Latest Tactical Snapshot"
              className="w-48 h-28 object-cover rounded border border-[#22262E]"
            />
            <div className="text-xs text-[#8A9AA5] space-y-1">
              <div><strong className="text-[#F2F5F7]">Timestamp:</strong> {new Date().toISOString()}</div>
              <div><strong className="text-[#F2F5F7]">Optical Resolution:</strong> 1280x720 JPEG</div>
              <div><strong className="text-[#F2F5F7]">Mission Target ID:</strong> {currentMission?.id || 'MSN-2026-001'}</div>
              <p className="text-[11px] text-[#4CAF50]">Imprinted with GPS coordinate metadata and operational UTC timestamp.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
