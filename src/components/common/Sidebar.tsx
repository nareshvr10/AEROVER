import React from 'react';
import { 
  LayoutDashboard, 
  Flame, 
  Camera, 
  Map as MapIcon, 
  Radio, 
  Scan, 
  Cpu, 
  Users, 
  CalendarRange, 
  Bell, 
  History, 
  BarChart3, 
  FileText, 
  Cable,
  RadioTower, 
  Settings as SettingsIcon, 
  Terminal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'operations' | 'sensors' | 'planning' | 'intel' | 'system';
  badge?: number | string;
}

export const NAV_ITEMS: NavItem[] = [
  // 1. Operations
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'operations' },
  { id: 'live_mission', label: 'Live Mission', icon: Flame, group: 'operations' },
  { id: 'live_camera', label: 'Live Camera', icon: Camera, group: 'operations' },
  { id: 'search_map', label: 'Search Map', icon: MapIcon, group: 'operations' },

  // 2. Sensors & AI
    // Emergency cellular rescue planning
  { id: 'emergency_cellular', label: 'Emergency Cellular', icon: RadioTower, group: 'sensors' },
  { id: 'signal_observations', label: 'Signal Observations', icon: Radio, group: 'sensors' },
  { id: 'ai_detection', label: 'AI Detection', icon: Scan, group: 'sensors' },
  { id: 'drone_status', label: 'Drone Status', icon: Cpu, group: 'sensors' },

  // 3. Planning & Coordination
  { id: 'team_management', label: 'Team Management', icon: Users, group: 'planning' },
  { id: 'mission_planner', label: 'Mission Planner', icon: CalendarRange, group: 'planning' },
  { id: 'alerts', label: 'Alerts', icon: Bell, group: 'planning' },
  { id: 'mission_history', label: 'Mission History', icon: History, group: 'planning' },

  // 4. Intelligence & Reporting
  { id: 'analytics', label: 'Analytics', icon: BarChart3, group: 'intel' },
  { id: 'reports', label: 'Reports', icon: FileText, group: 'intel' },

  // 5. System
  { id: 'device_connections', label: 'Device Connections', icon: Cable, group: 'system' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, group: 'system' },
  { id: 'system_diagnostics', label: 'System Diagnostics', icon: Terminal, group: 'system' },

  {
  id: "rescue_portal",
  label: "Rescue Portal",
  icon: RadioTower,
  group: "sensors",
},
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadAlertCount: number;
  pendingDetectionCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  unreadAlertCount,
  pendingDetectionCount
}) => {
  const groups: { key: NavItem['group']; label: string }[] = [
    { key: 'operations', label: 'Operations' },
    { key: 'sensors', label: 'Sensors & AI' },
    { key: 'planning', label: 'Planning & Team' },
    { key: 'intel', label: 'Analytics & Reports' },
    { key: 'system', label: 'System & Adapters' },
  ];

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] bg-[#0B1420] border-r border-[#22262E] transition-all duration-200 flex flex-col shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map(group => {
          const items = NAV_ITEMS.filter(item => item.group === group.key);
          if (items.length === 0) return null;

          return (
            <div key={group.key} className="space-y-1">
              {!collapsed && (
                <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-[#8A9AA5]/70 uppercase font-mono">
                  {group.label}
                </div>
              )}

              {items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                let badgeVal: string | number | undefined = undefined;
                if (item.id === 'alerts' && unreadAlertCount > 0) badgeVal = unreadAlertCount;
                if (item.id === 'ai_detection' && pendingDetectionCount > 0) badgeVal = pendingDetectionCount;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors group relative ${
                      isActive
                        ? 'bg-[#182A1F] text-[#4CAF50] font-semibold border border-[#4CAF50]/30'
                        : 'text-[#8A9AA5] hover:text-[#F2F5F7] hover:bg-[#111B25]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4CAF50]' : 'text-[#8A9AA5] group-hover:text-[#F2F5F7]'}`} />
                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!collapsed && badgeVal !== undefined && (
                      <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-[#FF4B4B] text-white">
                        {badgeVal}
                      </span>
                    )}

                    {collapsed && badgeVal !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF4B4B]" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Collapse toggle at bottom */}
      <div className="p-2 border-t border-[#22262E] flex justify-end">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded text-[#8A9AA5] hover:text-[#F2F5F7] hover:bg-[#111B25] w-full flex items-center justify-center transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
