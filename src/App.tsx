/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { 
  Mission, 
  SARTeam, 
  SystemAlert, 
  AIDetection, 
  SignalObservation, 
  DeviceConnection, 
  DroneTelemetry, 
  AppSettings 
} from './types';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileDrawer } from './components/common/MobileDrawer';

// 16 Pages
import { OverviewPage } from './pages/OverviewPage';
import { LiveMissionPage } from './pages/LiveMissionPage';
import { LiveCameraPage } from './pages/LiveCameraPage';
import { SearchMapPage } from './pages/SearchMapPage';
import { SignalObservationsPage } from './pages/SignalObservationsPage';
import { AIDetectionPage } from './pages/AIDetectionPage';
import { DroneStatusPage } from './pages/DroneStatusPage';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { MissionPlannerPage } from './pages/MissionPlannerPage';
import { AlertsPage } from './pages/AlertsPage';
import { MissionHistoryPage } from './pages/MissionHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DeviceConnectionsPage } from './pages/DeviceConnectionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SystemDiagnosticsPage } from './pages/SystemDiagnosticsPage';
import { EmergencyCellularPage } from './pages/EmergencyCellularPage';
import RescuePortalPage from "./pages/RescuePortalPage";

export default function App() {
  const [activePage, setActivePage] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core domain states backed by StorageService
  const [missions, setMissions] = useState<Mission[]>(() => StorageService.getMissions());
  const [activeMissionId, setActiveMissionId] = useState<string>(() => StorageService.getActiveMissionId());
  const [teams, setTeams] = useState<SARTeam[]>(() => StorageService.getTeams());
  const [alerts, setAlerts] = useState<SystemAlert[]>(() => StorageService.getAlerts());
  const [detections, setDetections] = useState<AIDetection[]>(() => StorageService.getDetections());
  const [observations, setObservations] = useState<SignalObservation[]>(() => StorageService.getObservations());
  const [devices, setDevices] = useState<DeviceConnection[]>(() => StorageService.getDevices());
  const [telemetry, setTelemetry] = useState<DroneTelemetry>(() => StorageService.getTelemetry());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentMission = missions.find(m => m.id === activeMissionId) || missions[0];

  // Refresh active mission ID persistence
  const handleSelectMission = (id: string) => {
    setActiveMissionId(id);
    StorageService.setActiveMissionId(id);
    showToast(`Switched active mission to ${id}`);
  };

  const handleMissionUpdate = (updated: Mission) => {
    StorageService.saveMission(updated);
    setMissions(StorageService.getMissions());
    showToast(`Mission "${updated.name}" updated`);
  };

  const handleSaveMission = (mission: Mission) => {
    StorageService.saveMission(mission);
    setMissions(StorageService.getMissions());
  };

  const handleDeleteMission = (id: string) => {
    StorageService.deleteMission(id);
    const updated = StorageService.getMissions();
    setMissions(updated);
    if (activeMissionId === id && updated[0]) {
      setActiveMissionId(updated[0].id);
      StorageService.setActiveMissionId(updated[0].id);
    }
    showToast(`Mission ${id} removed`);
  };

  const handleNewDetection = (det: AIDetection) => {
    StorageService.saveDetection(det);
    setDetections(StorageService.getDetections());

    // Create an alert for new candidate detection
    const alert: SystemAlert = {
      id: `ALT-DET-${Date.now().toString().slice(-4)}`,
      severity: det.confidence > 0.8 ? 'high' : 'medium',
      title: `AI Candidate Target: ${det.className.toUpperCase()} (${(det.confidence * 100).toFixed(0)}%)`,
      description: `Computer vision detected ${det.className} candidate in mission frame. Operator review required.`,
      source: 'ai_service',
      timestamp: new Date().toISOString(),
      missionId: det.missionId,
      acknowledged: false,
      resolved: false,
      isSimulated: det.isSimulated
    };
    StorageService.saveAlert(alert);
    setAlerts(StorageService.getAlerts());
    showToast(`New AI Detection: ${det.className.toUpperCase()} (${(det.confidence * 100).toFixed(0)}%)`);
  };

  const handleReviewDetection = (id: string, status: 'confirmed' | 'rejected', notes?: string) => {
    StorageService.reviewDetection(id, status, 'Commander M. Reynolds', notes);
    setDetections(StorageService.getDetections());
    showToast(`Target ${id} marked as ${status}`);
  };

  const handleSimulateDetection = () => {
    const classes: AIDetection['className'][] = ['person', 'vehicle', 'smoke'];
    const chosen = classes[Math.floor(Math.random() * classes.length)];
    const conf = parseFloat((0.72 + Math.random() * 0.24).toFixed(2));

    const simulated: AIDetection = {
      id: `DET-${Date.now().toString().slice(-4)}`,
      missionId: currentMission?.id || 'MSN-2026-001',
      timestamp: new Date().toISOString(),
      className: chosen,
      confidence: conf,
      boundingBox: { x: 0.35, y: 0.3, width: 0.18, height: 0.22 },
      modelName: 'YOLOv8-SAR-Recon',
      modelVersion: 'v1.4-sim',
      status: 'pending',
      coordinates: { lat: 46.8560, lng: -121.7430 },
      notes: `Simulated test detection of ${chosen} on rocky ridge approach.`,
      isSimulated: true
    };
    handleNewDetection(simulated);
  };

  const handleAddObservation = (obs: SignalObservation) => {
    StorageService.saveObservation(obs);
    setObservations(StorageService.getObservations());
    showToast('Authorized signal observation recorded');
  };

  const handleAcknowledgeAlert = (id: string, notes?: string) => {
    StorageService.acknowledgeAlert(id, notes);
    setAlerts(StorageService.getAlerts());
  };

  const handleResolveAlert = (id: string) => {
    StorageService.resolveAlert(id);
    setAlerts(StorageService.getAlerts());
    showToast('Alert resolved');
  };

  const handleAddAlert = (alert: SystemAlert) => {
    StorageService.saveAlert(alert);
    setAlerts(StorageService.getAlerts());
    showToast(`Alert created: ${alert.title}`);
  };

  const handleAddTeam = (team: SARTeam) => {
    StorageService.saveTeam(team);
    setTeams(StorageService.getTeams());
    showToast(`Team ${team.name} registered`);
  };

  const handleUpdateTeam = (team: SARTeam) => {
    StorageService.saveTeam(team);
    setTeams(StorageService.getTeams());
  };

  const handleDeleteTeam = (id: string) => {
    StorageService.deleteTeam(id);
    setTeams(StorageService.getTeams());
    showToast(`Team ${id} removed`);
  };

  const handleUpdateDevice = (device: DeviceConnection) => {
    StorageService.updateDevice(device);
    setDevices(StorageService.getDevices());
  };

  const handleDeleteDevice = (id: string) => {
    StorageService.deleteDevice(id);
    setDevices(StorageService.getDevices());
  };

  const handleAddDevice = (device: DeviceConnection) => {
    StorageService.updateDevice(device);
    setDevices(StorageService.getDevices());
    showToast(`Adapter ${device.name} added`);
  };

  const handleUpdateTelemetry = (partial: Partial<DroneTelemetry>) => {
    StorageService.updateTelemetry(partial);
    setTelemetry(StorageService.getTelemetry());
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    const updated = StorageService.updateSettings(partial);
    setSettings(updated);
    showToast('System settings saved');
  };

  const handleResetDefaults = () => {
    StorageService.resetToDefault();
    setMissions(StorageService.getMissions());
    setActiveMissionId(StorageService.getActiveMissionId());
    setTeams(StorageService.getTeams());
    setAlerts(StorageService.getAlerts());
    setDetections(StorageService.getDetections());
    setObservations(StorageService.getObservations());
    setDevices(StorageService.getDevices());
    setTelemetry(StorageService.getTelemetry());
    setSettings(StorageService.getSettings());
    showToast('Database reset to factory prototype state');
  };

  const unreadAlertCount = alerts.filter(a => !a.acknowledged).length;
  const pendingDetectionCount = detections.filter(d => d.status === 'pending').length;

  return (
    <div className={`min-h-screen bg-[#0B1420] text-[#F2F5F7] flex flex-col font-sans select-none ${settings.theme === 'light' ? 'theme-light' : ''}`}>
      {/* Top Bar Header */}
      <Navbar
        currentMission={currentMission}
        activePage={activePage}
        onNavigate={setActivePage}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        alertCount={unreadAlertCount}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            activePage={activePage}
            onNavigate={setActivePage}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
            unreadAlertCount={unreadAlertCount}
            pendingDetectionCount={pendingDetectionCount}
          />
        </div>

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activePage={activePage}
          onNavigate={setActivePage}
          unreadAlertCount={unreadAlertCount}
        />

        {/* Main Content Scrollport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activePage === 'overview' && (
            <OverviewPage
              currentMission={currentMission}
              telemetry={telemetry}
              alerts={alerts}
              detections={detections}
              teams={teams}
              observations={observations}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'live_mission' && (
            <LiveMissionPage
              currentMission={currentMission}
              allMissions={missions}
              teams={teams}
              telemetry={telemetry}
              onMissionUpdate={handleMissionUpdate}
              onSelectMission={handleSelectMission}
            />
          )}

          {activePage === 'live_camera' && (
            <LiveCameraPage
              currentMission={currentMission}
              onNewDetection={handleNewDetection}
            />
          )}

          {activePage === 'search_map' && (
            <SearchMapPage
              currentMission={currentMission}
              teams={teams}
              onMissionUpdate={handleMissionUpdate}
            />
          )}

          {activePage === 'signal_observations' && (
            <SignalObservationsPage
              currentMission={currentMission}
              observations={observations}
              onAddObservation={handleAddObservation}
            />
          )}

          {activePage === 'ai_detection' && (
            <AIDetectionPage
              currentMission={currentMission}
              detections={detections}
              onReviewDetection={handleReviewDetection}
              onRunTestInference={handleSimulateDetection}
            />
          )}

          {activePage === 'drone_status' && (
            <DroneStatusPage
              telemetry={telemetry}
              currentMission={currentMission}
              onUpdateTelemetry={handleUpdateTelemetry}
            />
          )}

          {activePage === 'team_management' && (
            <TeamManagementPage
              currentMission={currentMission}
              teams={teams}
              onAddTeam={handleAddTeam}
              onUpdateTeam={handleUpdateTeam}
              onDeleteTeam={handleDeleteTeam}
            />
          )}

          {activePage === 'mission_planner' && (
            <MissionPlannerPage
              missions={missions}
              currentMissionId={activeMissionId}
              teams={teams}
              onSelectMission={handleSelectMission}
              onSaveMission={handleSaveMission}
              onDeleteMission={handleDeleteMission}
            />
          )}

          {activePage === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              currentMission={currentMission}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              onAddAlert={handleAddAlert}
            />
          )}

          {activePage === 'mission_history' && (
            <MissionHistoryPage
              missions={missions}
              onSelectMission={handleSelectMission}
              onNavigateToReport={(missionId) => {
                handleSelectMission(missionId);
                setActivePage('reports');
              }}
            />
          )}

          {activePage === 'analytics' && (
            <AnalyticsPage
              missions={missions}
              detections={detections}
              alerts={alerts}
              teams={teams}
            />
          )}

          {activePage === 'reports' && (
            <ReportsPage
              missions={missions}
              currentMission={currentMission}
              detections={detections}
              alerts={alerts}
              teams={teams}
            />
          )}

          {activePage === 'device_connections' && (
            <DeviceConnectionsPage
              devices={devices}
              onUpdateDevice={handleUpdateDevice}
              onDeleteDevice={handleDeleteDevice}
              onAddDevice={handleAddDevice}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetDefaults={handleResetDefaults}
            />
          )}

          {activePage === 'system_diagnostics' && (
            <SystemDiagnosticsPage />
          )}
          
          {activePage === 'emergency_cellular' && (
            <EmergencyCellularPage />
          )}
          {activePage === "rescue_portal" && <RescuePortalPage />}

        </main>
      </div>

      {/* Floating Tactical Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#182A1F] border border-[#4CAF50] text-[#F2F5F7] px-4 py-2.5 rounded shadow-xl text-xs font-mono flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
