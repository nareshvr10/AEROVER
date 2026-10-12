import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Plus, 
  Trash2, 
  Download, 
  Compass, 
  MapPin, 
  Check, 
  Crosshair, 
  Navigation, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Mission, SearchSector, GeoPoint, SARTeam, Waypoint } from '../types';
import { TacticalMap } from '../components/common/TacticalMap';
import { GpsAdapter } from '../services/gpsAdapter';

interface SearchMapPageProps {
  currentMission?: Mission;
  teams: SARTeam[];
  onMissionUpdate: (mission: Mission) => void;
}

export const SearchMapPage: React.FC<SearchMapPageProps> = ({
  currentMission,
  teams,
  onMissionUpdate
}) => {
  const [isDrawingSector, setIsDrawingSector] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<GeoPoint[]>([]);
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorPriority, setNewSectorPriority] = useState<SearchSector['priority']>('high');

  // Manual GPS coordinate tester / locator
  const [manualLat, setManualLat] = useState('46.8540');
  const [manualLng, setManualLng] = useState('-121.7450');
  const [browserGpsStatus, setBrowserGpsStatus] = useState<string | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<string | null>(null);

  const handleMapClick = (point: GeoPoint) => {
    if (isDrawingSector) {
      setDrawnPoints(prev => [...prev, point]);
    }
  };

  const handleSaveSector = () => {
    if (!currentMission) return;
    if (drawnPoints.length < 3) {
      alert('A search sector requires at least 3 boundary vertices.');
      return;
    }
    if (!newSectorName.trim()) {
      alert('Please provide a name for this search sector (e.g. Sector Delta).');
      return;
    }

    // Estimate area roughly (shoelace formula)
    let area = 0;
    for (let i = 0; i < drawnPoints.length; i++) {
      const j = (i + 1) % drawnPoints.length;
      area += drawnPoints[i].lat * drawnPoints[j].lng;
      area -= drawnPoints[j].lat * drawnPoints[i].lng;
    }
    const approxSqKm = parseFloat((Math.abs(area) * 111 * 111 * 0.5).toFixed(2));

    const newSector: SearchSector = {
      id: `SEC-${Date.now().toString().slice(-4)}`,
      name: newSectorName.trim(),
      status: 'pending',
      polygon: drawnPoints,
      areaSquareKm: approxSqKm || 1.25,
      priority: newSectorPriority,
      notes: 'Operator defined search sector boundary.'
    };

    const updated: Mission = {
      ...currentMission,
      sectors: [...currentMission.sectors, newSector],
      lastUpdated: new Date().toISOString()
    };

    onMissionUpdate(updated);
    setIsDrawingSector(false);
    setDrawnPoints([]);
    setNewSectorName('');
  };

  const handleDeleteSector = (sectorId: string) => {
    if (!currentMission) return;
    const updated: Mission = {
      ...currentMission,
      sectors: currentMission.sectors.filter(s => s.id !== sectorId),
      lastUpdated: new Date().toISOString()
    };
    onMissionUpdate(updated);
  };

  const handleRequestBrowserGps = async () => {
    setBrowserGpsStatus('Requesting browser location permission...');
    try {
      const reading = await GpsAdapter.requestBrowserPosition();
      setManualLat(reading.latitude.toFixed(6));
      setManualLng(reading.longitude.toFixed(6));
      setBrowserGpsStatus(`Acquired browser GPS: ${reading.latitude.toFixed(4)}° N, ${Math.abs(reading.longitude).toFixed(4)}° W (Accuracy: ±${reading.accuracyMeters?.toFixed(1)}m)`);
    } catch (err: any) {
      setBrowserGpsStatus(`Browser GPS unavailable: ${err.message}`);
    }
  };

  const handleCalculateDistanceToLkp = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) return;

    const lkp = currentMission?.waypoints.find(w => w.name.includes('LKP'))?.coordinates;
    if (lkp) {
      const dist = GpsAdapter.calculateDistanceMeters({ lat, lng }, lkp);
      setCalculatedDistance(`${(dist / 1000).toFixed(2)} km (${Math.round(dist)} meters) from Last Known Position (LKP)`);
    } else {
      setCalculatedDistance('No Last Known Position (LKP) defined in current mission.');
    }
  };

  const handleExportSectorsJson = () => {
    if (!currentMission) return;
    const blob = new Blob([JSON.stringify(currentMission.sectors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEROVER-SECTORS-${currentMission.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSectorsCsv = () => {
    if (!currentMission) return;
    let csv = 'SectorID,Name,Priority,Status,AreaSqKm,VertexCount\n';
    currentMission.sectors.forEach(s => {
      csv += `"${s.id}","${s.name}","${s.priority}","${s.status}","${s.areaSquareKm || 0}","${s.polygon.length}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEROVER-SECTORS-${currentMission.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Tactical Search Map & GPS Operations</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Interactive mission topographic grid, search sector geometry planner, and GPS coordinate utilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isDrawingSector ? (
            <button
              type="button"
              onClick={() => { setIsDrawingSector(true); setDrawnPoints([]); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draw New Search Sector</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setIsDrawingSector(false); setDrawnPoints([]); }}
                className="px-3 py-1.5 bg-[#22262E] hover:bg-[#333] text-xs text-[#8A9AA5] rounded"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleExportSectorsJson}
            className="px-2.5 py-1.5 bg-[#111B25] hover:bg-[#182A1F] text-[#8A9AA5] hover:text-[#F2F5F7] border border-[#22262E] rounded text-xs font-mono flex items-center gap-1 transition-colors"
            title="Export Sectors as JSON"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          <button
            type="button"
            onClick={handleExportSectorsCsv}
            className="px-2.5 py-1.5 bg-[#111B25] hover:bg-[#182A1F] text-[#8A9AA5] hover:text-[#F2F5F7] border border-[#22262E] rounded text-xs font-mono flex items-center gap-1 transition-colors"
            title="Export Sectors as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Drawing Form Bar if Active */}
      {isDrawingSector && (
        <div className="p-4 bg-[#182A1F] border border-[#4CAF50] rounded space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#F2F5F7] uppercase font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#4CAF50] animate-pulse" />
              Sector Boundary Creation Mode
            </h2>
            <span className="text-xs font-mono text-[#4CAF50] font-bold">
              {drawnPoints.length} vertices clicked (min 3 required)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Sector Name (e.g. Sector Delta — West Ridge)"
              value={newSectorName}
              onChange={e => setNewSectorName(e.target.value)}
              className="bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-3 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
            />

            <select
              value={newSectorPriority}
              onChange={e => setNewSectorPriority(e.target.value as SearchSector['priority'])}
              className="bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-3 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
            >
              <option value="high">High Priority</option>
              <option value="critical">Critical Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <button
              type="button"
              onClick={handleSaveSector}
              disabled={drawnPoints.length < 3 || !newSectorName.trim()}
              className="px-4 py-1.5 bg-[#4CAF50] hover:bg-[#388E3C] text-[#0B1420] font-bold text-xs rounded disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Search Sector
            </button>
          </div>
          <p className="text-[11px] text-[#AAB6C2]">
            Click directly on the map surface below to position each boundary corner of the search polygon.
          </p>
        </div>
      )}

      {/* Full Interactive Map Viewport */}
      <div className="bg-[#111B25] border border-[#22262E] rounded p-4">
        <TacticalMap
          sectors={currentMission?.sectors || []}
          waypoints={currentMission?.waypoints || []}
          teams={teams}
          dronePosition={{ lat: 46.8540, lng: -121.7450 }}
          lastKnownPosition={currentMission?.waypoints.find(w => w.name.includes('LKP'))?.coordinates}
          isDrawingSector={isDrawingSector}
          drawnPoints={drawnPoints}
          onMapClick={handleMapClick}
          className="h-[520px] w-full"
        />
      </div>

      {/* Lower Grid: Sector Management Table + GPS Coordinate Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sector Management Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#111B25] border border-[#22262E] rounded p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              CONFIGURED SEARCH SECTORS ({currentMission?.sectors.length || 0})
            </h3>
            <span className="text-[11px] text-[#8A9AA5] font-mono">
              Total Area: {currentMission?.sectors.reduce((acc, s) => acc + (s.areaSquareKm || 0), 0).toFixed(1)} km²
            </span>
          </div>

          <div className="mt-3 divide-y divide-[#22262E] max-h-[300px] overflow-y-auto">
            {currentMission?.sectors.map(sec => (
              <div key={sec.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-[#F2F5F7]">{sec.name}</div>
                  <div className="text-[10px] text-[#8A9AA5] font-mono mt-0.5">
                    {sec.areaSquareKm} km² · Vertices: {sec.polygon.length} · Status: {sec.status.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    sec.priority === 'critical' ? 'bg-[#7F1D1D] text-[#FCA5A5]' :
                    sec.priority === 'high' ? 'bg-[#78350F] text-[#FDE68A]' : 'bg-[#182A1F] text-[#6EE7B7]'
                  }`}>
                    {sec.priority}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSector(sec.id)}
                    className="p-1 text-[#8A9AA5] hover:text-[#FF4B4B] transition-colors"
                    title="Delete Sector"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GPS Coordinate Utility (5 cols) */}
        <div className="lg:col-span-5 bg-[#111B25] border border-[#22262E] rounded p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#4CAF50]" />
              GPS Coordinate Utilities
            </h3>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Latitude</label>
                <input
                  type="text"
                  value={manualLat}
                  onChange={e => setManualLat(e.target.value)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Longitude</label>
                <input
                  type="text"
                  value={manualLng}
                  onChange={e => setManualLng(e.target.value)}
                  className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
                />
              </div>
            </div>

            {/* DMS Conversion Display */}
            <div className="p-2.5 bg-[#0B1420] border border-[#22262E] rounded text-xs font-mono text-[#8A9AA5]">
              <span className="text-[10px] uppercase block text-[#4CAF50]">DMS Representation:</span>
              <span className="text-[#F2F5F7]">
                {GpsAdapter.formatDMS(parseFloat(manualLat) || 0, parseFloat(manualLng) || 0)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRequestBrowserGps}
                className="px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50]/60 text-xs font-semibold rounded transition-colors"
              >
                Use Device GPS
              </button>

              <button
                type="button"
                onClick={handleCalculateDistanceToLkp}
                className="px-3 py-1.5 bg-[#111B25] hover:bg-[#22262E] text-[#F2F5F7] border border-[#22262E] text-xs font-semibold rounded transition-colors"
              >
                Distance to LKP
              </button>
            </div>

            {browserGpsStatus && (
              <p className="text-[11px] text-[#8A9AA5] font-mono italic">{browserGpsStatus}</p>
            )}

            {calculatedDistance && (
              <div className="p-2 bg-[#182A1F] border border-[#4CAF50]/40 rounded text-xs font-mono text-[#4CAF50]">
                {calculatedDistance}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
