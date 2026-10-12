import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight,
  Shield
} from 'lucide-react';
import { Mission } from '../types';

interface MissionHistoryPageProps {
  missions: Mission[];
  onSelectMission: (id: string) => void;
  onNavigateToReport: (missionId: string) => void;
}

export const MissionHistoryPage: React.FC<MissionHistoryPageProps> = ({
  missions,
  onSelectMission,
  onNavigateToReport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const historyMissions = missions.filter(m => {
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Search & Rescue Mission History Audit</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Archived search operations, cleared sectors, operator actions, and verified rescue outcome records.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#111B25] border border-[#22262E] rounded flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8A9AA5] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search archived mission logs by ID, code, or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] pl-9 pr-3 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-[#0B1420] border border-[#22262E] px-3 py-1.5 text-xs text-[#8A9AA5] rounded font-mono w-full sm:w-auto"
        >
          <option value="all">All Outcomes & Statuses</option>
          <option value="completed">Completed Missions</option>
          <option value="aborted">Aborted Missions</option>
          <option value="active">Active Operations</option>
          <option value="planned">Planned Staging</option>
        </select>
      </div>

      {/* Table of Missions */}
      <div className="bg-[#111B25] border border-[#22262E] rounded overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#22262E] bg-[#0B1420]/80 text-[#8A9AA5] font-mono uppercase text-[10px]">
              <th className="py-3 px-4">Mission ID</th>
              <th className="py-3 px-4">Name & Type</th>
              <th className="py-3 px-4">Commander</th>
              <th className="py-3 px-4">Sectors Cleared</th>
              <th className="py-3 px-4">Start Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#22262E]">
            {historyMissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#8A9AA5]">
                  No missions found in audit history matching your filters.
                </td>
              </tr>
            ) : (
              historyMissions.map(m => {
                const completedSectors = m.sectors.filter(s => s.status === 'completed').length;
                return (
                  <tr key={m.id} className="hover:bg-[#182A1F]/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#4CAF50]">
                      {m.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F2F5F7]">{m.name}</div>
                      <div className="text-[10px] text-[#8A9AA5] font-mono uppercase">
                        {m.type.replace('_', ' ')} · {m.priority}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#AAB6C2]">
                      {m.assignedOperator}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-[#F2F5F7]">{completedSectors}</span> / <span className="text-[#8A9AA5]">{m.sectors.length}</span>
                    </td>
                    <td className="py-3 px-4 text-[#8A9AA5] font-mono">
                      {m.startTime ? m.startTime.slice(0, 16).replace('T', ' ') : 'Not Started'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        m.status === 'completed' ? 'bg-[#1E3A8A] text-[#93C5FD]' :
                        m.status === 'active' ? 'bg-[#064E3B] text-[#6EE7B7]' :
                        m.status === 'aborted' ? 'bg-[#7F1D1D] text-[#FCA5A5]' : 'bg-[#1F2937] text-[#9CA3AF]'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigateToReport(m.id)}
                        className="text-xs text-[#4CAF50] hover:text-[#AAB6C2] font-mono inline-flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
