import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  Phone, 
  MapPin, 
  Download, 
  Shield, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { SARTeam, CheckInStatus, TeamRole, Mission } from '../types';

interface TeamManagementPageProps {
  currentMission?: Mission;
  teams: SARTeam[];
  onAddTeam: (team: SARTeam) => void;
  onUpdateTeam: (team: SARTeam) => void;
  onDeleteTeam: (id: string) => void;
}

export const TeamManagementPage: React.FC<TeamManagementPageProps> = ({
  currentMission,
  teams,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderContact, setLeaderContact] = useState('');
  const [currentTask, setCurrentTask] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !callsign.trim()) {
      alert('Team name and callsign are required.');
      return;
    }

    const newTeam: SARTeam = {
      id: `TM-${Date.now().toString().slice(-4)}`,
      name: teamName.trim(),
      callsign: callsign.trim().toUpperCase(),
      assignedMissionId: currentMission?.id,
      leaderName: leaderName.trim() || 'Officer in Charge',
      leaderContact: leaderContact.trim() || 'VHF Tactical',
      members: [
        { id: `MB-${Date.now()}-1`, name: leaderName.trim() || 'Leader', role: 'incident_commander', callsign: `${callsign.trim()}-LEAD` }
      ],
      checkInStatus: 'on_site',
      lastCheckInTime: new Date().toISOString(),
      currentTask: currentTask.trim() || 'Assigned to incident command standby',
      notes: notes.trim()
    };

    onAddTeam(newTeam);
    setShowAddModal(false);
    setTeamName('');
    setCallsign('');
    setLeaderName('');
    setLeaderContact('');
    setCurrentTask('');
    setNotes('');
  };

  const handleCycleStatus = (team: SARTeam) => {
    const statuses: CheckInStatus[] = ['on_site', 'in_transit', 'checked_in', 'standby', 'checked_out'];
    const currentIdx = statuses.indexOf(team.checkInStatus);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];
    onUpdateTeam({
      ...team,
      checkInStatus: nextStatus,
      lastCheckInTime: new Date().toISOString()
    });
  };

  const handleExportCsv = () => {
    let csv = 'TeamID,Name,Callsign,Leader,Contact,Status,CurrentTask,LastCheckIn\n';
    teams.forEach(t => {
      csv += `"${t.id}","${t.name}","${t.callsign}","${t.leaderName}","${t.leaderContact || ''}","${t.checkInStatus}","${t.currentTask}","${t.lastCheckInTime}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEROVER-SAR-TEAMS-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">SAR Team & Operator Coordination</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Manage deployed ground search units, K9 handlers, drone pilots, and accountability check-in status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Search Team</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 bg-[#111B25] hover:bg-[#182A1F] text-[#8A9AA5] hover:text-[#F2F5F7] border border-[#22262E] rounded text-xs font-mono flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Roster
          </button>
        </div>
      </div>

      {/* Authorized Location Privacy Notice */}
      <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded text-xs text-[#8A9AA5]">
        <strong>LOCATION ACCOUNTABILITY PROTOCOL:</strong> Team coordinates displayed on tactical maps represent intentionally shared GPS coordinates from official handheld VHF radios or AEROVER Mobile field interfaces. Personal telephone devices are never tracked involuntarily.
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.id} className="bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F2F5F7]">{team.name}</span>
                  </div>
                  <div className="text-xs font-mono text-[#4CAF50] font-bold mt-0.5">
                    CALLSIGN: {team.callsign}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCycleStatus(team)}
                  className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase transition-colors ${
                    team.checkInStatus === 'on_site' ? 'bg-[#064E3B] text-[#6EE7B7] hover:bg-[#047857]' :
                    team.checkInStatus === 'in_transit' ? 'bg-[#78350F] text-[#FDE68A] hover:bg-[#B45309]' :
                    team.checkInStatus === 'standby' ? 'bg-[#1E3A8A] text-[#93C5FD] hover:bg-[#2563EB]' :
                    'bg-[#1F2937] text-[#9CA3AF] hover:bg-[#374151]'
                  }`}
                  title="Click to cycle check-in status"
                >
                  {team.checkInStatus.replace('_', ' ')}
                </button>
              </div>

              <div className="mt-3 p-2.5 bg-[#0B1420] border border-[#22262E] rounded text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8A9AA5]">LEADER:</span>
                  <span className="text-[#F2F5F7]">{team.leaderName}</span>
                </div>
                {team.leaderContact && (
                  <div className="flex justify-between">
                    <span className="text-[#8A9AA5]">COMMS:</span>
                    <span className="text-[#38BDF8]">{team.leaderContact}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#8A9AA5]">PERSONNEL:</span>
                  <span className="text-[#F2F5F7]">{team.members.length} Members</span>
                </div>
              </div>

              <div className="mt-3 text-xs">
                <div className="text-[10px] text-[#8A9AA5] uppercase font-mono mb-1">Current Assignment</div>
                <div className="text-[#F2F5F7] bg-[#0B1420]/60 p-2 rounded border border-[#22262E]">
                  {team.currentTask}
                </div>
              </div>

              {team.notes && (
                <div className="mt-2 text-[11px] text-[#8A9AA5] italic">
                  {team.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#22262E] flex items-center justify-between text-xs text-[#8A9AA5]">
              <span className="font-mono text-[10px]">Check-in: {team.lastCheckInTime.slice(11, 16)} UTC</span>
              <button
                type="button"
                onClick={() => onDeleteTeam(team.id)}
                className="text-[#8A9AA5] hover:text-[#FF4B4B] p-1 transition-colors"
                title="Remove team record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form onSubmit={handleCreateTeam} className="bg-[#111B25] border border-[#4CAF50] rounded p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
              <h3 className="text-sm font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#4CAF50]" /> Add New SAR Team
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-[#8A9AA5] hover:text-[#F2F5F7]"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ridge Recon Unit 4"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Radio Callsign</label>
                <input
                  type="text"
                  placeholder="e.g. RECON-4"
                  value={callsign}
                  onChange={e => setCallsign(e.target.value)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] font-mono rounded focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Team Leader</label>
                <input
                  type="text"
                  placeholder="e.g. Sgt. Miller"
                  value={leaderName}
                  onChange={e => setLeaderName(e.target.value)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Radio / Comms Channel</label>
                <input
                  type="text"
                  placeholder="e.g. VHF Ch 14 Tactical"
                  value={leaderContact}
                  onChange={e => setLeaderContact(e.target.value)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Current Assignment / Task</label>
              <input
                type="text"
                placeholder="e.g. Conducting ground search along ridge line trail"
                value={currentTask}
                onChange={e => setCurrentTask(e.target.value)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Equipment & Operational Notes</label>
              <textarea
                rows={2}
                placeholder="Specialized gear (medical pack, FLIR thermal monocular, K9)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-[#8A9AA5] hover:text-[#F2F5F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#4CAF50] hover:bg-[#388E3C] text-[#0B1420] font-bold text-xs rounded transition-colors"
              >
                Save Team
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
