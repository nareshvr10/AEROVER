import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Filter, 
  Plus, 
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { SystemAlert, AlertSeverity, AlertSource, Mission } from '../types';

interface AlertsPageProps {
  alerts: SystemAlert[];
  currentMission?: Mission;
  onAcknowledgeAlert: (id: string, notes?: string) => void;
  onResolveAlert: (id: string) => void;
  onAddAlert: (alert: SystemAlert) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  currentMission,
  onAcknowledgeAlert,
  onResolveAlert,
  onAddAlert
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterResolved, setFilterResolved] = useState<'all' | 'active' | 'resolved'>('active');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<AlertSeverity>('medium');
  const [newSource, setNewSource] = useState<AlertSource>('operator');

  const filtered = alerts.filter(a => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterSource !== 'all' && a.source !== filterSource) return false;
    if (filterResolved === 'active' && a.resolved) return false;
    if (filterResolved === 'resolved' && !a.resolved) return false;
    return true;
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const alert: SystemAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      severity: newSeverity,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Operator initiated operational safety notice.',
      source: newSource,
      timestamp: new Date().toISOString(),
      missionId: currentMission?.id,
      acknowledged: false,
      resolved: false,
      isSimulated: false
    };

    onAddAlert(alert);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#7F1D1D] text-[#FCA5A5] font-bold uppercase">CRITICAL</span>;
      case 'high':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#9A3412] text-[#FDBA74] font-bold uppercase">HIGH</span>;
      case 'medium':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#78350F] text-[#FDE68A] font-bold uppercase">MEDIUM</span>;
      case 'low':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182A1F] text-[#6EE7B7] font-bold uppercase">LOW</span>;
      case 'informational':
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E3A8A] text-[#93C5FD] font-bold uppercase">INFO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF4B4B]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Operations Alert & Incident Center</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Real-time telemetry warnings, sensor dropouts, environmental notices, and operational logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Operational Alert</span>
        </button>
      </div>

      {/* Filter and Status Strip */}
      <div className="p-3 bg-[#111B25] border border-[#22262E] rounded flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#8A9AA5]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={filterResolved}
            onChange={e => setFilterResolved(e.target.value as any)}
            className="bg-[#0B1420] border border-[#22262E] px-2.5 py-1 text-xs text-[#8A9AA5] rounded font-mono"
          >
            <option value="active">Active Unresolved</option>
            <option value="resolved">Resolved History</option>
            <option value="all">All Alerts</option>
          </select>

          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="bg-[#0B1420] border border-[#22262E] px-2.5 py-1 text-xs text-[#8A9AA5] rounded font-mono"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="informational">Informational</option>
          </select>

          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="bg-[#0B1420] border border-[#22262E] px-2.5 py-1 text-xs text-[#8A9AA5] rounded font-mono"
          >
            <option value="all">All Sources</option>
            <option value="drone">Drone Link</option>
            <option value="camera">Camera</option>
            <option value="gps">GPS</option>
            <option value="ai_service">AI Vision</option>
            <option value="operator">Operator Log</option>
            <option value="network">Network/Weather</option>
          </select>
        </div>

        <div className="text-xs text-[#8A9AA5] font-mono">
          Showing <span className="text-[#F2F5F7] font-bold">{filtered.length}</span> alerts
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-[#111B25] border border-[#22262E] rounded divide-y divide-[#22262E]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8A9AA5]">
            <CheckCircle2 className="w-8 h-8 text-[#4CAF50] mx-auto mb-2 opacity-80" />
            <p>No alerts matching the selected filter criteria.</p>
          </div>
        ) : (
          filtered.map(alert => (
            <div key={alert.id} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="font-bold text-sm text-[#F2F5F7]">{alert.title}</span>
                  <span className="text-[10px] font-mono text-[#8A9AA5]">({alert.id})</span>
                  {alert.isSimulated && (
                    <span className="text-[9px] font-mono text-[#F59E0B] border border-[#F59E0B]/30 px-1 rounded">
                      SIMULATION
                    </span>
                  )}
                </div>

                <p className="text-[#AAB6C2] leading-relaxed">{alert.description}</p>

                {alert.operatorNotes && (
                  <div className="text-[11px] text-[#4CAF50] font-mono bg-[#0B1420] p-2 rounded border border-[#22262E]">
                    Operator note: {alert.operatorNotes}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#8A9AA5] font-mono pt-1">
                  <span>SOURCE: <strong className="text-[#F2F5F7] uppercase">{alert.source}</strong></span>
                  <span>TIME: {alert.timestamp.replace('T', ' ').slice(0, 19)} UTC</span>
                  <span>STATUS: <strong className={alert.resolved ? 'text-[#3B82F6]' : 'text-[#FF4B4B]'}>{alert.resolved ? 'RESOLVED' : alert.acknowledged ? 'ACKNOWLEDGED' : 'UNACKNOWLEDGED'}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                {!alert.acknowledged && (
                  <button
                    type="button"
                    onClick={() => onAcknowledgeAlert(alert.id, 'Operator acknowledged')}
                    className="px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50]/60 rounded text-xs font-semibold transition-colors"
                  >
                    Acknowledge
                  </button>
                )}

                {!alert.resolved ? (
                  <button
                    type="button"
                    onClick={() => onResolveAlert(alert.id)}
                    className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#2563EB] text-white rounded text-xs font-semibold transition-colors"
                  >
                    Resolve
                  </button>
                ) : (
                  <span className="text-xs font-mono text-[#4CAF50] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form onSubmit={handleCreateAlert} className="bg-[#111B25] border border-[#FF4B4B] rounded p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
              <h3 className="text-sm font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FF4B4B]" /> Log Operational Safety Alert
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-[#8A9AA5] hover:text-[#F2F5F7]"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Alert Headline</label>
              <input
                type="text"
                placeholder="e.g. Ground Crew Weather Hazard: River Crossing Flooded"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={e => setNewSeverity(e.target.value as AlertSeverity)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="informational">Informational</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Alert Source</label>
                <select
                  value={newSource}
                  onChange={e => setNewSource(e.target.value as AlertSource)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                >
                  <option value="operator">Operator Log</option>
                  <option value="network">Weather / Network</option>
                  <option value="drone">Drone Link</option>
                  <option value="camera">Camera</option>
                  <option value="gps">GPS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Detailed Description & Safety Impact</label>
              <textarea
                rows={3}
                placeholder="Describe situational impact and instructions for field units..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-[#8A9AA5] hover:text-[#F2F5F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#FF4B4B] hover:bg-[#DC2626] text-white font-bold text-xs rounded transition-colors"
              >
                Post Alert
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
