import React from 'react';
import { NAV_ITEMS } from './Sidebar';
import { X, Shield } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  unreadAlertCount: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activePage,
  onNavigate,
  unreadAlertCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative w-72 max-w-[80vw] bg-[#0B1420] border-r border-[#22262E] flex flex-col h-full z-10 p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#22262E]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#182A1F] border border-[#4CAF50] flex items-center justify-center text-[#4CAF50]">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-[#F2F5F7] tracking-wider">AEROVER COMMAND</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#8A9AA5] hover:text-[#F2F5F7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-[#182A1F] text-[#4CAF50] font-semibold border border-[#4CAF50]/30'
                    : 'text-[#8A9AA5] hover:text-[#F2F5F7] hover:bg-[#111B25]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4CAF50]' : 'text-[#8A9AA5]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'alerts' && unreadAlertCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#FF4B4B] text-white">
                    {unreadAlertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-[#22262E] text-[11px] text-[#8A9AA5] font-mono text-center">
          SEE THE UNKNOWN. SAVE LIVES.
        </div>
      </div>
    </div>
  );
};
