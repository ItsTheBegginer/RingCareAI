/**
 * RingCare AI - Service API Abstraction Layer
 * 
 * Future Architecture:
 *   Ring -> FastAPI / Express -> OpenCV -> AI Agent -> REST API -> This Client Service
 * 
 * Current Architecture:
 *   mockBackendStore -> This Client Service -> UI Components
 * 
 * All UI components MUST consume this service rather than accessing mock arrays directly.
 */

import {
  Event,
  Camera,
  DashboardSummary,
  HourlyActivityBucket,
  CaregiverSettings,
  EventFilterCriteria,
} from '../types/events';
import { mockBackendStore } from './mockApi';

// Simulated network latency helper to mimic async REST responses
const latency = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const ringCareApi = {
  /**
   * Future: GET /api/events?status=review&cameraId=cam_living_room
   */
  async getEvents(criteria?: EventFilterCriteria): Promise<Event[]> {
    await latency(80);
    return mockBackendStore.getEvents(criteria);
  },

  /**
   * Future: GET /api/events/:id
   */
  async getEvent(id: string): Promise<Event | null> {
    await latency(50);
    return mockBackendStore.getEventById(id);
  },

  /**
   * Future: POST /api/events/:id/acknowledge
   */
  async acknowledgeEvent(id: string, caregiverNote?: string): Promise<Event> {
    await latency(120);
    return mockBackendStore.acknowledgeEvent(id, caregiverNote);
  },

  /**
   * Future: POST /api/events/:id/dismiss
   */
  async dismissEvent(id: string, caregiverNote?: string): Promise<Event> {
    await latency(120);
    return mockBackendStore.dismissEvent(id, caregiverNote);
  },

  /**
   * Future: GET /api/cameras
   */
  async getCameras(): Promise<Camera[]> {
    await latency(80);
    return mockBackendStore.getCameras();
  },

  /**
   * Future: POST /api/cameras/:id/toggle-state
   */
  async toggleCameraState(id: string): Promise<Camera> {
    await latency(100);
    return mockBackendStore.toggleCameraStatus(id);
  },

  /**
   * Future: GET /api/dashboard/summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    await latency(60);
    return mockBackendStore.getDashboardSummary();
  },

  /**
   * Future: GET /api/analytics/hourly-activity
   */
  async getHourlyActivity(): Promise<HourlyActivityBucket[]> {
    await latency(60);
    return mockBackendStore.getHourlyActivity();
  },

  /**
   * Future: GET /api/settings
   */
  async getSettings(): Promise<CaregiverSettings> {
    await latency(60);
    return mockBackendStore.getSettings();
  },

  /**
   * Future: PATCH /api/settings
   */
  async updateSettings(partial: Partial<CaregiverSettings>): Promise<CaregiverSettings> {
    await latency(120);
    return mockBackendStore.updateSettings(partial);
  },

  /**
   * Demonstration Helper: Simulates receiving a new event via the pipeline
   */
  async simulateIncomingEvent(): Promise<Event> {
    await latency(150);
    return mockBackendStore.triggerSimulatedEvent();
  },

  /**
   * Demonstration Helper: Resets store to clean pristine state
   */
  async resetDemoData(): Promise<void> {
    await latency(100);
    mockBackendStore.resetAll();
  },
};
