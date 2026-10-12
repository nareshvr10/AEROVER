import React, { useState, useEffect } from 'react';
import { Shield, Bell, Menu, X, Radio, Activity, RefreshCw } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Mission, SystemAlert } from '../../types';

interface NavbarProps {
  currentMission?: Mission;
  activePage: string;
  onNavigate: (page: string) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  alertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMission,
  activePage,
  onNavigate,
  mobileMenuOpen,
  onToggleMobileMenu,
  alertCount
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timeZoneMode, setTimeZoneMode] = useState<'UTC' | 'LOCAL'>('UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (timeZoneMode === 'UTC') {
        setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
      } else {
        setCurrentTime(now.toLocaleTimeString() + ' LOCAL');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeZoneMode]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 lg:px-6 h-14 bg-[#0B1420] border-b border-[#22262E]">
      {/* Zone 1: Wordmark / Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded text-[#8A9AA5] hover:text-[#F2F5F7] hover:bg-[#111B25]"
          aria-label="Toggle navigation drawer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('overview')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-7 h-7 rounded bg-[#182A1F] border border-[#4CAF50]/60 flex items-center justify-center text-[#4CAF50] group-hover:border-[#4CAF50] transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-wider text-[#F2F5F7] uppercase group-hover:text-[#4CAF50] transition-colors">
              AEROVER
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-[#8A9AA5]">
              AI Search & Rescue
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Contextual Mission & System Status */}
      <div className="hidden md:flex items-center gap-4 text-xs text-[#8A9AA5] whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-[#8A9AA5]">MISSION:</span>
          <span className="font-semibold text-[#F2F5F7]">
            {currentMission ? currentMission.name : 'No Active Mission'}
          </span>
        </div>

        <span className="text-[#22262E]">·</span>

        <div className="flex items-center gap-1.5">
          <span className="text-[#8A9AA5]">STATUS:</span>
          <span className="text-[#4CAF50] font-mono uppercase">
            {currentMission?.status || 'STANDBY'}
          </span>
        </div>

        <span className="text-[#22262E]">·</span>

        <div className="flex items-center gap-1.5">
          <span className="text-[#8A9AA5]">SOURCE:</span>
          <span className="text-[#F59E0B] font-mono">
            {currentMission?.isSimulatedData ? 'SIMULATION / TEST' : 'INTEGRATED LIVE'}
          </span>
        </div>
      </div>

      {/* Zone 3: Operations Actions & Clock */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setTimeZoneMode(prev => prev === 'UTC' ? 'LOCAL' : 'UTC')}
          title="Click to toggle UTC / Local time"
          className="font-mono text-xs tabular-nums text-[#8A9AA5] hover:text-[#F2F5F7] px-2 py-1 rounded bg-[#111B25] border border-[#22262E] transition-colors"
        >
          {currentTime}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('alerts')}
          className="relative p-2 rounded text-[#8A9AA5] hover:text-[#F2F5F7] hover:bg-[#111B25] border border-transparent hover:border-[#22262E] transition-colors"
          title="System Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[14px] h-[14px] px-1 text-[9px] font-bold text-white bg-[#FF4B4B] rounded-full font-mono">
              {alertCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('live_mission')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#182A1F] hover:bg-[#4CAF50] hover:text-[#0B1420] border border-[#4CAF50]/70 rounded transition-colors"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>LIVE MISSION</span>
        </button>
      </div>
    </header>
  );
};
