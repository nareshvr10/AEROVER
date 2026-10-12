import React, { useState } from 'react';
import { 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  FileText, 
  Compass, 
  Wifi, 
  CheckCircle2,
  Sliders,
  Filter
} from 'lucide-react';
import { SignalObservation, SignalSourceType, Mission } from '../types';

interface SignalObservationsPageProps {
  currentMission?: Mission;
  observations: SignalObservation[];
  onAddObservation: (obs: SignalObservation) => void;
}

export const SignalObservationsPage: React.FC<SignalObservationsPageProps> = ({
  currentMission,
  observations,
  onAddObservation
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sourceType, setSourceType] = useState<SignalSourceType>('authorized_radio_receiver');
  const [freqMhz, setFreqMhz] = useState('156.800');
  const [channelName, setChannelName] = useState('VHF Marine Ch 16 (Distress)');
  const [signalDbm, setSignalDbm] = useState('-78');
  const [bearingDeg, setBearingDeg] = useState('45');
  const [deviceCount, setDeviceCount] = useState('1');
  const [dataQuality, setDataQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [operatorNotes, setOperatorNotes] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');

  const filteredObservations = observations.filter(obs => {
    if (filterSource === 'all') return true;
    return obs.sourceType === filterSource;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorNotes.trim()) {
      alert('Please provide notes describing the authorized observation context.');
      return;
    }

    const newObs: SignalObservation = {
      id: `SIG-${Date.now().toString().slice(-4)}`,
      missionId: currentMission?.id || 'MSN-2026-001',
      sourceType,
      timestamp: new Date().toISOString(),
      frequencyMhz: freqMhz ? parseFloat(freqMhz) : undefined,
      channel: channelName || undefined,
      signalStrengthDbm: signalDbm ? parseFloat(signalDbm) : undefined,
      reportedBearingDeg: bearingDeg ? parseFloat(bearingDeg) : undefined,
      reportedDeviceCount: deviceCount ? parseInt(deviceCount, 10) : undefined,
      dataQuality,
      operatorNotes: operatorNotes.trim(),
      authorizedSourceId: 'DEV-OP-MANUAL',
      isSimulated: false
    };

    onAddObservation(newObs);
    setShowAddForm(false);
    setOperatorNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#38BDF8]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Authorized Signal & Radio Observations</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Logging lawful radio beacon receptions, VHF transmissions, and documented hardware bearings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddForm(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] text-[#4CAF50] border border-[#4CAF50] text-xs font-semibold rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Observation</span>
          </button>
        </div>
      </div>

      {/* Mandatory Lawful Signal Constraint & Ethics Policy Card */}
      <div className="p-4 bg-[#0B1420] border border-[#38BDF8]/40 rounded text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#38BDF8] font-bold uppercase font-mono tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Compliance & Telecommunications Protocol</span>
        </div>
        <p className="text-[#AAB6C2] leading-relaxed">
          • <strong>Signal strength alone does not establish direction or exact location.</strong> True directional telemetry requires calibrated antenna arrays and validated angle-of-arrival (AoA) bearing data.
        </p>
        <p className="text-[#AAB6C2] leading-relaxed">
          • <strong>Nearby RF packet counts do not represent connected individual phone users.</strong> Wi-Fi beacons and ambient RF packets fluctuate due to random MAC addressing and reflections.
        </p>
        <p className="text-[#AAB6C2] leading-relaxed">
          • <strong>Strict Privacy Boundaries:</strong> AEROVER does NOT perform unauthorized network scanning, communications interception, payload analysis, or IMSI catching. Only authorized emergency distress channels (e.g. VHF 121.5 MHz / 156.8 MHz) and operator-entered observations are permitted.
        </p>
      </div>

      {/* Add Observation Form Modal / Panel */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-[#111B25] border border-[#4CAF50] rounded space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
            <h3 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#4CAF50]" />
              Record Authorized Signal Observation
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#8A9AA5] hover:text-[#F2F5F7]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Source Category</label>
              <select
                value={sourceType}
                onChange={e => setSourceType(e.target.value as SignalSourceType)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
              >
                <option value="authorized_radio_receiver">Authorized Radio Receiver</option>
                <option value="operator_observation">Operator Manual Observation</option>
                <option value="df_bearing_adapter">Direction-Finding Antenna (AoA)</option>
                <option value="device_inventory_api">Authorized Network/Repeater API</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Frequency (MHz)</label>
              <input
                type="text"
                value={freqMhz}
                onChange={e => setFreqMhz(e.target.value)}
                placeholder="156.800"
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Channel / Protocol</label>
              <input
                type="text"
                value={channelName}
                onChange={e => setChannelName(e.target.value)}
                placeholder="VHF Ch 16 Distress"
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Signal Strength (dBm)</label>
              <input
                type="text"
                value={signalDbm}
                onChange={e => setSignalDbm(e.target.value)}
                placeholder="-75"
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Validated Bearing (Azimuth °)</label>
              <input
                type="text"
                value={bearingDeg}
                onChange={e => setBearingDeg(e.target.value)}
                placeholder="45"
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Reported Device Count</label>
              <input
                type="number"
                value={deviceCount}
                onChange={e => setDeviceCount(e.target.value)}
                min="0"
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Data Quality</label>
              <select
                value={dataQuality}
                onChange={e => setDataQuality(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] px-2.5 py-1.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
              >
                <option value="high">High (Direct Carrier Lock)</option>
                <option value="medium">Medium (Marginal SNR)</option>
                <option value="low">Low (Faint / Multipath)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1">Observation Log & Verification Notes</label>
            <textarea
              rows={2}
              value={operatorNotes}
              onChange={e => setOperatorNotes(e.target.value)}
              placeholder="Record context (e.g. Weak audible voice distress ping intercepted on marine transceiver, antenna oriented northeast)..."
              className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2.5 text-xs text-[#F2F5F7] rounded focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-[#8A9AA5] hover:text-[#F2F5F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#4CAF50] hover:bg-[#388E3C] text-[#0B1420] font-bold text-xs rounded transition-colors"
            >
              Submit Observation
            </button>
          </div>
        </form>
      )}

      {/* Observations List & Filter */}
      <div className="bg-[#111B25] border border-[#22262E] rounded p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#22262E]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4CAF50]" />
            <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider">
              RECORDED OBSERVATION LOGS ({filteredObservations.length})
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#8A9AA5]" />
            <select
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
              className="bg-[#0B1420] border border-[#22262E] px-2.5 py-1 text-xs text-[#8A9AA5] rounded focus:outline-none font-mono"
            >
              <option value="all">All Sources</option>
              <option value="authorized_radio_receiver">Radio Receivers</option>
              <option value="operator_observation">Operator Logs</option>
              <option value="df_bearing_adapter">DF Antennas</option>
            </select>
          </div>
        </div>

        {filteredObservations.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8A9AA5]">
            <Radio className="w-8 h-8 text-[#8A9AA5]/40 mx-auto mb-2" />
            <p>No authorized signal observations matching current filter.</p>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-[#22262E]">
            {filteredObservations.map(obs => (
              <div key={obs.id} className="py-3 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#F2F5F7] font-mono text-sm">
                      {obs.frequencyMhz ? `${obs.frequencyMhz} MHz` : 'RF BEACON'}
                    </span>
                    <span className="text-[#8A9AA5] font-mono">({obs.channel || obs.sourceType.replace('_', ' ')})</span>
                    {obs.isSimulated && (
                      <span className="px-1.5 py-0.2 bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 rounded text-[9px] font-mono">
                        SIMULATION FIXTURE
                      </span>
                    )}
                  </div>
                  <p className="text-[#AAB6C2] leading-relaxed">{obs.operatorNotes}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#8A9AA5] font-mono pt-1">
                    <span>QUALITY: <strong className="text-[#4CAF50] uppercase">{obs.dataQuality}</strong></span>
                    <span>BEARING: <strong className="text-[#38BDF8]">{obs.reportedBearingDeg ? `${obs.reportedBearingDeg}° Azimuth` : 'Omnidirectional'}</strong></span>
                    <span>SIGNAL: <strong className="text-[#F2F5F7]">{obs.signalStrengthDbm ? `${obs.signalStrengthDbm} dBm` : 'N/A'}</strong></span>
                    <span>SOURCE ID: {obs.authorizedSourceId}</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#8A9AA5] font-mono whitespace-nowrap shrink-0 text-right">
                  <div>{obs.timestamp.slice(0, 10)}</div>
                  <div className="text-[#4CAF50]">{obs.timestamp.slice(11, 19)} UTC</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
