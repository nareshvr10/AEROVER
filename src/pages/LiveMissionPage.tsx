import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  MapPin, 
  Navigation, 
  Users, 
  Clock, 
  AlertCircle, 
  FileEdit, 
  Check, 
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { Mission, SearchSector, Waypoint, SARTeam, DroneTelemetry } from '../types';
import { StorageService } from '../services/storage';
import { TacticalMap } from '../components/common/TacticalMap';

interface LiveMissionPageProps {
  currentMission?: Mission;
  allMissions: Mission[];
  teams: SARTeam[];
  telemetry: DroneTelemetry;
  onMissionUpdate: (mission: Mission) => void;
  onSelectMission: (missionId: string) => void;
}

export const LiveMissionPage: React.FC<LiveMissionPageProps> = ({
  currentMission,
  allMissions,
  teams,
  telemetry,
  onMissionUpdate,
  onSelectMission
}) => {
  const [missionTimeElapsed, setMissionTimeElapsed] = useState<string>('00:00:00');
  const [newLogText, setNewLogText] = useState('');
  const [confirmAbortOpen, setConfirmAbortOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);

  // Time elapsed calculator
  useEffect(() => {
    if (!currentMission || !currentMission.startTime || currentMission.status !== 'active') {
      return;
    }

    const start = new Date(currentMission.startTime).getTime();
    const updateElapsed = () => {
      const diff = Math.max(0, Date.now() - start);
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setMissionTimeElapsed(`${hours}:${mins}:${secs}`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [currentMission]);

  if (!currentMission) {
    return (
      <div className="p-8 text-center bg-[#111B25] border border-[#22262E] rounded">
        <h2 className="text-base font-bold text-[#F2F5F7]">No Active Mission Selected</h2>
        <p className="mt-2 text-xs text-[#8A9AA5]">Select or create a mission to begin monitoring search operations.</p>
      </div>
    );
  }

  const handleStatusChange = (newStatus: Mission['status']) => {
    const updated: Mission = {
      ...currentMission,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
      completionTime: (newStatus === 'completed' || newStatus === 'aborted') ? new Date().toISOString() : undefined
    };
    onMissionUpdate(updated);
  };

  const handleToggleWaypoint = (wpId: string) => {
    const updatedWaypoints = currentMission.waypoints.map(wp => {
      if (wp.id === wpId) {
        return { ...wp, reached: !wp.reached };
      }
      return wp;
    });

    const updated: Mission = {
      ...currentMission,
      waypoints: updatedWaypoints,
      lastUpdated: new Date().toISOString()
    };
    onMissionUpdate(updated);
  };

  const handleUpdateSectorStatus = (sectorId: string, nextStatus: SearchSector['status']) => {
    const updatedSectors = currentMission.sectors.map(sec => {
      if (sec.id === sectorId) {
        return { ...sec, status: nextStatus };
      }
      return sec;
    });

    const updated: Mission = {
      ...currentMission,
      sectors: updatedSectors,
      lastUpdated: new Date().toISOString()
    };
    onMissionUpdate(updated);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;

    const entry = `\n[${new Date().toISOString().slice(11, 19)} UTC] ${newLogText.trim()}`;
    const updated: Mission = {
      ...currentMission,
      notes: (currentMission.notes || '') + entry,
      lastUpdated: new Date().toISOString()
    };
    onMissionUpdate(updated);
    setNewLogText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Mission Control Bar */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#182A1F] text-[#4CAF50] border border-[#4CAF50]/30 font-bold uppercase">
              {currentMission.type.replace('_', ' ')}
            </span>
            <span className="text-xs text-[#8A9AA5] font-mono">
              ID: {currentMission.id}
            </span>
            {currentMission.isSimulatedData && (
              <span className="text-[10px] text-[#F59E0B] border border-[#F59E0B]/40 px-1.5 py-0.5 rounded font-mono uppercase">
                SIMULATION DATA
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-[#F2F5F7] mt-1">{currentMission.name}</h1>
          <p className="text-xs text-[#8A9AA5] mt-0.5 max-w-2xl">{currentMission.description}</p>
        </div>

        {/* Action Buttons & Time */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-[#0B1420] border border-[#22262E] rounded text-right font-mono">
            <div className="text-[10px] text-[#8A9AA5] uppercase">ELAPSED TIME</div>
            <div className="text-sm font-bold text-[#4CAF50] tabular-nums">{missionTimeElapsed}</div>
          </div>

          {currentMission.status === 'active' ? (
            <button
              type="button"
              onClick={() => handleStatusChange('paused')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-[#78350F] hover:bg-[#B45309] text-white transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE WORKFLOW</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStatusChange('active')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>RESUME TRACKING</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setConfirmCompleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-[#1E3A8A] hover:bg-[#2563EB] text-white transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>COMPLETE MISSION</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmAbortOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-[#7F1D1D] hover:bg-[#DC2626] text-white transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            <span>ABORT</span>
          </button>
        </div>
      </div>

      {/* Safety Notice regarding workflow control */}
      <div className="px-3 py-2 bg-[#0B1420] border border-[#22262E] rounded text-[11px] text-[#8A9AA5] font-mono flex items-center justify-between">
        <span>
          ℹ NOTICE: "PAUSE", "COMPLETE", AND "ABORT" ARE SOFTWARE MISSION WORKFLOW CONTROLS. THEY DO NOT CONTROL HARDWARE MOTOR POWER OR FLIGHT COMMANDS.
        </span>
        <span className="text-[#4CAF50]">PROTOCOL V1.0</span>
      </div>

      {/* Main Grid: Interactive Map + Waypoint Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tactical Map Container (8 cols) */}
        <div className="lg:col-span-8 bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4CAF50]" />
              <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
                LIVE SEARCH SECTORS & WAYPOINTS
              </h2>
            </div>
            <div className="text-xs font-mono text-[#8A9AA5]">
              {currentMission.sectors.length} Sectors · {currentMission.waypoints.length} Waypoints
            </div>
          </div>

          <div className="mt-3 flex-1">
            <TacticalMap
              sectors={currentMission.sectors}
              waypoints={currentMission.waypoints}
              teams={teams}
              dronePosition={telemetry.latitude && telemetry.longitude ? { lat: telemetry.latitude, lng: telemetry.longitude } : undefined}
              lastKnownPosition={currentMission.waypoints.find(w => w.name.includes('LKP'))?.coordinates}
              className="h-[420px] w-full"
            />
          </div>

          {/* Sectors quick toggle table */}
          <div className="mt-4 pt-3 border-t border-[#22262E]">
            <h3 className="text-xs font-bold text-[#8A9AA5] uppercase font-mono mb-2">Search Sector Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentMission.sectors.map(sec => (
                <div key={sec.id} className="p-2.5 bg-[#0B1420] border border-[#22262E] rounded flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#F2F5F7] truncate">{sec.name}</div>
                    <div className="text-[10px] text-[#8A9AA5] font-mono mt-0.5">
                      {sec.areaSquareKm} km² · Priority: {sec.priority}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#4CAF50] uppercase">{sec.status.replace('_', ' ')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next: SearchSector['status'] = 
                          sec.status === 'pending' ? 'assigned' :
                          sec.status === 'assigned' ? 'in_progress' :
                          sec.status === 'in_progress' ? 'completed' : 'in_progress';
                        handleUpdateSectorStatus(sec.id, next);
                      }}
                      className="text-[10px] px-2 py-0.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50]/30 rounded transition-colors font-mono"
                    >
                      Cycle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Waypoint Sequence & Log Entry (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Waypoints Checklist */}
          <div className="bg-[#111B25] border border-[#22262E] rounded p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#4CAF50]" />
                <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
                  MISSION WAYPOINTS
                </h3>
              </div>
              <span className="text-[10px] text-[#8A9AA5] font-mono">
                {currentMission.waypoints.filter(w => w.reached).length} / {currentMission.waypoints.length} Reached
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto">
              {currentMission.waypoints.map(wp => (
                <div
                  key={wp.id}
                  onClick={() => handleToggleWaypoint(wp.id)}
                  className={`p-2.5 rounded border transition-colors cursor-pointer flex items-start gap-2.5 ${
                    wp.reached
                      ? 'bg-[#182A1F]/60 border-[#4CAF50]/40 text-[#F2F5F7]'
                      : 'bg-[#0B1420] border-[#22262E] text-[#8A9AA5] hover:border-[#4CAF50]/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5 ${
                    wp.reached ? 'bg-[#4CAF50] text-[#0B1420]' : 'bg-[#22262E] text-[#8A9AA5]'
                  }`}>
                    {wp.reached ? <Check className="w-3.5 h-3.5" /> : wp.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#F2F5F7] truncate">{wp.name}</div>
                    <div className="text-[10px] text-[#8A9AA5] font-mono mt-0.5">
                      {wp.coordinates.lat.toFixed(4)}, {wp.coordinates.lng.toFixed(4)}
                      {wp.coordinates.altitude ? ` · ${wp.coordinates.altitude}m` : ''}
                    </div>
                    {wp.notes && <div className="text-[10px] text-[#8A9AA5]/80 mt-1 italic">{wp.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Mission Incident Event Log */}
          <div className="bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col">
            <div className="flex items-center gap-2 pb-3 border-b border-[#22262E]">
              <FileEdit className="w-4 h-4 text-[#4CAF50]" />
              <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
                FIELD INCIDENT LOG
              </h3>
            </div>

            <div className="mt-3 flex-1 bg-[#0B1420] border border-[#22262E] p-2.5 rounded max-h-[160px] overflow-y-auto font-mono text-[11px] text-[#8A9AA5] whitespace-pre-line leading-relaxed">
              {currentMission.notes || 'No log entries recorded yet.'}
            </div>

            <form onSubmit={handleAddLog} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Log event (e.g. Ground team reached LZ Bravo)..."
                value={newLogText}
                onChange={e => setNewLogText(e.target.value)}
                className="flex-1 bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] rounded px-2.5 py-1.5 text-xs text-[#F2F5F7] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newLogText.trim()}
                className="px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] text-xs font-semibold border border-[#4CAF50]/40 rounded disabled:opacity-40 transition-colors"
              >
                Log
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {confirmAbortOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111B25] border border-[#FF4B4B] rounded p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-[#FF4B4B]">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-[#F2F5F7]">Confirm Mission Abort</h3>
            </div>
            <p className="mt-3 text-xs text-[#8A9AA5] leading-relaxed">
              Are you sure you want to abort mission <strong className="text-[#F2F5F7]">{currentMission.name}</strong>? This changes the mission workflow state to aborted and logs the current timestamp in historical records.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAbortOpen(false)}
                className="px-3 py-1.5 rounded text-xs text-[#8A9AA5] hover:text-[#F2F5F7] hover:bg-[#22262E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleStatusChange('aborted');
                  setConfirmAbortOpen(false);
                }}
                className="px-4 py-1.5 rounded text-xs font-bold bg-[#FF4B4B] hover:bg-[#DC2626] text-white"
              >
                Confirm Abort
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111B25] border border-[#4CAF50] rounded p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-[#4CAF50]">
              <CheckCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-[#F2F5F7]">Complete Mission</h3>
            </div>
            <p className="mt-3 text-xs text-[#8A9AA5] leading-relaxed">
              Mark mission <strong className="text-[#F2F5F7]">{currentMission.name}</strong> as completed? All cleared sectors and verified findings will be sealed for report generation.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmCompleteOpen(false)}
                className="px-3 py-1.5 rounded text-xs text-[#8A9AA5] hover:text-[#F2F5F7] hover:bg-[#22262E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleStatusChange('completed');
                  setConfirmCompleteOpen(false);
                }}
                className="px-4 py-1.5 rounded text-xs font-bold bg-[#4CAF50] hover:bg-[#388E3C] text-[#0B1420]"
              >
                Confirm Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
