import React, { useState } from 'react';
import { Event } from '../../types/events';
import { StatusBadge } from '../common/StatusBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import {
  X,
  CheckCircle2,
  XCircle,
  Eye,
  Cpu,
  Clock,
  Video,
  User,
  Activity,
  Timer,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (id: string, note?: string) => Promise<void>;
  onDismiss: (id: string, note?: string) => Promise<void>;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onAcknowledge,
  onDismiss,
}) => {
  const [caregiverNote, setCaregiverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !event) return null;

  const formatEventTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    } catch {
      return { time: iso, date: 'Today' };
    }
  };

  const { time, date } = formatEventTime(event.timestamp);

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await onAcknowledge(event.id, caregiverNote.trim() || undefined);
      setCaregiverNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    setIsSubmitting(true);
    try {
      await onDismiss(event.id, caregiverNote.trim() || undefined);
      setCaregiverNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-xl h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-details-title"
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="event-details-title" className="text-sm font-bold text-slate-900">
                  {event.cameraName} Event Detail
                </h2>
                <span className="text-[10px] font-mono text-slate-500">
                  {event.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {date} · {time}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={event.aiStatus} />
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* Section 1: Event Information */}
          <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="font-semibold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Event Information
              </span>
              <SeverityBadge severity={event.severity} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 text-[11px] block">Camera</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{event.cameraName}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Event Type</span>
                <span className="font-medium text-slate-800 mt-0.5 block capitalize">
                  {event.eventType.replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Time</span>
                <span className="font-mono text-slate-900 mt-0.5 block tabular-nums">{time}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Person Detected</span>
                <span className="font-medium text-slate-900 mt-0.5 flex items-center gap-1">
                  <User className="w-3 h-3 text-teal-600" />
                  {event.personDetected ? 'Yes' : 'No'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Motion Score</span>
                <span className="font-mono font-semibold text-slate-900 mt-0.5 block tabular-nums">
                  {Math.round(event.motionScore * 100)}%
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Stationary Duration</span>
                <span className="font-mono font-semibold text-amber-700 mt-0.5 block tabular-nums">
                  {event.stationaryDuration.toFixed(1)} seconds
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-slate-500 text-[11px] block">Summary</span>
              <p className="mt-0.5 text-xs text-slate-800 leading-relaxed font-normal">
                {event.summary}
              </p>
            </div>
          </div>

          {/* Section 2: Computer Vision Analysis (High-tech Dark Telemetry Panel) */}
          <div className="rounded-xl bg-[#0c1322] text-white border border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-400" />
                <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                  Computer Vision Analysis
                </h3>
              </div>
              <span className="text-[10px] font-mono text-teal-300 px-2 py-0.5 rounded bg-teal-950 border border-teal-800">
                MOCK CV INFERENCE
              </span>
            </div>

            {/* Wireframe Mock Camera Frame */}
            <div className="relative h-44 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden mb-3.5 flex flex-col justify-between p-3 select-none text-white">
              {/* Corner crosshairs to look like optical CV detection frame */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-teal-400" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-teal-400" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-teal-400" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-teal-400" />

              {/* Top overlay metadata */}
              <div className="flex items-center justify-between z-10 text-[10px] font-mono">
                <span className="text-teal-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  OPTICAL FLOW MATRIX
                </span>
                <span className="text-slate-400">ZONE: {event.cvAnalysis.primaryZone}</span>
              </div>

              {/* Mock Bounding Boxes */}
              <div className="relative flex-1 my-2">
                {event.cvAnalysis.boundingBoxes?.map(box => (
                  <div
                    key={box.id}
                    style={{
                      top: `${box.rect.top}%`,
                      left: `${box.rect.left}%`,
                      width: `${box.rect.width}%`,
                      height: `${box.rect.height}%`,
                      borderColor: box.color,
                    }}
                    className="absolute border-2 rounded-sm bg-teal-500/15 flex flex-col justify-between p-1 transition-all"
                  >
                    <span
                      style={{ backgroundColor: box.color }}
                      className="text-[9px] font-mono font-semibold text-black px-1 py-0.2 rounded-xs self-start leading-none"
                    >
                      {box.label} ({Math.round(box.confidence * 100)}%)
                    </span>
                    <span className="text-[9px] font-mono text-white self-end bg-black/60 px-1 rounded">
                      {event.cvAnalysis.stationaryDuration > 0
                        ? `HOLD: ${event.cvAnalysis.stationaryDuration}s`
                        : 'MOVING'}
                    </span>
                  </div>
                ))}

                {(!event.cvAnalysis.boundingBoxes || event.cvAnalysis.boundingBoxes.length === 0) && (
                  <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                    Stationary baseline calibrated for {event.cameraName}
                  </div>
                )}
              </div>

              {/* Bottom notice */}
              <div className="flex items-center justify-between z-10 text-[10px] text-slate-300 border-t border-slate-800 pt-1 font-mono">
                <span>POSTURE: {event.cvAnalysis.postureEstimation?.toUpperCase() || 'NORMAL'}</span>
                <span className="text-teal-400">CONFIDENCE: {Math.round(event.cvAnalysis.confidence * 100)}%</span>
              </div>
            </div>

            {/* CV Metric Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Person detected</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {event.cvAnalysis.personDetected ? 'Yes (✓)' : 'No'}
                </span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Motion detected</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {event.cvAnalysis.motionDetected ? 'Yes (✓)' : 'No'}
                </span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Motion score</span>
                <span className="font-semibold text-teal-300 mt-0.5 block tabular-nums">
                  {Math.round(event.cvAnalysis.motionScore * 100)}%
                </span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Stationary duration</span>
                <span className="font-semibold text-amber-300 mt-0.5 block tabular-nums">
                  {event.cvAnalysis.stationaryDuration.toFixed(1)} sec
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: AI Assessment (Clearly labeled Mock AI) */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-white border border-indigo-200/70 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                  AI Assessment
                </h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-700 px-2 py-0.5 rounded bg-indigo-100/70 border border-indigo-200 font-medium">
                MOCK AGENT REASONING
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{event.aiAssessment.statusLabel}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {event.aiAssessment.summary}
                </p>
                {event.aiAssessment.rationale && (
                  <p className="mt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 font-mono">
                    <span className="text-slate-600 font-semibold">Agent rationale:</span>{' '}
                    {event.aiAssessment.rationale}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-teal-50/80 border border-teal-200/80">
                <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block mb-1">
                  Recommended Action
                </span>
                <p className="text-xs text-teal-950 font-medium">
                  {event.aiAssessment.recommendedAction}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Caregiver Action History if already logged */}
          {event.actionLog && (
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Action Logged by Caregiver</span>
              </div>
              <p className="text-xs text-slate-700">
                <strong>{event.actionLog.actor}</strong> marked this event as{' '}
                <span className="font-mono text-teal-800 font-semibold">{event.actionLog.action}</span> at{' '}
                {new Date(event.actionLog.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                .
              </p>
              {event.actionLog.caregiverNote && (
                <p className="mt-1 text-xs text-slate-500 italic">
                  "{event.actionLog.caregiverNote}"
                </p>
              )}
            </div>
          )}

          {/* Caregiver optional note input before submitting */}
          <div>
            <label className="text-[11px] font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Caregiver Observation Note (Optional)</span>
            </label>
            <input
              type="text"
              value={caregiverNote}
              onChange={e => setCaregiverNote(e.target.value)}
              placeholder="e.g., Checked on resident, reading comfortably in chair."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500"
            />
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-white flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              disabled={isSubmitting || event.aiStatus === 'dismissed'}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 disabled:opacity-50 border border-slate-200/80 rounded-lg transition-colors shadow-2xs"
            >
              <XCircle className="w-4 h-4 text-slate-500" />
              <span>Dismiss</span>
            </button>

            <button
              onClick={handleAcknowledge}
              disabled={isSubmitting || event.aiStatus === 'acknowledged'}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acknowledge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
