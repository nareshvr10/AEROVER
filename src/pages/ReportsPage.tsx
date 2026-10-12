import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  Users, 
  MapPin, 
  Scan, 
  AlertTriangle,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Mission, AIDetection, SystemAlert, SARTeam, MissionReport } from '../types';

interface ReportsPageProps {
  missions: Mission[];
  currentMission?: Mission;
  detections: AIDetection[];
  alerts: SystemAlert[];
  teams: SARTeam[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  missions,
  currentMission,
  detections,
  alerts,
  teams
}) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(currentMission?.id || missions[0]?.id || '');

  const activeMission = missions.find(m => m.id === selectedMissionId) || currentMission;
  const missionDetections = detections.filter(d => d.missionId === selectedMissionId);
  const missionAlerts = alerts.filter(a => a.missionId === selectedMissionId);

  const reportId = `RPT-${activeMission?.id || '2026'}-${Date.now().toString().slice(-4)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!activeMission) return;
    const reportData = {
      reportId,
      platform: 'AEROVER AI Search & Rescue System',
      generatedAt: new Date().toISOString(),
      mission: activeMission,
      detections: missionDetections,
      alerts: missionAlerts,
      teamsInvolved: teams.filter(t => t.assignedMissionId === activeMission.id),
      dataLimitationsNotice: 'This report was produced by the AEROVER prototype management software. Telemetry fixtures marked as simulated do not represent verified flight recorder data.'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!activeMission) return;
    let csv = 'ReportID,MissionID,MissionName,Type,Priority,Status,SectorsTotal,SectorsCleared,DetectionsReviewed,AlertsCount\n';
    const cleared = activeMission.sectors.filter(s => s.status === 'completed').length;
    csv += `"${reportId}","${activeMission.id}","${activeMission.name}","${activeMission.type}","${activeMission.priority}","${activeMission.status}","${activeMission.sectors.length}","${cleared}","${missionDetections.length}","${missionAlerts.length}"\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in print) */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Mission After-Action Report Generator</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Compiled operational audit record, search sector clearance summary, and verified vision targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMissionId}
            onChange={e => setSelectedMissionId(e.target.value)}
            className="bg-[#0B1420] border border-[#22262E] px-3 py-1.5 text-xs text-[#F2F5F7] rounded font-mono"
          >
            {missions.map(m => (
              <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-2.5 py-1.5 bg-[#111B25] hover:bg-[#182A1F] text-[#8A9AA5] hover:text-[#F2F5F7] border border-[#22262E] rounded text-xs font-mono flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 bg-[#111B25] hover:bg-[#182A1F] text-[#8A9AA5] hover:text-[#F2F5F7] border border-[#22262E] rounded text-xs font-mono flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Official Printable Report Document Body */}
      {activeMission ? (
        <div className="bg-[#111B25] border border-[#22262E] rounded p-6 sm:p-8 space-y-6 print:border-none print:p-0 print:bg-white print:text-black">
          {/* Report Header */}
          <div className="border-b border-[#22262E] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#4CAF50] uppercase print:text-green-800">
                AEROVER TACTICAL OPERATIONS COMMAND
              </div>
              <h2 className="text-xl font-bold text-[#F2F5F7] print:text-black mt-1">
                AFTER-ACTION MISSION REPORT
              </h2>
              <div className="text-xs text-[#8A9AA5] print:text-gray-600 mt-0.5">
                Aerial Emergency Reconnaissance, Observation, Verification and Emergency Response
              </div>
            </div>

            <div className="text-right font-mono text-xs text-[#8A9AA5] print:text-gray-600">
              <div className="text-[#4CAF50] print:text-green-800 font-bold">{reportId}</div>
              <div>DATE: {new Date().toISOString().slice(0, 10)}</div>
              <div>CLASSIFICATION: OFFICIAL SAR LOG</div>
            </div>
          </div>

          {/* Mission Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-[#4CAF50] uppercase tracking-wider print:text-green-800">
              1. EXECUTIVE SUMMARY & MISSION PROFILE
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0B1420] print:bg-gray-100 p-4 rounded border border-[#22262E] text-xs font-mono">
              <div>
                <span className="text-[#8A9AA5] text-[10px] block">MISSION NAME</span>
                <span className="font-bold text-[#F2F5F7] print:text-black">{activeMission.name}</span>
              </div>
              <div>
                <span className="text-[#8A9AA5] text-[10px] block">INCIDENT TYPE</span>
                <span className="font-bold text-[#F2F5F7] print:text-black uppercase">{activeMission.type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-[#8A9AA5] text-[10px] block">PRIORITY / STATUS</span>
                <span className="font-bold text-[#4CAF50] print:text-green-800 uppercase">{activeMission.priority} / {activeMission.status}</span>
              </div>
              <div>
                <span className="text-[#8A9AA5] text-[10px] block">COMMANDER</span>
                <span className="font-bold text-[#F2F5F7] print:text-black">{activeMission.assignedOperator}</span>
              </div>
            </div>
            <p className="text-xs text-[#AAB6C2] print:text-gray-700 leading-relaxed pt-2">
              {activeMission.description}
            </p>
          </div>

          {/* Search Sector Coverage */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-[#4CAF50] uppercase tracking-wider print:text-green-800">
              2. SEARCH SECTOR CLEARANCE MATRIX
            </h3>
            <div className="border border-[#22262E] rounded overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0B1420] text-[#8A9AA5] text-[10px] uppercase border-b border-[#22262E]">
                  <tr>
                    <th className="py-2.5 px-3">Sector ID</th>
                    <th className="py-2.5 px-3">Sector Name</th>
                    <th className="py-2.5 px-3">Area (km²)</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22262E]">
                  {activeMission.sectors.map(sec => (
                    <tr key={sec.id} className="text-[#F2F5F7] print:text-black">
                      <td className="py-2 px-3 text-[#4CAF50]">{sec.id}</td>
                      <td className="py-2 px-3 font-semibold">{sec.name}</td>
                      <td className="py-2 px-3">{sec.areaSquareKm}</td>
                      <td className="py-2 px-3 uppercase">{sec.priority}</td>
                      <td className="py-2 px-3 uppercase text-[#38BDF8]">{sec.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Vision Candidates & Human Review Outcomes */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-[#4CAF50] uppercase tracking-wider print:text-green-800">
              3. REVIEWED AI COMPUTER VISION DETECTIONS
            </h3>
            {missionDetections.length === 0 ? (
              <p className="text-xs text-[#8A9AA5] italic">No AI visual detections logged for this mission.</p>
            ) : (
              <div className="space-y-2">
                {missionDetections.map(det => (
                  <div key={det.id} className="p-3 bg-[#0B1420] print:bg-gray-100 border border-[#22262E] rounded text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-[#F2F5F7] print:text-black">
                        {det.id} — {det.className.toUpperCase()} ({(det.confidence * 100).toFixed(0)}% Confidence)
                      </span>
                      <span className={`uppercase font-bold ${
                        det.status === 'confirmed' ? 'text-[#4CAF50]' :
                        det.status === 'rejected' ? 'text-[#FF4B4B]' : 'text-[#F59E0B]'
                      }`}>
                        VERIFICATION: {det.status}
                      </span>
                    </div>
                    <p className="text-[#AAB6C2] print:text-gray-700">{det.notes}</p>
                    <div className="text-[10px] text-[#8A9AA5] font-mono">
                      Engine: {det.modelName} · Imprint: {det.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incident Event Log & Operator Sign-off */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-[#4CAF50] uppercase tracking-wider print:text-green-800">
              4. OPERATIONAL EVENT LOG & TIMELINE
            </h3>
            <div className="p-3 bg-[#0B1420] print:bg-gray-100 border border-[#22262E] rounded font-mono text-xs text-[#AAB6C2] print:text-gray-800 whitespace-pre-line">
              {activeMission.notes || 'No field event log entries recorded.'}
            </div>
          </div>

          {/* Mandatory Data-Source Limitations Disclosure */}
          <div className="p-4 bg-[#0B1420]/70 border border-[#22262E] rounded text-xs text-[#8A9AA5] print:text-gray-600 space-y-1 leading-relaxed">
            <div className="font-bold uppercase font-mono text-[#F2F5F7] print:text-black">
              5. DATA SOURCE LIMITATIONS DISCLOSURE
            </div>
            <p>
              • <strong>Software Prototype Scope:</strong> This record was compiled in the AEROVER prototype environment. Hardware telemetry marked with "Simulation" was generated via local simulation adapters for system validation and does not constitute certified black-box avionics telemetry.
            </p>
            <p>
              • <strong>No Official Certification Claim:</strong> AEROVER makes no claim of governmental, civil aviation, or military flight airworthiness approval.
            </p>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-xs text-[#8A9AA5]">
          Select an active mission to generate report.
        </div>
      )}
    </div>
  );
};
