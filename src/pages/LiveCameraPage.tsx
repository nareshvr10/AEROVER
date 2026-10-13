

import React, { useState, useRef, useEffect } from 'react';



import {

  Camera,

  Maximize,

  Minimize,

  RefreshCw,

  Power,

  AlertCircle,

  CheckCircle2,

  Download,

  Scan,

  Smartphone,

  Info,

} from 'lucide-react';



import { CameraAdapter } from '../services/cameraAdapter';

import { DetectionAdapter } from '../services/detectionAdapter';

import { AIDetection, Mission } from '../types';



interface LiveCameraPageProps {

  currentMission?: Mission;

  onNewDetection?: (detection: AIDetection) => void;

}



type CameraSource = 'test_feed' | 'webcam' | 'droidcam';



export const LiveCameraPage: React.FC<LiveCameraPageProps> = ({

  currentMission,

  onNewDetection,

}) => {

  const videoRef = useRef<HTMLVideoElement>(null);

  const droidCamImageRef = useRef<HTMLImageElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);



  const [sourceType, setSourceType] = useState<CameraSource>('test_feed');

  const [droidCamUrl, setDroidCamUrl] = useState(

    'http://192.168.1.105:4747/video'

  );



  const [isConnected, setIsConnected] = useState(true);

  const [isConnecting, setIsConnecting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);



  const [cameraStats, setCameraStats] = useState({

    width: 1920,

    height: 1080,

    fps: 30,

  });



  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);

  const [aiOverlayEnabled, setAiOverlayEnabled] = useState(false);

  const [analyzingSnapshot, setAnalyzingSnapshot] = useState(false);

  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const [snapshotTimestamp, setSnapshotTimestamp] = useState<string | null>(

    null

  );



  useEffect(() => {

    const handleFullscreenChange = () => {

      setIsFullscreen(Boolean(document.fullscreenElement));

    };



    document.addEventListener('fullscreenchange', handleFullscreenChange);



    return () => {

      document.removeEventListener(

        'fullscreenchange',

        handleFullscreenChange

      );

    };

  }, []);



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
        // Keep the webcam branch rendered while connecting, then wait for React
        // to commit the <video> element before reading its ref.
        setIsConnected(true);
        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => resolve());
        });

        const video = videoRef.current;
        if (!video) {
          throw new Error(
            'Webcam video element is not mounted. Retry the connection.'
          );
        }

        const stats = await CameraAdapter.startWebcam(video, 'environment');



        setCameraStats({

          width: stats.width,

          height: stats.height,

          fps: stats.fps,

        });



        setIsConnected(true);

      } else if (sourceType === 'droidcam') {
        CameraAdapter.stopStream();

        const url = droidCamUrl.trim();
        if (!/^https?:\/\/.+/i.test(url)) {
          throw new Error(
            'Enter a valid DroidCam URL beginning with http:// or https://.'
          );
        }

        // Mount the image element; onLoad/onError will report stream status.
        setCameraStats({ width: 0, height: 0, fps: 0 });
        setIsConnected(true);
      } else {
        CameraAdapter.stopStream();
        setCameraStats({ width: 1920, height: 1080, fps: 30 });
        setIsConnected(true);
      }

    } catch (err) {

      setIsConnected(false);

      setErrorMessage(

        err instanceof Error

          ? err.message

          : 'Failed to establish the camera feed.'

      );

    } finally {

      setIsConnecting(false);

    }

  };



  const handleDisconnect = () => {

    CameraAdapter.stopStream();

    setIsConnected(false);

    setErrorMessage(null);

  };



  const handleSelectSource = (source: CameraSource) => {

    CameraAdapter.stopStream();

    setSourceType(source);

    setIsConnected(false);

    setErrorMessage(null);

    setAiMessage(null);

  };



  const handleToggleFullscreen = () => {

    if (!containerRef.current) return;



    if (!document.fullscreenElement) {

      containerRef.current.requestFullscreen().catch((err) => {

        console.warn('Fullscreen error:', err);

        setErrorMessage('Could not enter fullscreen mode.');

      });

    } else {

      document.exitFullscreen().catch(() => {

        setErrorMessage('Could not exit fullscreen mode.');

      });

    }

  };



  const handleCaptureSnapshot = async () => {

    if (!isConnected) {

      setAiMessage('Connect a camera before capturing a snapshot.');

      return;

    }



    let capturedUrl: string | null = null;



    try {

      if (sourceType === 'webcam') {

        const video = videoRef.current;



        if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {

          throw new Error('The webcam has no frame ready to capture.');

        }



        capturedUrl = CameraAdapter.captureSnapshot(video);

      } else if (sourceType === 'droidcam') {

        const img = droidCamImageRef.current;



        if (!img || !img.complete || img.naturalWidth === 0) {

          throw new Error(

            'The DroidCam frame is not ready. Wait for the camera feed.'

          );

        }



        const canvas = document.createElement('canvas');

        canvas.width = img.naturalWidth;

        canvas.height = img.naturalHeight;



        const context = canvas.getContext('2d');



        if (!context) {

          throw new Error('Could not initialize the snapshot canvas.');

        }



        // Cross-origin restrictions may prevent this operation.

        // Do not disable browser security if it fails.

        context.drawImage(img, 0, 0, canvas.width, canvas.height);



        capturedUrl = canvas.toDataURL('image/jpeg', 0.9);

      } else {

        throw new Error(

          'The test feed is not a real camera. Select DroidCam or Browser Webcam to capture actual footage.'

        );

      }



      if (!capturedUrl) {

        throw new Error('Snapshot capture failed.');

      }



      const timestamp = new Date().toISOString();



      setLastSnapshot(capturedUrl);

      setSnapshotTimestamp(timestamp);

      setAiMessage('Real camera frame captured. Starting detection analysis...');

      setAnalyzingSnapshot(true);



      try {

        const detections = await DetectionAdapter.runInference(

          capturedUrl,

          currentMission?.id || 'MSN-2026-001'

        );



        if (detections.length > 0) {

          detections.forEach((detection) => {

            onNewDetection?.(detection);

          });



          const first = detections[0];



          setAiMessage(

            `Detection adapter returned ${detections.length} result(s). First result: ${first.className}, ${(first.confidence * 100).toFixed(0)}% confidence. Verify results before treating them as confirmed detections.`

          );

        } else {

          setAiMessage(

            'Snapshot captured. The detection adapter returned no detections.'

          );

        }

      } catch (err) {

        console.error('Detection adapter error:', err);



        setAiMessage(

          'Snapshot saved, but AI analysis failed. Check the detection adapter configuration.'

        );

      } finally {

        setAnalyzingSnapshot(false);

      }

    } catch (err) {

      console.error('Snapshot capture error:', err);



      const message =

        err instanceof Error ? err.message : 'Snapshot capture failed.';



      setAiMessage(

        message.includes('SecurityError') ||

          message.toLowerCase().includes('tainted')

          ? 'The browser blocked snapshot access because of cross-origin restrictions. A compatible local stream proxy may be required.'

          : message

      );

    }

  };



  return (

    <div className="space-y-6">

      {/* Header and camera source controls */}

      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <Camera className="w-5 h-5 text-[#4CAF50]" />

            <h1 className="text-base font-bold text-[#F2F5F7]">

              Live Optical Camera Monitor

            </h1>

          </div>



          <p className="text-xs text-[#8A9AA5] mt-0.5">

            Live camera monitoring and snapshot-based vision analysis.

          </p>

        </div>



        <div className="flex flex-wrap items-center gap-3">

          <div className="flex items-center bg-[#0B1420] border border-[#22262E] rounded p-1 text-xs">

            {(

              [

                ['test_feed', 'Test Feed'],

                ['webcam', 'Browser Webcam'],

                ['droidcam', 'DroidCam (IP)'],

              ] as const

            ).map(([source, label]) => (

              <button

                key={source}

                type="button"

                onClick={() => handleSelectSource(source)}

                className={`px-3 py-1.5 rounded transition-colors ${

                  sourceType === source

                    ? 'bg-[#182A1F] text-[#4CAF50] font-semibold'

                    : 'text-[#8A9AA5] hover:text-[#F2F5F7]'

                }`}

              >

                {source === 'droidcam' && (

                  <Smartphone className="w-3.5 h-3.5 inline mr-1" />

                )}

                {label}

              </button>

            ))}

          </div>



          {isConnected ? (

            <button

              type="button"

              onClick={handleDisconnect}

              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7F1D1D] hover:bg-[#DC2626] text-white text-xs font-semibold rounded"

            >

              <Power className="w-3.5 h-3.5" />

              Disconnect

            </button>

          ) : (

            <button

              type="button"

              onClick={handleConnect}

              disabled={isConnecting}

              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded disabled:opacity-50"

            >

              <Power className="w-3.5 h-3.5" />

              {isConnecting ? 'Connecting...' : 'Connect Stream'}

            </button>

          )}

        </div>

      </div>



      {/* DroidCam configuration */}

      {sourceType === 'droidcam' && (

        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded space-y-3">

          <h2 className="text-xs font-bold text-[#F2F5F7] uppercase font-mono flex items-center gap-2">

            <Smartphone className="w-4 h-4 text-[#4CAF50]" />

            DroidCam Phone Video Stream Configuration

          </h2>



          <div className="flex flex-col sm:flex-row items-center gap-3">

            <input

              type="text"

              value={droidCamUrl}

              onChange={(event) => setDroidCamUrl(event.target.value)}

              placeholder="http://PHONE-IP:4747/video"

              className="flex-1 w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-3 py-2 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"

            />



            <button

              type="button"

              onClick={handleConnect}

              disabled={isConnecting}

              className="w-full sm:w-auto px-4 py-2 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50]/60 text-xs font-bold rounded disabled:opacity-50"

            >

              Test &amp; Connect URL

            </button>

          </div>



          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded text-xs text-[#8A9AA5] space-y-1.5">

            <div className="flex items-center gap-1.5 text-[#F2F5F7] font-semibold">

              <Info className="w-4 h-4 text-[#38BDF8]" />

              DroidCam connection checklist

            </div>

            <p>1. Keep DroidCam running on your phone.</p>

            <p>2. Make sure the phone and computer can reach each other over the network.</p>

            <p>3. Use the exact stream endpoint that displays the live feed in your browser.</p>

            <p>4. An HTTPS dashboard may block an HTTP camera stream. A compatible secure proxy may be needed.</p>

          </div>

        </div>

      )}



      {/* Main camera viewport */}

      <div

        ref={containerRef}

        className="relative bg-black rounded border border-[#22262E] overflow-hidden flex flex-col justify-center items-center min-h-[480px] max-h-[72vh]"

      >

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



        {!isConnected && sourceType !== 'webcam' ? (

          <div className="text-center p-8 space-y-3">

            <Camera className="w-12 h-12 text-[#8A9AA5]/40 mx-auto" />

            <div className="text-sm font-bold text-[#F2F5F7]">

              Camera Stream Disconnected

            </div>

            <p className="text-xs text-[#8A9AA5] max-w-sm mx-auto">

              Select a source and connect to start camera monitoring.

            </p>



            <button

              type="button"

              onClick={handleConnect}

              disabled={isConnecting}

              className="px-4 py-2 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded disabled:opacity-50"

            >

              {isConnecting ? 'Connecting...' : 'Connect Now'}

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

              ref={droidCamImageRef}

              src={droidCamUrl}

              alt="Live DroidCam Feed"

              onLoad={(event) => {

                const img = event.currentTarget;



                setCameraStats({

                  width: img.naturalWidth,

                  height: img.naturalHeight,

                  fps: 0,

                });



                setErrorMessage(null);

              }}

              onError={() => {

                setIsConnected(false);

                setErrorMessage(

                  'Could not load the DroidCam feed. Check the phone, IP address, port, and stream URL.'

                );

              }}

              className="w-full h-full object-contain max-h-[70vh]"

            />

          </div>

        ) : (

          <div className="relative w-full h-full flex items-center justify-center">

            <img

              src="/src/assets/images/aerover_tactical_hero_1791780893966.jpg"

              alt="AEROVER Test Feed"

              className="w-full h-full object-cover max-h-[70vh] brightness-90"

            />

            <div className="absolute bottom-16 bg-[#0B1420]/80 px-3 py-2 rounded text-xs text-[#F2F5F7]">

              Test image only — not live camera footage.

            </div>

          </div>

        )}



        {isConnected && (

          <>

            {/* Camera status banner */}

            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#0B1420]/80 backdrop-blur-sm border border-[#22262E] px-3 py-1.5 rounded text-[11px] font-mono text-[#4CAF50]">

              <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />

              <span>CAMERA CONNECTED</span>

              <span className="text-[#8A9AA5]">|</span>

              <span className="text-[#F2F5F7]">

                {sourceType === 'droidcam'

                  ? 'DROIDCAM'

                  : sourceType === 'webcam'

                    ? 'BROWSER WEBCAM'

                    : 'TEST IMAGE'}

              </span>

            </div>



            {/* Actual reported dimensions */}

            <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-[#0B1420]/80 backdrop-blur-sm border border-[#22262E] px-3 py-1.5 rounded text-[11px] font-mono text-[#8A9AA5]">

              <span>

                {cameraStats.width} × {cameraStats.height}

              </span>

              <span className="text-[#22262E]">|</span>

              <span className="text-[#4CAF50]">

                {cameraStats.fps > 0

                  ? `${cameraStats.fps} FPS`

                  : 'FPS unavailable'}

              </span>

            </div>



            {/* Center reticle */}

            <div className="absolute inset-0 pointer-events-none flex items-center *justify-center">*

              <div className="w-24 h-24 border border-[#4CAF50]/40 rounded-full flex items-center justify-center">

                <div className="w-2 h-2 bg-[#4CAF50] rounded-full" />

              </div>

            </div>



            {/* No fabricated detection boxes */}

            {aiOverlayEnabled && (

              <div className="absolute top-16 left-3 z-20 bg-[#0B1420]/85 border border-[#22262E] rounded px-3 py-2 text-[11px] font-mono text-[#8A9AA5]">

                <Scan className="w-3.5 h-3.5 inline mr-1 text-[#38BDF8]" />

                Detection overlay enabled — boxes appear only when real model

                coordinates are available.

              </div>

            )}



            {/* Bottom controls */}

            <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 bg-[#0B1420]/85 backdrop-blur-sm border border-[#22262E] px-4 py-2 rounded">

              <div className="text-[#8A9AA5] font-mono text-[11px]">

                {sourceType === 'test_feed'

                  ? 'TEST IMAGE — NO LIVE POSITION'

                  : 'POSITION: GPS SOURCE NOT CONNECTED'}

              </div>



              <div className="flex items-center gap-2">

                <button

                  type="button"

                  onClick={() => setAiOverlayEnabled((previous) => !previous)}

                  className={`px-2.5 py-1 rounded text-xs font-mono border ${

                    aiOverlayEnabled

                      ? 'bg-[#182A1F] text-[#4CAF50] border-[#4CAF50]/60'

                      : 'bg-[#111B25] text-[#8A9AA5] border-[#22262E]'

                  }`}

                  title="Toggle AI overlay information"

                >

                  AI Overlay: {aiOverlayEnabled ? 'ON' : 'OFF'}

                </button>



                <button

                  type="button"

                  onClick={handleCaptureSnapshot}

                  disabled={analyzingSnapshot}

                  className="px-3 py-1 bg-[#4CAF50] hover:bg-[#388E3C] text-[#0B1420] text-xs font-bold rounded flex items-center gap-1.5 disabled:opacity-50"

                >

                  <Scan className="w-3.5 h-3.5" />

                  {analyzingSnapshot ? 'Analyzing...' : 'Snapshot & AI Scan'}

                </button>



                <button

                  type="button"

                  onClick={handleToggleFullscreen}

                  className="p-1.5 bg-[#111B25] hover:bg-[#182A1F] text-[#8A9AA5] hover:text-white rounded border border-[#22262E]"

                  title="Toggle fullscreen"

                >

                  {isFullscreen ? (

                    <Minimize className="w-4 h-4" />

                  ) : (

                    <Maximize className="w-4 h-4" />

                  )}

                </button>

              </div>

            </div>

          </>

        )}

      </div>



      {/* AI feedback */}

      {aiMessage && (

        <div className="p-3 bg-[#111B25] border border-[#22262E] rounded text-xs text-[#F2F5F7] flex items-start justify-between gap-3">

          <div className="flex items-start gap-2">

            {aiMessage.toLowerCase().includes('failed') ||

            aiMessage.toLowerCase().includes('blocked') ||

            aiMessage.toLowerCase().includes('error') ? (

              <AlertCircle className="w-4 h-4 text-[#FCA5A5] shrink-0" />

            ) : (

              <CheckCircle2 className="w-4 h-4 text-[#4CAF50] shrink-0" />

            )}

            <span>{aiMessage}</span>

          </div>



          <button

            type="button"

            onClick={() => setAiMessage(null)}

            className="text-[#8A9AA5] hover:text-white font-mono text-xs"

          >

            Clear

          </button>

        </div>

      )}



      {/* Latest captured frame */}

      {lastSnapshot && (

        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded">

          <div className="flex items-center justify-between pb-3 border-b border-[#22262E] gap-3">

            <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">

              Latest Captured Snapshot

            </h3>



            <a

              href={lastSnapshot}

              download={`AEROVER-SNAPSHOT-${Date.now()}.jpg`}

              className="text-xs text-[#4CAF50] hover:underline flex items-center gap-1 font-mono"

            >

              <Download className="w-3.5 h-3.5" />

              Download JPEG

            </a>

          </div>



          <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">

            <img

              src={lastSnapshot}

              alt="Captured camera frame"

              className="w-48 h-28 object-cover rounded border border-[#22262E]"

            />



            <div className="text-xs text-[#8A9AA5] space-y-1">

              <div>

                <strong className="text-[#F2F5F7]">Captured:</strong>{' '}

                {snapshotTimestamp

                  ? new Date(snapshotTimestamp).toLocaleString()

                  : 'Unknown'}

              </div>



              <div>

                <strong className="text-[#F2F5F7]">Resolution:</strong>{' '}

                {lastSnapshot

                  ? `${cameraStats.width} × ${cameraStats.height}`

                  : 'Unknown'}

              </div>



              <div>

                <strong className="text-[#F2F5F7]">Mission:</strong>{' '}

                {currentMission?.id || 'MSN-2026-001'}

              </div>



              <p className="text-[11px] text-[#8A9AA5]">

                GPS metadata is not embedded. Connect a verified GPS source

                before recording coordinates.

              </p>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};
