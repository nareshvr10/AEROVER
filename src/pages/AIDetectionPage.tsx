import React, { useState } from 'react';
import { 
  Scan, 
  Check, 
  X, 
  Download, 
  Cpu, 
  AlertCircle, 
  FileSpreadsheet, 
  Eye, 
  Filter, 
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { AIDetection, DetectionStatus, Mission } from '../types';
import { DetectionAdapter } from '../services/detectionAdapter';

interface AIDetectionPageProps {
  currentMission?: Mission;
  detections: AIDetection[];
  onReviewDetection: (id: string, status: 'confirmed' | 'rejected', notes?: string) => void;
  onRunTestInference: () => void;
}

export const AIDetectionPage: React.FC<AIDetectionPageProps> = ({
  currentMission,
  detections,
  onReviewDetection,
  onRunTestInference
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [selectedDetection, setSelectedDetection] = useState<AIDetection | null>(detections[0] || null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [modelStatus, setModelStatus] = useState(DetectionAdapter.getModelStatus());
  const [isPingingModel, setIsPingingModel] = useState(false);

  const filtered = detections.filter(d => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (filterClass !== 'all' && d.className !== filterClass) return false;
    return true;
  });

  const handlePingModel = async () => {
    setIsPingingModel(true);
    const updated = await DetectionAdapter.pingModelServer();
    setModelStatus(updated);
    setIsPingingModel(false);
  };

  const handleConfirm = (id: string) => {
    onReviewDetection(id, 'confirmed', reviewNotes);
    setReviewNotes('');
  };

  const handleReject = (id: string) => {
    onReviewDetection(id, 'rejected', reviewNotes);
    setReviewNotes('');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(detections, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEROVER-AI-DETECTIONS-${currentMission?.id || 'ALL'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    let csv = 'DetectionID,Timestamp,Class,Confidence,Status,ModelName,ReviewedBy,Notes\n';
    detections.forEach(d => {
      csv += `"${d.id}","${d.timestamp}","${d.className}","${d.confidence}","${d.status}","${d.modelName}","${d.reviewedBy || ''}","${(d.notes || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEROVER-AI-DETECTIONS-${currentMission?.id || 'ALL'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Computer Vision & AI Detection Review</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Operator-in-the-loop candidate target verification, bounding box inspection, and model adapter health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRunTestInference}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded transition-colors"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Simulate AI Detection</span>
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
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Model Health Adapter Strip */}
      <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#8A9AA5]" />
            <span className="text-[#8A9AA5]">MODEL ADAPTER:</span>
            <span className="text-[#F2F5F7] font-bold">{modelStatus.modelName} ({modelStatus.version})</span>
          </div>
          <span className="text-[#22262E]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#8A9AA5]">STATUS:</span>
            <span className={modelStatus.isConnected ? 'text-[#4CAF50] font-bold' : 'text-[#F59E0B]'}>
              {modelStatus.isConnected ? 'CONNECTED' : 'STANDBY (FALLBACK ADAPTER)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#8A9AA5] text-[11px]">{modelStatus.endpointUrl}</span>
          <button
            type="button"
            onClick={handlePingModel}
            disabled={isPingingModel}
            className="px-2.5 py-1 bg-[#111B25] hover:bg-[#182A1F] text-[#4CAF50] border border-[#22262E] rounded flex items-center gap-1 text-[11px] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isPingingModel ? 'animate-spin' : ''}`} />
            <span>Test Ping</span>
          </button>
        </div>
      </div>

      {/* Ethical Protocol Notice */}
      <div className="p-3 bg-[#182A1F]/40 border border-[#4CAF50]/30 rounded text-xs text-[#8A9AA5] leading-relaxed">
        <strong>OPERATOR VERIFICATION MANDATE:</strong> Model predictions must never be used solely to conclude a missing party has been located or recovered. All computer vision outputs are screening assists that require human operator confirmation before dispatching field ground teams.
      </div>

      {/* Main Grid: Detections List (6 cols) & Inspector Panel (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detections List & Filters (6 cols) */}
        <div className="lg:col-span-6 bg-[#111B25] border border-[#22262E] rounded p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#22262E]">
            <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              CANDIDATE TARGETS ({filtered.length})
            </h2>

            {/* Filter controls */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-[#0B1420] border border-[#22262E] px-2 py-1 text-xs text-[#8A9AA5] rounded font-mono"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="bg-[#0B1420] border border-[#22262E] px-2 py-1 text-xs text-[#8A9AA5] rounded font-mono"
              >
                <option value="all">All Classes</option>
                <option value="person">Person</option>
                <option value="vehicle">Vehicle</option>
                <option value="smoke">Smoke</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {filtered.map(det => {
              const isSelected = selectedDetection?.id === det.id;
              return (
                <div
                  key={det.id}
                  onClick={() => setSelectedDetection(det)}
                  className={`p-3 rounded border transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-[#182A1F] border-[#4CAF50] text-[#F2F5F7]'
                      : 'bg-[#0B1420] border-[#22262E] text-[#8A9AA5] hover:border-[#4CAF50]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F2F5F7] font-mono uppercase">
                        {det.className}
                      </span>
                      <span className="text-[#4CAF50] font-mono tabular-nums">
                        {(det.confidence * 100).toFixed(0)}% CONF
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      det.status === 'confirmed' ? 'bg-[#064E3B] text-[#6EE7B7]' :
                      det.status === 'rejected' ? 'bg-[#7F1D1D] text-[#FCA5A5]' : 'bg-[#78350F] text-[#FCD34D]'
                    }`}>
                      {det.status}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-[#AAB6C2] line-clamp-1">{det.notes}</p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#8A9AA5]/80 font-mono">
                    <span>{det.id} · {det.modelName}</span>
                    <span>{det.timestamp.slice(11, 19)} UTC</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Target Inspector (6 cols) */}
        <div className="lg:col-span-6 bg-[#111B25] border border-[#22262E] rounded p-4 flex flex-col">
          <div className="pb-3 border-b border-[#22262E] flex items-center justify-between">
            <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#4CAF50]" />
              TARGET INSPECTOR & OPERATOR REVIEW
            </h2>
            {selectedDetection && (
              <span className="text-xs font-mono text-[#4CAF50] font-bold">
                {selectedDetection.id}
              </span>
            )}
          </div>

          {selectedDetection ? (
            <div className="mt-3 flex-1 flex flex-col space-y-4">
              {/* Image Frame with Bounding Box Overlay */}
              <div className="relative w-full h-[240px] bg-black rounded overflow-hidden border border-[#22262E] flex items-center justify-center">
                <img
                  src={selectedDetection.imageSnapshotUrl || '/src/assets/images/aerover_tactical_hero_1791780893966.jpg'}
                  alt={`AI Detection Snapshot ${selectedDetection.id}`}
                  className="w-full h-full object-cover brightness-95"
                />

                {/* Drawn Bounding Box */}
                {selectedDetection.boundingBox && (
                  <div
                    className="absolute border-2 border-[#FF4B4B] bg-[#FF4B4B]/20 pointer-events-none rounded-xs"
                    style={{
                      left: `${selectedDetection.boundingBox.x * 100}%`,
                      top: `${selectedDetection.boundingBox.y * 100}%`,
                      width: `${selectedDetection.boundingBox.width * 100}%`,
                      height: `${selectedDetection.boundingBox.height * 100}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 px-1 py-0.2 bg-[#FF4B4B] text-white font-mono text-[9px] font-bold">
                      {selectedDetection.className.toUpperCase()} {(selectedDetection.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#0B1420]/80 border border-[#22262E] text-[10px] font-mono text-[#4CAF50]">
                  {selectedDetection.coordinates ? `${selectedDetection.coordinates.lat.toFixed(4)}° N, ${selectedDetection.coordinates.lng.toFixed(4)}° W` : 'CAMERA OPTICAL FRAME'}
                </div>
              </div>

              {/* Inspection Details */}
              <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8A9AA5]">DETECTED CLASS:</span>
                  <span className="text-[#F2F5F7] font-bold uppercase">{selectedDetection.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9AA5]">MODEL CONFIDENCE:</span>
                  <span className="text-[#4CAF50] font-bold">{(selectedDetection.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9AA5]">INFERENCE ENGINE:</span>
                  <span className="text-[#F2F5F7]">{selectedDetection.modelName} ({selectedDetection.modelVersion})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9AA5]">RECORD STATUS:</span>
                  <span className="text-[#F59E0B] uppercase font-bold">{selectedDetection.status}</span>
                </div>
                {selectedDetection.reviewedBy && (
                  <div className="flex justify-between">
                    <span className="text-[#8A9AA5]">REVIEWED BY:</span>
                    <span className="text-[#38BDF8]">{selectedDetection.reviewedBy}</span>
                  </div>
                )}
              </div>

              {/* Operator Review Form */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block">Operator Review Findings & Field Notes</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Enter verification notes (e.g., Confirmed hiker jacket colors match report; ground team dispatched)..."
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleReject(selectedDetection.id)}
                  className="px-4 py-2 bg-[#7F1D1D] hover:bg-[#DC2626] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject Target</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirm(selectedDetection.id)}
                  className="px-4 py-2 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-bold rounded flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Target</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-[#8A9AA5]">
              Select a detection from the list to review details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
