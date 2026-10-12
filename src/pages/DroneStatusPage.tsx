import React from 'react';
import { 
  Cpu, 
  Battery, 
  Compass, 
  Gauge, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Play, 
  Pause, 
  RotateCcw,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { DroneTelemetry, Mission } from '../types';

interface DroneStatusPageProps {
  telemetry: DroneTelemetry;
  currentMission?: Mission;
  onUpdateTelemetry: (data: Partial<DroneTelemetry>) => void;
  onMissionPauseResume?: () => void;
}

export const DroneStatusPage: React.FC<DroneStatusPageProps> = ({
  telemetry,
  currentMission,
  onUpdateTelemetry,
  onMissionPauseResume
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Drone Telemetry & Link Diagnostics</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Real-time telemetry link, sensor bus health, avionics diagnostics, and telemetry adapter specs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#0B1420] border border-[#22262E] rounded text-right font-mono text-xs">
            <span className="text-[#8A9AA5]">HEARTBEAT: </span>
            <span className="text-[#4CAF50] font-bold">{telemetry.lastHeartbeatMsAgo}ms ago</span>
          </div>
        </div>
      </div>

      {/* Critical Software-Only Safety Disclaimers */}
      <div className="p-4 bg-[#0B1420] border border-[#F59E0B]/50 rounded text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#F59E0B] font-bold uppercase font-mono tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Software Prototype Architecture Notice</span>
        </div>
        <p className="text-[#AAB6C2] leading-relaxed">
          • <strong>Hardware Flight Controller Status:</strong> AEROVER begins as a software-only search-and-rescue platform. No physical flight controller is connected or assumed. Physical motor arming, auto-takeoff, autonomous navigation, and flight termination commands are deliberately NOT implemented in this prototype.
        </p>
        <p className="text-[#AAB6C2] leading-relaxed">
          • <strong>Workflow vs Flight Controls:</strong> The mission pause/resume buttons below control application data tracking and sector logging only; they do not send real-time ESC motor signals.
        </p>
      </div>

      {/* Link State & Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Link Status Card */}
        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A9AA5] font-mono">
            <span>LINK STATUS</span>
            <Radio className="w-4 h-4 text-[#4CAF50]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#F2F5F7] uppercase">
            {telemetry.linkStatus}
          </div>
          <div className="text-xs text-[#8A9AA5] font-mono flex items-center justify-between pt-1 border-t border-[#22262E]">
            <span>IDENTIFIER</span>
            <span className="text-[#4CAF50] font-semibold">{telemetry.droneId}</span>
          </div>
        </div>

        {/* Battery Health Card */}
        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A9AA5] font-mono">
            <span>BATTERY CAPACITY</span>
            <Battery className="w-4 h-4 text-[#4CAF50]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#4CAF50] tabular-nums">
            {telemetry.batteryPercent !== undefined ? `${telemetry.batteryPercent}%` : 'N/A'}
          </div>
          <div className="text-xs text-[#8A9AA5] font-mono flex items-center justify-between pt-1 border-t border-[#22262E]">
            <span>VOLTAGE</span>
            <span className="text-[#F2F5F7]">{telemetry.batteryVoltage ? `${telemetry.batteryVoltage} V` : 'Standby'}</span>
          </div>
        </div>

        {/* Altitude & Speed Card */}
        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A9AA5] font-mono">
            <span>ALTITUDE & SPEED</span>
            <Gauge className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#F2F5F7] tabular-nums">
            {telemetry.altitudeMeters ? `${telemetry.altitudeMeters}m` : '0m'}
          </div>
          <div className="text-xs text-[#8A9AA5] font-mono flex items-center justify-between pt-1 border-t border-[#22262E]">
            <span>GROUND SPEED</span>
            <span className="text-[#38BDF8]">{telemetry.speedMps ? `${telemetry.speedMps} m/s` : '0 m/s'}</span>
          </div>
        </div>

        {/* GPS Satellite Card */}
        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A9AA5] font-mono">
            <span>GPS SATELLITES</span>
            <Compass className="w-4 h-4 text-[#4CAF50]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#4CAF50] tabular-nums">
            {telemetry.gpsSatellites || 0} LOCKED
          </div>
          <div className="text-xs text-[#8A9AA5] font-mono flex items-center justify-between pt-1 border-t border-[#22262E]">
            <span>FIX QUALITY</span>
            <span className="text-[#F2F5F7]">{telemetry.gpsValid ? '3D Differential Fix' : 'No Lock'}</span>
          </div>
        </div>
      </div>

      {/* Sensor Health Matrix & Orientation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sensor Matrix (6 cols) */}
        <div className="lg:col-span-6 bg-[#111B25] border border-[#22262E] rounded p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              ONBOARD SENSOR HEALTH BUS
            </h2>
            <span className="text-[10px] text-[#4CAF50] font-mono">All diagnostics nominal</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex items-center justify-between">
              <div>
                <div className="text-[#8A9AA5]">6-AXIS IMU</div>
                <div className="text-[#F2F5F7] font-bold text-sm">Calibrated</div>
              </div>
              {telemetry.sensorHealth.imu ? (
                <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#FF4B4B]" />
              )}
            </div>

            <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex items-center justify-between">
              <div>
                <div className="text-[#8A9AA5]">BAROMETER</div>
                <div className="text-[#F2F5F7] font-bold text-sm">1013.25 hPa</div>
              </div>
              {telemetry.sensorHealth.barometer ? (
                <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#FF4B4B]" />
              )}
            </div>

            <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex items-center justify-between">
              <div>
                <div className="text-[#8A9AA5]">MAGNETIC COMPASS</div>
                <div className="text-[#F2F5F7] font-bold text-sm">Heading {telemetry.headingDeg}°</div>
              </div>
              {telemetry.sensorHealth.compass ? (
                <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#FF4B4B]" />
              )}
            </div>

            <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex items-center justify-between">
              <div>
                <div className="text-[#8A9AA5]">GNSS RECEIVER</div>
                <div className="text-[#F2F5F7] font-bold text-sm">Valid 3D Fix</div>
              </div>
              {telemetry.sensorHealth.gps ? (
                <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#FF4B4B]" />
              )}
            </div>
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded text-xs space-y-2 font-mono">
            <div className="text-[#8A9AA5] text-[11px] uppercase">Attitude & Orientation:</div>
            <div className="flex justify-between">
              <span className="text-[#8A9AA5]">PITCH:</span>
              <span className="text-[#F2F5F7]">{telemetry.pitchDeg}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A9AA5]">ROLL:</span>
              <span className="text-[#F2F5F7]">{telemetry.rollDeg}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A9AA5]">HEADING / YAW:</span>
              <span className="text-[#4CAF50]">{telemetry.headingDeg}° Magnetic</span>
            </div>
          </div>
        </div>

        {/* Future Adapter Architecture & Documentation (6 cols) */}
        <div className="lg:col-span-6 bg-[#111B25] border border-[#22262E] rounded p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              HARDWARE ADAPTER INTEGRATION ARCHITECTURE
            </h2>
          </div>

          <div className="space-y-3 text-xs text-[#8A9AA5] leading-relaxed">
            <p>
              AEROVER uses a decoupled adapter layer so that any telemetry protocol can feed real-time coordinates into the mission map without modifying visual code.
            </p>

            <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded space-y-2 font-mono text-[11px]">
              <div className="text-[#4CAF50] font-bold">Supported Telemetry Adapters:</div>
              <div>1. <span className="text-[#F2F5F7]">MAVLink 2.0 Micro-service:</span> Transceiver on 433MHz / 915MHz radio link.</div>
              <div>2. <span className="text-[#F2F5F7]">ATGM336H GPS UART Adapter:</span> 9600 Baud NMEA 0183 ($GPGGA, $GPRMC).</div>
              <div>3. <span className="text-[#F2F5F7]">WebSocket Live Telemetry Stream:</span> <code className="text-[#38BDF8]">ws://localhost:8000/ws/mission-events</code></div>
              <div>4. <span className="text-[#F2F5F7]">FastAPI REST Fallback:</span> <code className="text-[#38BDF8]">GET /api/telemetry/latest</code></div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[11px] font-mono text-[#F59E0B]">SIMULATION FIXTURE ACTIVE</span>
              <button
                type="button"
                onClick={() => {
                  onUpdateTelemetry({
                    batteryPercent: Math.max(10, (telemetry.batteryPercent || 80) - 2),
                    lastHeartbeatMsAgo: 120
                  });
                }}
                className="px-3 py-1 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] text-xs font-semibold rounded border border-[#4CAF50]/40 transition-colors"
              >
                Simulate Telemetry Tick
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
