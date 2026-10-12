import React, { useState } from 'react';
import { 
  CalendarRange, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Play, 
  Search, 
  Filter, 
  MapPin, 
  Layers, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { Mission, MissionType, MissionPriority, MissionStatus, SARTeam } from '../types';

interface MissionPlannerPageProps {
  missions: Mission[];
  currentMissionId?: string;
  teams: SARTeam[];
  onSelectMission: (id: string) => void;
  onSaveMission: (mission: Mission) => void;
  onDeleteMission: (id: string) => void;
}

export const MissionPlannerPage: React.FC<MissionPlannerPageProps> = ({
  missions,
  currentMissionId,
  teams,
  onSelectMission,
  onSaveMission,
  onDeleteMission
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<MissionType>('missing_person');
  const [formPriority, setFormPriority] = useState<MissionPriority>('high');
  const [formStatus, setFormStatus] = useState<MissionStatus>('planned');
  const [formDescription, setFormDescription] = useState('');
  const [formOperator, setFormOperator] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredMissions = missions.filter(m => {
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingMission(null);
    setFormName('');
    setFormType('missing_person');
    setFormPriority('high');
    setFormStatus('planned');
    setFormDescription('');
    setFormOperator('Commander (AEROVER-OPS)');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mission: Mission) => {
    setEditingMission(mission);
    setFormName(mission.name);
    setFormType(mission.type);
    setFormPriority(mission.priority);
    setFormStatus(mission.status);
    setFormDescription(mission.description);
    setFormOperator(mission.assignedOperator);
    setFormNotes(mission.notes);
    setIsModalOpen(true);
  };

  const handleDuplicate = (mission: Mission) => {
    const duplicated: Mission = {
      ...mission,
      id: `MSN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: `${mission.name} (Copy)`,
      status: 'planned',
      startTime: undefined,
      completionTime: undefined,
      lastUpdated: new Date().toISOString(),
      isSimulatedData: true
    };
    onSaveMission(duplicated);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Mission name is required.');
      return;
    }

    if (editingMission) {
      const updated: Mission = {
        ...editingMission,
        name: formName.trim(),
        type: formType,
        priority: formPriority,
        status: formStatus,
        description: formDescription.trim(),
        assignedOperator: formOperator.trim(),
        notes: formNotes.trim(),
        lastUpdated: new Date().toISOString()
      };
      onSaveMission(updated);
    } else {
      const newMission: Mission = {
        id: `MSN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        name: formName.trim(),
        type: formType,
        priority: formPriority,
        status: formStatus,
        description: formDescription.trim(),
        searchAreaBoundary: [
          { lat: 46.8523, lng: -121.7603 },
          { lat: 46.8654, lng: -121.7451 },
          { lat: 46.8582, lng: -121.7225 },
          { lat: 46.8410, lng: -121.7380 }
        ],
        sectors: [],
        waypoints: [
          { id: `WP-${Date.now()}-1`, order: 1, name: 'Staging Area (ICP)', coordinates: { lat: 46.8425, lng: -121.7410 } }
        ],
        assignedOperator: formOperator.trim() || 'Commander (AEROVER-OPS)',
        assignedTeamIds: teams.slice(0, 2).map(t => t.id),
        startTime: formStatus === 'active' ? new Date().toISOString() : undefined,
        lastUpdated: new Date().toISOString(),
        notes: formNotes.trim(),
        isSimulatedData: true
      };
      onSaveMission(newMission);
      onSelectMission(newMission.id);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Search & Rescue Mission Planner</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Create, duplicate, stage, and configure tactical search missions, assignments, and search boundaries.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Plan New Mission</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#111B25] border border-[#22262E] rounded flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8A9AA5] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search missions by name or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] pl-9 pr-3 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#0B1420] border border-[#22262E] px-2.5 py-1.5 text-xs text-[#8A9AA5] rounded font-mono"
          >
            <option value="all">All Types</option>
            <option value="missing_person">Missing Person</option>
            <option value="flood_response">Flood Response</option>
            <option value="landslide_response">Landslide Response</option>
            <option value="forest_search">Forest Search</option>
            <option value="disaster_assessment">Disaster Assessment</option>
            <option value="emergency_recon">Emergency Recon</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#0B1420] border border-[#22262E] px-2.5 py-1.5 text-xs text-[#8A9AA5] rounded font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="ready">Ready</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="aborted">Aborted</option>
          </select>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMissions.map(m => {
          const isSelected = m.id === currentMissionId;
          return (
            <div
              key={m.id}
              className={`bg-[#111B25] border rounded p-4 flex flex-col justify-between space-y-4 transition-colors ${
                isSelected ? 'border-[#4CAF50] shadow-sm shadow-[#4CAF50]/10' : 'border-[#22262E]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#4CAF50] font-bold">{m.id}</span>
                      <span className="text-[#22262E]">·</span>
                      <span className="text-[10px] font-mono text-[#8A9AA5] uppercase">
                        {m.type.replace('_', ' ')}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#F2F5F7] mt-1">{m.name}</h2>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      m.status === 'active' ? 'bg-[#064E3B] text-[#6EE7B7]' :
                      m.status === 'completed' ? 'bg-[#1E3A8A] text-[#93C5FD]' :
                      m.status === 'aborted' ? 'bg-[#7F1D1D] text-[#FCA5A5]' : 'bg-[#1F2937] text-[#9CA3AF]'
                    }`}>
                      {m.status}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      m.priority === 'critical' ? 'bg-[#7F1D1D] text-[#FCA5A5]' :
                      m.priority === 'high' ? 'bg-[#78350F] text-[#FDE68A]' : 'bg-[#182A1F] text-[#6EE7B7]'
                    }`}>
                      {m.priority}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-[#8A9AA5] leading-relaxed line-clamp-2">
                  {m.description}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-mono text-[#8A9AA5] bg-[#0B1420] p-2.5 rounded border border-[#22262E]">
                  <div>
                    <span className="text-[10px] text-[#8A9AA5] block">SECTORS</span>
                    <span className="text-[#F2F5F7] font-bold">{m.sectors.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A9AA5] block">WAYPOINTS</span>
                    <span className="text-[#F2F5F7] font-bold">{m.waypoints.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A9AA5] block">COMMANDER</span>
                    <span className="text-[#F2F5F7] truncate block">{m.assignedOperator.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#22262E] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {!isSelected && (
                    <button
                      type="button"
                      onClick={() => onSelectMission(m.id)}
                      className="px-2.5 py-1 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50]/40 rounded text-xs font-mono font-semibold transition-colors"
                    >
                      Set Active
                    </button>
                  )}
                  {isSelected && (
                    <span className="text-[11px] text-[#4CAF50] font-mono font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> CURRENT MISSION
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[#8A9AA5]">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(m)}
                    className="p-1 hover:text-[#F2F5F7] transition-colors"
                    title="Duplicate mission plan"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(m)}
                    className="p-1 hover:text-[#4CAF50] transition-colors"
                    title="Edit mission details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteMission(m.id)}
                    className="p-1 hover:text-[#FF4B4B] transition-colors"
                    title="Delete mission"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Mission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form onSubmit={handleSaveForm} className="bg-[#111B25] border border-[#4CAF50] rounded p-6 max-w-xl w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
              <h3 className="text-sm font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
                {editingMission ? `Edit Mission: ${editingMission.id}` : 'Create New Search Mission Plan'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-[#8A9AA5] hover:text-[#F2F5F7]"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Mission Operational Name</label>
              <input
                type="text"
                placeholder="e.g. Cascade Ridge Sector Charlie Recon"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Mission Type</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as MissionType)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                >
                  <option value="missing_person">Missing Person</option>
                  <option value="flood_response">Flood Response</option>
                  <option value="landslide_response">Landslide Response</option>
                  <option value="forest_search">Forest Search</option>
                  <option value="disaster_assessment">Disaster Assessment</option>
                  <option value="emergency_recon">Emergency Recon</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Priority Level</label>
                <select
                  value={formPriority}
                  onChange={e => setFormPriority(e.target.value as MissionPriority)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Workflow Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as MissionStatus)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                >
                  <option value="planned">Planned</option>
                  <option value="ready">Ready</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="aborted">Aborted</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Assigned Incident Commander / Operator</label>
              <input
                type="text"
                placeholder="Commander Name (e.g. Commander M. Reynolds)"
                value={formOperator}
                onChange={e => setFormOperator(e.target.value)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Description & Incident Brief</label>
              <textarea
                rows={2}
                placeholder="Incident background, missing party details, last reported position..."
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Operational Field Notes</label>
              <textarea
                rows={2}
                placeholder="Terrain, communications frequencies, weather forecasts..."
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#8A9AA5] hover:text-[#F2F5F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#4CAF50] hover:bg-[#388E3C] text-[#0B1420] font-bold text-xs rounded transition-colors"
              >
                Save Mission Plan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
