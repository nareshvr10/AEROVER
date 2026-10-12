import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  RotateCcw, 
  Save, 
  Sliders, 
  Clock, 
  Compass, 
  Gauge, 
  Server, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { AppSettings, CoordinateFormat, DistanceUnit } from '../types';
import { StorageService } from '../services/storage';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onResetDefaults: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults
}) => {
  const [theme, setTheme] = useState(settings.theme);
  const [coordFormat, setCoordFormat] = useState<CoordinateFormat>(settings.coordinateFormat);
  const [distUnit, setDistUnit] = useState<DistanceUnit>(settings.distanceUnit);
  const [timeDisplay, setTimeDisplay] = useState<'utc' | 'local'>(settings.timeDisplay);
  const [cameraUrl, setCameraUrl] = useState(settings.cameraSourceUrl);
  const [apiUrl, setApiUrl] = useState(settings.apiBackendUrl);
  const [retentionDays, setRetentionDays] = useState(settings.dataRetentionDays.toString());
  const [simMode, setSimMode] = useState(settings.simulationMode);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      theme,
      coordinateFormat: coordFormat,
      distanceUnit: distUnit,
      timeDisplay,
      cameraSourceUrl: cameraUrl.trim(),
      apiBackendUrl: apiUrl.trim(),
      dataRetentionDays: parseInt(retentionDays, 10) || 30,
      simulationMode: simMode
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111B25] border border-[#22262E] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-base font-bold text-[#F2F5F7]">Operations Settings & Preferences</h1>
          </div>
          <p className="text-xs text-[#8A9AA5] mt-0.5">
            Tactical coordinate formats, distance units, camera stream defaults, and API backend routes.
          </p>
        </div>

        {savedFeedback && (
          <div className="flex items-center gap-1.5 text-xs text-[#4CAF50] font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Operations Units & Formats */}
        <div className="p-5 bg-[#111B25] border border-[#22262E] rounded space-y-4">
          <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#22262E]">
            <Compass className="w-4 h-4 text-[#4CAF50]" />
            COORDINATE & UNITS OF MEASURE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1.5">Coordinate Format</label>
              <select
                value={coordFormat}
                onChange={e => setCoordFormat(e.target.value as CoordinateFormat)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2 text-xs text-[#F2F5F7] rounded focus:outline-none"
              >
                <option value="decimal_degrees">Decimal Degrees (46.8523, -121.7603)</option>
                <option value="degrees_minutes_seconds">Degrees, Minutes, Seconds (DMS)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1.5">Distance & Altitude Units</label>
              <select
                value={distUnit}
                onChange={e => setDistUnit(e.target.value as DistanceUnit)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2 text-xs text-[#F2F5F7] rounded focus:outline-none"
              >
                <option value="metric_meters">Metric (Meters / Kilometers / km²)</option>
                <option value="imperial_feet">Imperial (Feet / Miles / sq mi)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1.5">Clock & Timestamp Mode</label>
              <select
                value={timeDisplay}
                onChange={e => setTimeDisplay(e.target.value as any)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2 text-xs text-[#F2F5F7] rounded focus:outline-none"
              >
                <option value="utc">Universal Time Coordinated (UTC)</option>
                <option value="local">Local System Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video & Backend Routes */}
        <div className="p-5 bg-[#111B25] border border-[#22262E] rounded space-y-4">
          <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#22262E]">
            <Server className="w-4 h-4 text-[#38BDF8]" />
            NETWORK ADAPTER ENDPOINTS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1.5">Default DroidCam Stream URL</label>
              <input
                type="text"
                value={cameraUrl}
                onChange={e => setCameraUrl(e.target.value)}
                placeholder="http://192.168.1.105:4747/video"
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
              />
              <span className="text-[10px] text-[#8A9AA5] mt-1 block">Default endpoint probed when DroidCam camera mode is engaged.</span>
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1.5">FastAPI Backend Server Base URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
              />
              <span className="text-[10px] text-[#8A9AA5] mt-1 block">Python FastAPI service endpoint for optional separate deployment.</span>
            </div>
          </div>
        </div>

        {/* Security & Data Integrity */}
        <div className="p-5 bg-[#111B25] border border-[#22262E] rounded space-y-4">
          <h2 className="text-xs font-bold font-mono text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#22262E]">
            <ShieldCheck className="w-4 h-4 text-[#4CAF50]" />
            SECURITY, PROTOTYPE STATE & DATA RETENTION
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="flex items-center justify-between p-3 bg-[#0B1420] border border-[#22262E] rounded">
              <div>
                <div className="text-xs font-semibold text-[#F2F5F7]">Mark Simulation Test Fixtures</div>
                <div className="text-[11px] text-[#8A9AA5]">Enforce clear visual disclaimers on synthetic test data</div>
              </div>
              <input
                type="checkbox"
                checked={simMode}
                onChange={e => setSimMode(e.target.checked)}
                className="w-4 h-4 accent-[#4CAF50] rounded"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8A9AA5] uppercase font-mono block mb-1.5">Audit Log Retention (Days)</label>
              <input
                type="number"
                min="7"
                max="365"
                value={retentionDays}
                onChange={e => setRetentionDays(e.target.value)}
                className="w-full bg-[#0B1420] border border-[#22262E] focus:border-[#4CAF50] p-2 text-xs font-mono text-[#F2F5F7] rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-[#0B1420] border border-[#22262E] rounded text-xs text-[#8A9AA5] leading-relaxed">
            <strong>Security Boundary Disclosure:</strong> This version is deployed as an authenticated development prototype. No API keys or credentials are stored insecurely in client storage. Production deployments should route through an HTTPS reverse proxy with mutual TLS.
          </div>
        </div>

        {/* Bottom Save & Reset Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all mission records, teams, and settings to factory prototype seed data?')) {
                onResetDefaults();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#8A9AA5] hover:text-[#FF4B4B] rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Prototype Seed Data</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-[#0B1420] font-bold text-xs rounded transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
