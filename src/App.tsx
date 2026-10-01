/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Event,
  Camera,
  DashboardSummary,
  HourlyActivityBucket,
  CaregiverSettings,
  EventStatus,
} from './types/events';
import { ringCareApi } from './services/api';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ArchitectureModal } from './components/layout/ArchitectureModal';
import { EventDetailsModal } from './components/events/EventDetailsModal';
import { ToastProvider, useToast } from './components/common/Toast';
import { DashboardPage } from './pages/Dashboard';
import { LiveEventsPage } from './pages/LiveEvents';
import { CamerasPage } from './pages/Cameras';
import { ActivityPage } from './pages/Activity';
import { SettingsPage } from './pages/Settings';

const MainAppContent: React.FC = () => {
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [events, setEvents] = useState<Event[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivityBucket[]>([]);
  const [settings, setSettings] = useState<CaregiverSettings | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | EventStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Initial Data Fetch
  const refreshData = useCallback(async () => {
    try {
      const [eventsData, camerasData, summaryData, hourlyData, settingsData] =
        await Promise.all([
          ringCareApi.getEvents(),
          ringCareApi.getCameras(),
          ringCareApi.getDashboardSummary(),
          ringCareApi.getHourlyActivity(),
          ringCareApi.getSettings(),
        ]);

      setEvents(eventsData);
      setCameras(camerasData);
      setSummary(summaryData);
      setHourlyActivity(hourlyData);
      setSettings(settingsData);
    } catch (err) {
      showToast('error', 'Failed to load telemetry', 'Could not fetch care monitor state.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Acknowledge Event Action
  const handleAcknowledgeEvent = async (id: string, note?: string) => {
    try {
      const updated = await ringCareApi.acknowledgeEvent(id, note);
      setEvents(prev => prev.map(e => (e.id === id ? updated : e)));
      if (selectedEvent?.id === id) {
        setSelectedEvent(updated);
      }
      // Refresh summary numbers
      const newSummary = await ringCareApi.getDashboardSummary();
      setSummary(newSummary);
      showToast(
        'success',
        `Event ${id} Acknowledged`,
        `Marked by primary caregiver: ${updated.cameraName}`
      );
    } catch (err) {
      showToast('error', 'Action failed', 'Unable to acknowledge event.');
    }
  };

  // Dismiss Event Action
  const handleDismissEvent = async (id: string, note?: string) => {
    try {
      const updated = await ringCareApi.dismissEvent(id, note);
      setEvents(prev => prev.map(e => (e.id === id ? updated : e)));
      if (selectedEvent?.id === id) {
        setSelectedEvent(updated);
      }
      // Refresh summary numbers
      const newSummary = await ringCareApi.getDashboardSummary();
      setSummary(newSummary);
      showToast(
        'info',
        `Event ${id} Dismissed`,
        `Logged as non-critical: ${updated.cameraName}`
      );
    } catch (err) {
      showToast('error', 'Action failed', 'Unable to dismiss event.');
    }
  };

  // Simulate Incoming Camera Event
  const handleSimulateEvent = async () => {
    setIsSimulating(true);
    try {
      const newEvent = await ringCareApi.simulateIncomingEvent();
      setEvents(prev => [newEvent, ...prev]);
      const newSummary = await ringCareApi.getDashboardSummary();
      setSummary(newSummary);
      showToast(
        'warning',
        'New Optical Flow Triggered',
        `${newEvent.cameraName}: ${newEvent.summary}`
      );
    } catch (err) {
      showToast('error', 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset demo state
  const handleResetData = async () => {
    setIsLoading(true);
    try {
      await ringCareApi.resetDemoData();
      await refreshData();
      showToast('info', 'Demo Data Reset', 'Restored pristine demonstration events and sensors.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Camera Online/Offline
  const handleToggleCamera = async (cameraId: string) => {
    try {
      const updatedCamera = await ringCareApi.toggleCameraState(cameraId);
      setCameras(prev => prev.map(c => (c.id === cameraId ? updatedCamera : c)));
      const newSummary = await ringCareApi.getDashboardSummary();
      setSummary(newSummary);
      showToast(
        'info',
        `${updatedCamera.name} is now ${updatedCamera.status}`,
        `Camera status updated in prototype state.`
      );
    } catch {
      showToast('error', 'Failed to toggle camera state');
    }
  };

  // Update Settings
  const handleUpdateSettings = async (partial: Partial<CaregiverSettings>) => {
    try {
      const updated = await ringCareApi.updateSettings(partial);
      setSettings(updated);
      const newSummary = await ringCareApi.getDashboardSummary();
      setSummary(newSummary);
      showToast('success', 'Settings Saved', 'Caregiver monitoring preferences updated.');
    } catch {
      showToast('error', 'Failed to update settings');
    }
  };

  // Open Event Modal
  const handleOpenEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Select camera from camera card -> route to Live Events filtered by camera
  const handleSelectCameraEvents = (cameraId: string) => {
    setCurrentTab('live-events');
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-slate-900 flex flex-col lg:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        reviewCount={summary?.requiresReviewCount ?? 0}
        camerasOnlineCount={summary?.camerasOnlineCount ?? 0}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onSimulateEvent={handleSimulateEvent}
          onResetData={handleResetData}
          isSimulating={isSimulating}
          monitoringActive={settings?.monitoringEnabled ?? true}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              events={events}
              hourlyActivity={hourlyActivity}
              isLoading={isLoading}
              onSelectEvent={handleOpenEvent}
              onQuickAcknowledge={handleAcknowledgeEvent}
              onQuickDismiss={handleDismissEvent}
              activeStatusFilter={activeStatusFilter}
              onChangeStatusFilter={setActiveStatusFilter}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'live-events' && (
            <LiveEventsPage
              events={events}
              cameras={cameras}
              isLoading={isLoading}
              onSelectEvent={handleOpenEvent}
              onQuickAcknowledge={handleAcknowledgeEvent}
              onQuickDismiss={handleDismissEvent}
              onSimulateEvent={handleSimulateEvent}
              isSimulating={isSimulating}
            />
          )}

          {currentTab === 'cameras' && (
            <CamerasPage
              cameras={cameras}
              isLoading={isLoading}
              onSelectCamera={handleSelectCameraEvents}
              onToggleStatus={handleToggleCamera}
            />
          )}

          {currentTab === 'activity' && (
            <ActivityPage
              events={events}
              cameras={cameras}
              isLoading={isLoading}
              onSelectEvent={handleOpenEvent}
              onQuickAcknowledge={handleAcknowledgeEvent}
              onQuickDismiss={handleDismissEvent}
            />
          )}

          {currentTab === 'settings' && settings && (
            <SettingsPage
              settings={settings}
              cameras={cameras}
              onUpdateSettings={handleUpdateSettings}
              onToggleCamera={handleToggleCamera}
              onResetDemoData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Event Details Drawer / Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        onAcknowledge={handleAcknowledgeEvent}
        onDismiss={handleDismissEvent}
      />

      {/* Future Architecture & API Contract Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
