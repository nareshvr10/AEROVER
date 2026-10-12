import React from 'react';
import { 
  Shield, 
  Flame, 
  MapPin, 
  Video, 
  Cpu, 
  Bell, 
  Users, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Eye,
  Radio,
  Scan
} from 'lucide-react';
import { Mission, DroneTelemetry, SystemAlert, AIDetection, SARTeam, SignalObservation } from '../types';
import { TacticalMap } from '../components/common/TacticalMap';

interface OverviewPageProps {
  currentMission?: Mission;
  telemetry: DroneTelemetry;
  alerts: SystemAlert[];
  detections: AIDetection[];
  teams: SARTeam[];
  observations: SignalObservation[];
  onNavigate: (page: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  currentMission,
  telemetry,
  alerts,
  detections,
  teams,
  observations,
  onNavigate
}) => {
  const activeAlerts = alerts.filter(a => !a.resolved);
  const pendingDetections = detections.filter(d => d.status === 'pending');
  const completedSectors = currentMission?.sectors.filter(s => s.status === 'completed').length || 0;
  const totalSectors = currentMission?.sectors.length || 0;

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="bg-[#182A1F]/70 border border-[#4CAF50]/40 rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#4CAF50] shrink-0" />
          <span className="text-[#F2F5F7]">
            <strong className="text-[#4CAF50]">PROTOTYPE SIMULATION MODE:</strong> Operating with verified local test fixtures. Physical flight controllers, DroidCam wireless streams, and ATGM336H GPS modules connect via the Device Connections adapter panel.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('device_connections')}
          className="text-[#4CAF50] hover:text-[#AAB6C2] whitespace-nowrap underline shrink-0 font-medium"
        >
          Manage Adapters &rarr;
        </button>
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className="p-3 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] uppercase tracking-wider font-mono">MISSION</div>
          <div className="mt-1 text-sm font-bold text-[#F2F5F7] truncate">{currentMission?.name || 'Standby'}</div>
          <div className="text-[10px] text-[#4CAF50] font-mono mt-0.5 uppercase">{currentMission?.status || 'IDLE'}</div>
        </div>

        <div className="p-3 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] uppercase tracking-wider font-mono">DRONE LINK</div>
          <div className="mt-1 text-sm font-bold font-mono text-[#F59E0B] uppercase">{telemetry.linkStatus}</div>
          <div className="text-[10px] text-[#8A9AA5] font-mono mt-0.5">Software Prototype</div>
        </div>

        <div className="p-3 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] uppercase tracking-wider font-mono">BATTERY</div>
          <div className="mt-1 text-sm font-bold font-mono tabular-nums text-[#4CAF50]">
            {telemetry.batteryPercent !== undefined ? `${telemetry.batteryPercent}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-[#8A9AA5] font-mono mt-0.5">{telemetry.batteryVoltage ? `${telemetry.batteryVoltage}V` : 'Standby'}</div>
        </div>

        <div className="p-3 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] uppercase tracking-wider font-mono">GPS FIX</div>
          <div className="mt-1 text-sm font-bold font-mono text-[#4CAF50]">
            {telemetry.gpsValid ? '3D FIX (14 SATS)' : 'NO FIX'}
          </div>
          <div className="text-[10px] text-[#8A9AA5] font-mono mt-0.5">Cascade Ridge Grid</div>
        </div>

        <div className="p-3 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] uppercase tracking-wider font-mono">SECTORS</div>
          <div className="mt-1 text-sm font-bold font-mono tabular-nums text-[#F2F5F7]">
            {completedSectors} / {totalSectors}
          </div>
          <div className="text-[10px] text-[#4CAF50] font-mono mt-0.5">
            {totalSectors > 0 ? `${Math.round((completedSectors / totalSectors) * 100)}% Cleared` : '0%'}
          </div>
        </div>

        <div className="p-3 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] uppercase tracking-wider font-mono">AI TARGETS</div>
          <div className="mt-1 text-sm font-bold font-mono tabular-nums text-[#F59E0B]">
            {pendingDetections.length} PENDING
          </div>
          <div className="text-[10px] text-[#8A9AA5] font-mono mt-0.5">
            {detections.filter(d => d.status === 'confirmed').length} Confirmed
          </div>
        </div>

        <div className="p-3 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] uppercase tracking-wider font-mono">SAR TEAMS</div>
          <div className="mt-1 text-sm font-bold font-mono tabular-nums text-[#F2F5F7]">
            {teams.length} DEPLOYED
          </div>
          <div className="text-[10px] text-[#4CAF50] font-mono mt-0.5">Ground & K9 Ready</div>
        </div>

        <div className="p-3 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] uppercase tracking-wider font-mono">ALERTS</div>
          <div className={`mt-1 text-sm font-bold font-mono tabular-nums ${activeAlerts.length > 0 ? 'text-[#FF4B4B]' : 'text-[#4CAF50]'}`}>
            {activeAlerts.length} ACTIVE
          </div>
          <div className="text-[10px] text-[#8A9AA5] font-mono mt-0.5">
            {alerts.filter(a => a.severity === 'critical').length} Critical
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Live Camera Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tactical Map Container (7 cols) */}
        <div className="lg:col-span-7 bg-[#111B25] border border-[#22262E] rounded flex flex-col">
          <div className="px-4 py-3 border-b border-[#22262E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#4CAF50]" />
              <h2 className="text-xs font-bold text-[#F2F5F7] tracking-wider uppercase font-mono">
                TACTICAL SEARCH AREA & SECTORS
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('search_map')}
              className="text-xs text-[#8A9AA5] hover:text-[#4CAF50] flex items-center gap-1 font-mono transition-colors"
            >
              Full Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 flex-1">
            <TacticalMap
              sectors={currentMission?.sectors || []}
              waypoints={currentMission?.waypoints || []}
              teams={teams}
              dronePosition={telemetry.latitude && telemetry.longitude ? { lat: telemetry.latitude, lng: telemetry.longitude } : undefined}
              lastKnownPosition={currentMission?.waypoints.find(w => w.name.includes('LKP'))?.coordinates}
              className="h-[360px] w-full"
            />
          </div>

          <div className="px-4 py-2 border-t border-[#22262E] bg-[#0B1420]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8A9AA5] font-mono">
            <div className="flex items-center gap-3">
              <span>BOUNDS: {currentMission?.sectors.length || 0} SECTORS</span>
              <span>WAYPOINTS: {currentMission?.waypoints.length || 0}</span>
            </div>
            <div className="text-[#4CAF50]">
              COORDINATES: {telemetry.latitude?.toFixed(4)}° N, {Math.abs(telemetry.longitude || 0).toFixed(4)}° W
            </div>
          </div>
        </div>

        {/* Live Camera Viewport (5 cols) */}
        <div className="lg:col-span-5 bg-[#111B25] border border-[#22262E] rounded flex flex-col">
          <div className="px-4 py-3 border-b border-[#22262E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#4CAF50]" />
              <h2 className="text-xs font-bold text-[#F2F5F7] tracking-wider uppercase font-mono">
                OPTICAL RECONNAISSANCE FEED
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('live_camera')}
              className="text-xs text-[#8A9AA5] hover:text-[#4CAF50] flex items-center gap-1 font-mono transition-colors"
            >
              Camera Page <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative p-3 flex-1 flex flex-col justify-center items-center bg-[#0B1420]">
            {/* Tactical Feed Preview Image */}
            <div className="relative w-full h-[280px] bg-[#182A1F] rounded overflow-hidden border border-[#22262E] flex items-center justify-center">
              <img
                src="/src/assets/images/aerover_tactical_hero_1791780893966.jpg"
                alt="AEROVER Tactical Aerial Reconnaissance View"
                className="w-full h-full object-cover brightness-90"
              />

              {/* Tactical Crosshair Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-16 h-16 border border-[#4CAF50]/60 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#4CAF50] rounded-full" />
                </div>
              </div>

              {/* Candidate Detection Box Highlight */}
              <div className="absolute top-[28%] left-[42%] w-[16%] h-[26%] border-2 border-[#FF4B4B] bg-[#FF4B4B]/10 pointer-events-none">
                <span className="absolute -top-5 left-0 px-1 py-0.5 bg-[#FF4B4B] text-white text-[9px] font-mono font-bold">
                  PERSON 88% (AI)
                </span>
              </div>

              {/* Feed Metadata Overlay */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-[#0B1420]/80 border border-[#22262E] text-[10px] font-mono text-[#4CAF50]">
                AEROVER-AIR // OPTICAL 1080p
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-[#0B1420]/80 border border-[#22262E] text-[10px] font-mono text-[#8A9AA5]">
                ALT: 145m | SPD: 7.8m/s
              </div>
            </div>

            <div className="mt-3 w-full flex items-center justify-between text-xs">
              <span className="text-[#8A9AA5] font-mono">SOURCE: Simulated Recon Camera</span>
              <button
                type="button"
                onClick={() => onNavigate('live_camera')}
                className="px-3 py-1 rounded bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] text-xs font-semibold border border-[#4CAF50]/40 transition-colors"
              >
                Connect DroidCam / Webcam
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Operational Panels: Sectors, AI Detections, Teams & Signal Observations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Sectors Progress Card */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              SEARCH SECTORS
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('mission_planner')}
              className="text-[11px] text-[#4CAF50] hover:underline"
            >
              Planner
            </button>
          </div>

          <div className="mt-3 space-y-2 flex-1">
            {currentMission?.sectors.map(sec => (
              <div key={sec.id} className="p-2.5 bg-[#0B1420] border border-[#22262E] rounded text-xs flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F2F5F7]">{sec.name}</div>
                  <div className="text-[10px] text-[#8A9AA5] font-mono mt-0.5">
                    {sec.areaSquareKm} km² · Priority: {sec.priority}
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                  sec.status === 'completed'
                    ? 'bg-[#1E3A8A] text-[#93C5FD]'
                    : sec.status === 'in_progress'
                    ? 'bg-[#78350F] text-[#FDE68A]'
                    : 'bg-[#1F2937] text-[#9CA3AF]'
                }`}>
                  {sec.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Detection Review Card */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <div className="flex items-center gap-1.5">
              <Scan className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
                AI DETECTIONS
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ai_detection')}
              className="text-[11px] text-[#4CAF50] hover:underline"
            >
              Review ({pendingDetections.length})
            </button>
          </div>

          <div className="mt-3 space-y-2 flex-1">
            {detections.slice(0, 3).map(det => (
              <div key={det.id} className="p-2.5 bg-[#0B1420] border border-[#22262E] rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F2F5F7] font-mono uppercase text-[11px]">
                    {det.className} ({(det.confidence * 100).toFixed(0)}%)
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase ${
                    det.status === 'confirmed'
                      ? 'bg-[#064E3B] text-[#6EE7B7]'
                      : det.status === 'rejected'
                      ? 'bg-[#7F1D1D] text-[#FCA5A5]'
                      : 'bg-[#78350F] text-[#FCD34D]'
                  }`}>
                    {det.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#8A9AA5] line-clamp-1">{det.notes}</p>
                <div className="mt-1 text-[9px] text-[#8A9AA5]/60 font-mono">
                  {det.isSimulated ? 'TEST DATA' : 'MODEL'} · {det.timestamp.slice(11, 19)} UTC
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ground Teams Card */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#4CAF50]" />
              <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
                SAR GROUND TEAMS
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('team_management')}
              className="text-[11px] text-[#4CAF50] hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="mt-3 space-y-2 flex-1">
            {teams.map(tm => (
              <div key={tm.id} className="p-2.5 bg-[#0B1420] border border-[#22262E] rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F2F5F7]">{tm.name}</span>
                  <span className="text-[10px] font-mono text-[#4CAF50]">{tm.callsign}</span>
                </div>
                <div className="text-[11px] text-[#8A9AA5] mt-0.5 truncate">{tm.currentTask}</div>
                <div className="mt-1 text-[10px] text-[#8A9AA5]/80 font-mono flex items-center justify-between">
                  <span>Lead: {tm.leaderName}</span>
                  <span className="text-[#4CAF50] uppercase">{tm.checkInStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signal Observations Card */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <div className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
                SIGNAL OBSERVATIONS
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('signal_observations')}
              className="text-[11px] text-[#4CAF50] hover:underline"
            >
              Signals
            </button>
          </div>

          <div className="mt-3 space-y-2 flex-1">
            {observations.slice(0, 2).map(obs => (
              <div key={obs.id} className="p-2.5 bg-[#0B1420] border border-[#22262E] rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#38BDF8] text-[11px] font-bold">
                    {obs.frequencyMhz ? `${obs.frequencyMhz} MHz` : 'RF BEACON'}
                  </span>
                  <span className="text-[10px] font-mono text-[#8A9AA5]">
                    {obs.signalStrengthDbm ? `${obs.signalStrengthDbm} dBm` : 'N/A'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#8A9AA5] line-clamp-2">{obs.operatorNotes}</p>
                <div className="mt-1 text-[9px] text-[#8A9AA5]/60 font-mono">
                  {obs.channel || 'Authorized Receiver'} · Azimuth: {obs.reportedBearingDeg ? `${obs.reportedBearingDeg}°` : 'Omni'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
