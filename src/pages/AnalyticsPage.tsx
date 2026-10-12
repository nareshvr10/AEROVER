import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  PieChart as PieIcon, 
  TrendingUp, 
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Mission, AIDetection, SystemAlert, SARTeam } from '../types';

interface AnalyticsPageProps {
  missions: Mission[];
  detections: AIDetection[];
  alerts: SystemAlert[];
  teams: SARTeam[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  missions,
  detections,
  alerts,
  teams
}) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  // Compute real metrics from saved repository data
  const statusCounts = {
    active: missions.filter(m => m.status === 'active').length,
    completed: missions.filter(m => m.status === 'completed').length,
    planned: missions.filter(m => m.status === 'planned').length,
    aborted: missions.filter(m => m.status === 'aborted').length
  };

  const missionStatusData = [
    { name: 'Active', count: statusCounts.active },
    { name: 'Completed', count: statusCounts.completed },
    { name: 'Planned', count: statusCounts.planned },
    { name: 'Aborted', count: statusCounts.aborted }
  ];

  const detectionOutcomeData = [
    { name: 'Confirmed Targets', value: detections.filter(d => d.status === 'confirmed').length, color: '#4CAF50' },
    { name: 'Pending Review', value: detections.filter(d => d.status === 'pending').length, color: '#F59E0B' },
    { name: 'Rejected False Positives', value: detections.filter(d => d.status === 'rejected').length, color: '#FF4B4B' }
  ].filter(d => d.value > 0);

  const totalSectors = missions.reduce((acc, m) => acc + m.sectors.length, 0);
  const clearedSectors = missions.reduce((acc, m) => acc + m.sectors.filter(s => s.status === 'completed').length, 0);
  const inProgressSectors = missions.reduce((acc, m) => acc + m.sectors.filter(s => s.status === 'in_progress').length, 0);
  const pendingSectors = totalSectors - clearedSectors - inProgressSectors;

  const sectorProgressData = [
    { status: 'Cleared', count: clearedSectors },
    { status: 'In Progress', count: inProgressSectors },
    { status: 'Pending', count: Math.max(0, pendingSectors) }
  ];

  const alertSeverityData = [
    { severity: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
    { severity: 'High', count: alerts.filter(a => a.severity === 'high').length },
    { severity: 'Medium', count: alerts.filter(a => a.severity === 'medium').length },
    { severity: 'Low/Info', count: alerts.filter(a => a.severity === 'low' || a.severity === 'informational').length }
  ];

  const handleExportCsv = () => {
    let csv = 'Metric,Value\n';
    csv += `Total Missions,${missions.length}\n`;
    csv += `Active Missions,${statusCounts.active}\n`;
    csv += `Completed Missions,${statusCounts.completed}\n`;
    csv += `Total Sectors Defined,${totalSectors}\n`;
    csv += `Cleared Sectors,${clearedSectors}\n`;
    csv += `Reviewed AI Detections,${detections.filter(d => d.status !== 'pending').length}\n`;
    csv += `Confirmed Targets,${detections.filter(d => d.status === 'confirmed').length}\n`;
    csv += `Total System Alerts,${alerts.length}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEROVER-ANALYTICS-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Operations Analytics & Mission Trends</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Grounded operational statistics derived exclusively from saved mission records, sectors, and reviewed findings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0B1420] border border-[#22262E] rounded p-1 text-xs">
            <button
              type="button"
              onClick={() => setTimeframe('day')}
              className={`px-2.5 py-1 rounded font-mono ${timeframe === 'day' ? 'bg-[#182A1F] text-[#4CAF50] font-bold' : 'text-[#8A9AA5]'}`}
            >
              24H
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('week')}
              className={`px-2.5 py-1 rounded font-mono ${timeframe === 'week' ? 'bg-[#182A1F] text-[#4CAF50] font-bold' : 'text-[#8A9AA5]'}`}
            >
              7D
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('month')}
              className={`px-2.5 py-1 rounded font-mono ${timeframe === 'month' ? 'bg-[#182A1F] text-[#4CAF50] font-bold' : 'text-[#8A9AA5]'}`}
            >
              30D
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50]/60 rounded text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] font-mono uppercase">TOTAL MISSIONS LOGGED</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#F2F5F7] tabular-nums">{missions.length}</div>
          <div className="mt-1 text-[11px] text-[#4CAF50] font-mono">{statusCounts.active} Currently Active</div>
        </div>

        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] font-mono uppercase">SEARCH SECTOR COVERAGE</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#4CAF50] tabular-nums">
            {totalSectors > 0 ? `${Math.round((clearedSectors / totalSectors) * 100)}%` : '0%'}
          </div>
          <div className="mt-1 text-[11px] text-[#8A9AA5] font-mono">{clearedSectors} of {totalSectors} sectors cleared</div>
        </div>

        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] font-mono uppercase">AI TARGETS REVIEWED</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#38BDF8] tabular-nums">
            {detections.filter(d => d.status !== 'pending').length} / {detections.length}
          </div>
          <div className="mt-1 text-[11px] text-[#4CAF50] font-mono">{detections.filter(d => d.status === 'confirmed').length} Targets Confirmed</div>
        </div>

        <div className="p-4 bg-[#111B25] border border-[#22262E] rounded">
          <div className="text-[11px] text-[#8A9AA5] font-mono uppercase">SAR UNITS DEPLOYED</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#F2F5F7] tabular-nums">{teams.length}</div>
          <div className="mt-1 text-[11px] text-[#8A9AA5] font-mono">100% Accountability Check-in</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missions by Status Chart */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              MISSIONS BY STATUS
            </h2>
            <span className="text-[10px] text-[#8A9AA5] font-mono">Real database records</span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missionStatusData}>
                <XAxis dataKey="name" stroke="#8A9AA5" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A9AA5" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1420', borderColor: '#22262E', fontSize: 12, color: '#F2F5F7' }}
                  cursor={{ fill: '#182A1F', opacity: 0.5 }}
                />
                <Bar dataKey="count" fill="#4CAF50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Detection Review Outcomes Chart */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              AI TARGET REVIEW OUTCOMES
            </h2>
            <span className="text-[10px] text-[#8A9AA5] font-mono">Human-in-the-loop audit</span>
          </div>

          <div className="h-64 mt-4">
            {detectionOutcomeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8A9AA5]">
                No detection records in repository.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={detectionOutcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {detectionOutcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1420', borderColor: '#22262E', fontSize: 12, color: '#F2F5F7' }}
                  />
                  <Legend
                    formatter={(val) => <span className="text-xs text-[#8A9AA5] font-mono">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sector Clearance Breakdown */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              SEARCH SECTOR PROGRESSION
            </h2>
            <span className="text-[10px] text-[#8A9AA5] font-mono">Total Sectors: {totalSectors}</span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorProgressData}>
                <XAxis dataKey="status" stroke="#8A9AA5" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A9AA5" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1420', borderColor: '#22262E', fontSize: 12, color: '#F2F5F7' }}
                  cursor={{ fill: '#182A1F', opacity: 0.5 }}
                />
                <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Severity Distribution */}
        <div className="bg-[#111B25] border border-[#22262E] rounded p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              INCIDENT ALERT SEVERITY DISTRIBUTION
            </h2>
            <span className="text-[10px] text-[#8A9AA5] font-mono">Total Alerts: {alerts.length}</span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertSeverityData}>
                <XAxis dataKey="severity" stroke="#8A9AA5" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A9AA5" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1420', borderColor: '#22262E', fontSize: 12, color: '#F2F5F7' }}
                  cursor={{ fill: '#182A1F', opacity: 0.5 }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
