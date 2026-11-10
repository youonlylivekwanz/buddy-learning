'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Scorm12API,
  Scorm2004API,
  XApiStatementPayload,
  XApiVerb,
} from '@/lib/scorm/types';
import {
  Monitor,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface ScormRuntimeBridgeProps {
  courseId: string;
  courseTitle: string;
  enrollmentId: string;
  scormUrl: string;
  scormVersion?: 'SCORM_12' | 'SCORM_2004';
  initialCmiState?: Record<string, string> | null;
  learnerId: string;
  learnerName: string;
  learnerEmail?: string;
  onClose: () => void;
  onCompleted?: () => void;
}

export const ScormRuntimeBridge: React.FC<ScormRuntimeBridgeProps> = ({
  courseId,
  courseTitle,
  enrollmentId,
  scormUrl,
  scormVersion = 'SCORM_12',
  initialCmiState,
  learnerId,
  learnerName,
  learnerEmail = 'learner@buddylearning.co.za',
  onClose,
  onCompleted,
}) => {
  const [cmiStore, setCmiStore] = useState<Record<string, string>>(() => ({
    'cmi.core.lesson_status': 'incomplete',
    'cmi.core.lesson_location': '',
    'cmi.core.score.raw': '0',
    'cmi.core.score.min': '0',
    'cmi.core.score.max': '100',
    'cmi.suspend_data': '',
    'cmi.completion_status': 'incomplete',
    'cmi.success_status': 'unknown',
    'cmi.location': '',
    'cmi.score.raw': '0',
    ...(initialCmiState || {}),
  }));

  const [lastEvent, setLastEvent] = useState<string>('Ready');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveStatements, setLiveStatements] = useState<string[]>([]);
  const cmiRef = useRef(cmiStore);
  cmiRef.current = cmiStore;

  const isCompleted =
    cmiStore['cmi.core.lesson_status'] === 'completed' ||
    cmiStore['cmi.core.lesson_status'] === 'passed' ||
    cmiStore['cmi.completion_status'] === 'completed' ||
    cmiStore['cmi.success_status'] === 'passed';

  const rawScore = Number(cmiStore['cmi.core.score.raw'] || cmiStore['cmi.score.raw'] || 0);

  // Flush CMI snapshot and xAPI statement to the server
  const flushTelemetry = useCallback(
    async (verb: XApiVerb, customResult?: Record<string, unknown>) => {
      setIsSyncing(true);
      const currentCmi = cmiRef.current;
      const scoreVal = Number(currentCmi['cmi.core.score.raw'] || currentCmi['cmi.score.raw'] || 0);
      const isComplete =
        currentCmi['cmi.core.lesson_status'] === 'completed' ||
        currentCmi['cmi.core.lesson_status'] === 'passed' ||
        currentCmi['cmi.completion_status'] === 'completed' ||
        currentCmi['cmi.success_status'] === 'passed';

      const payload: XApiStatementPayload = {
        enrollmentId,
        actor: {
          name: learnerName,
          mbox: `mailto:${learnerEmail}`,
          objectType: 'Agent',
        },
        verb,
        object: {
          id: `urn:buddy-lms:course:${courseId}`,
          objectType: 'Activity',
          definition: {
            name: { 'en-US': courseTitle },
            type: 'http://adlnet.gov/expapi/activities/course',
          },
        },
        result: {
          score: {
            raw: scoreVal,
            min: 0,
            max: 100,
            scaled: scoreVal / 100,
          },
          completion: isComplete,
          success: isComplete,
          ...customResult,
        },
        context: {
          registration: enrollmentId,
          extensions: {
            'https://buddylearning.co.za/xapi/scorm-version': scormVersion,
          },
        },
        cmiSnapshot: currentCmi,
      };

      try {
        const res = await fetch('/api/telemetry/xapi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data?.data?.certificateIssued && onCompleted) {
          onCompleted();
        }
      } catch (err) {
        console.warn('[SCORM:Sync:Error]', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [courseId, courseTitle, enrollmentId, learnerEmail, learnerName, onCompleted, scormVersion]
  );

  // Attach SCORM 1.2 and 2004 window adapters
  useEffect(() => {
    // SCORM 1.2 Adapter
    const scorm12: Scorm12API = {
      LMSInitialize: (param: string) => {
        setLastEvent('LMSInitialize()');
        setLiveStatements((prev) => [`Initialized session (${param})`, ...prev.slice(0, 9)]);
        flushTelemetry({
          id: 'http://adlnet.gov/expapi/verbs/initialized',
          display: { 'en-US': 'initialized' },
        });
        return 'true';
      },
      LMSFinish: (_param: string) => {
        setLastEvent('LMSFinish()');
        flushTelemetry({
          id: 'http://adlnet.gov/expapi/verbs/terminated',
          display: { 'en-US': 'terminated' },
        });
        return 'true';
      },
      LMSGetValue: (element: string) => {
        return cmiRef.current[element] || '';
      },
      LMSSetValue: (element: string, value: string) => {
        setCmiStore((prev) => {
          const updated = { ...prev, [element]: value };
          cmiRef.current = updated;
          return updated;
        });
        setLastEvent(`LMSSetValue(${element})`);
        setLiveStatements((prev) => [`Set ${element} = ${value}`, ...prev.slice(0, 9)]);
        return 'true';
      },
      LMSCommit: (_param: string) => {
        setLastEvent('LMSCommit()');
        flushTelemetry({
          id: 'http://adlnet.gov/expapi/verbs/progressed',
          display: { 'en-US': 'progressed' },
        });
        return 'true';
      },
      LMSGetLastError: () => '0',
      LMSGetErrorString: () => 'No error',
      LMSGetDiagnostic: () => '',
    };

    // SCORM 2004 Adapter
    const scorm2004: Scorm2004API = {
      Initialize: (param: string) => {
        setLastEvent('Initialize()');
        setLiveStatements((prev) => [`SCORM 2004 Initialized (${param})`, ...prev.slice(0, 9)]);
        flushTelemetry({
          id: 'http://adlnet.gov/expapi/verbs/initialized',
          display: { 'en-US': 'initialized' },
        });
        return 'true';
      },
      Terminate: (_param: string) => {
        setLastEvent('Terminate()');
        flushTelemetry({
          id: 'http://adlnet.gov/expapi/verbs/terminated',
          display: { 'en-US': 'terminated' },
        });
        return 'true';
      },
      GetValue: (element: string) => {
        return cmiRef.current[element] || '';
      },
      SetValue: (element: string, value: string) => {
        setCmiStore((prev) => {
          const updated = { ...prev, [element]: value };
          cmiRef.current = updated;
          return updated;
        });
        setLastEvent(`SetValue(${element})`);
        setLiveStatements((prev) => [`2004 Set ${element} = ${value}`, ...prev.slice(0, 9)]);
        return 'true';
      },
      Commit: (_param: string) => {
        setLastEvent('Commit()');
        flushTelemetry({
          id: 'http://adlnet.gov/expapi/verbs/progressed',
          display: { 'en-US': 'progressed' },
        });
        return 'true';
      },
      GetLastError: () => '0',
      GetErrorString: () => 'No error',
      GetDiagnostic: () => '',
    };

    window.API = scorm12;
    window.API_1484_11 = scorm2004;

    return () => {
      delete window.API;
      delete window.API_1484_11;
    };
  }, [flushTelemetry]);

  // Helper trigger to simulate learner answering quiz question inside SCORM
  const handleSimulateQuizSubmission = (score: number) => {
    if (window.API) {
      window.API.LMSSetValue('cmi.core.score.raw', String(score));
      window.API.LMSSetValue('cmi.core.lesson_location', 'module_exam_passed');
      window.API.LMSSetValue('cmi.core.lesson_status', score >= 80 ? 'passed' : 'incomplete');
      window.API.LMSCommit('');
    }
    if (window.API_1484_11) {
      window.API_1484_11.SetValue('cmi.score.raw', String(score));
      window.API_1484_11.SetValue('cmi.location', 'module_exam_passed');
      window.API_1484_11.SetValue('cmi.success_status', score >= 80 ? 'passed' : 'failed');
      window.API_1484_11.SetValue('cmi.completion_status', score >= 80 ? 'completed' : 'incomplete');
      window.API_1484_11.Commit('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-buddy-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative flex flex-col bg-white border border-buddy-border rounded-2xl shadow-lift overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[90vh]'
        }`}
      >
        {/* Enterprise SCORM Runtime Header */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-buddy-cream border-b border-buddy-border gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-buddy-charcoal text-white flex items-center justify-center shadow-sm">
              <Monitor className="w-4 h-4 text-buddy-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-heading font-bold text-buddy-charcoal line-clamp-1">
                  {courseTitle}
                </h2>
                <span className="academic-pill bg-white text-buddy-charcoal border border-buddy-border">
                  {scormVersion === 'SCORM_2004' ? 'SCORM 2004 4th Ed.' : 'SCORM 1.2'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-buddy-charcoalMuted">
                Learner: <span className="font-semibold text-buddy-charcoal">{learnerName}</span> · Enr ID: {enrollmentId}
              </p>
            </div>
          </div>

          {/* Real-time Telemetry Status Pills */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-buddy-border text-[11px] font-mono">
              <span className="text-buddy-charcoalLight">Score:</span>
              <span className="font-bold text-buddy-charcoal">{rawScore}/100</span>
            </div>

            <div
              className={`academic-pill ${
                isCompleted
                  ? 'bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20'
                  : 'bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>COMPLIANCE PASSED</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-buddy-primary animate-pulse" />
                  <span>IN PROGRESS</span>
                </>
              )}
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-buddy-charcoalLight hover:text-buddy-charcoal hover:bg-white border border-transparent hover:border-buddy-border transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-buddy-charcoalLight hover:text-buddy-charcoal hover:bg-white border border-transparent hover:border-buddy-border transition-colors"
              title="Close Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player Layout: Main Content Area + Live xAPI Telemetry Rail */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
          {/* SCORM Iframe Sandbox Container */}
          <div className="flex-1 flex flex-col relative bg-buddy-cream/50 overflow-hidden">
            {/* Sandboxed Iframe (RFC Compliant) */}
            <iframe
              src={scormUrl}
              title={`SCORM Content: ${courseTitle}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="w-full flex-1 border-0"
            />

            {/* In-Browser Interactive Interactive Simulation Fallback if iframe content is external or mock */}
            <div className="p-4 bg-white border-t border-buddy-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-buddy-primary" />
                <span className="text-xs text-buddy-charcoal font-medium">
                  SCORM Interactive Bridge Active
                </span>
                <span className="text-[11px] font-mono text-buddy-charcoalLight">
                  [{lastEvent}]
                </span>
                {isSyncing && (
                  <span className="text-[10px] font-mono text-buddy-primary animate-pulse">
                    Syncing xAPI statement...
                  </span>
                )}
              </div>

              {/* Developer / Tutor Quick Test Triggers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateQuizSubmission(65)}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-buddy-cream hover:bg-buddy-creamMuted border border-buddy-border text-buddy-charcoal transition-colors"
                >
                  Simulate Score: 65% (Incomplete)
                </button>
                <button
                  onClick={() => handleSimulateQuizSubmission(95)}
                  className="flex items-center gap-1 px-3 py-1 text-[11px] font-mono font-bold rounded bg-buddy-emerald text-white hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Pass Quiz (95% &amp; Issue Cert)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry & CMI State Inspector Drawer */}
          <div className="w-full md:w-72 bg-buddy-cream border-t md:border-t-0 md:border-l border-buddy-border flex flex-col h-48 md:h-full overflow-hidden">
            <div className="p-3 border-b border-buddy-border flex items-center justify-between bg-white">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-buddy-charcoal">
                xAPI Live Activity Stream
              </span>
              <span className="w-2 h-2 rounded-full bg-buddy-emerald animate-pulse" />
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-[11px] font-mono">
              <div className="p-2 bg-white rounded border border-buddy-border text-buddy-charcoal">
                <div className="text-[10px] text-buddy-charcoalLight uppercase">Location Bookmark</div>
                <div className="truncate font-semibold mt-0.5">
                  {cmiStore['cmi.core.lesson_location'] || cmiStore['cmi.location'] || 'None'}
                </div>
              </div>

              <div className="p-2 bg-white rounded border border-buddy-border text-buddy-charcoal">
                <div className="text-[10px] text-buddy-charcoalLight uppercase">Status</div>
                <div className="font-semibold mt-0.5">
                  {cmiStore['cmi.core.lesson_status'] || cmiStore['cmi.completion_status'] || 'Not Started'}
                </div>
              </div>

              <div className="pt-2">
                <div className="text-[10px] uppercase tracking-wider text-buddy-charcoalLight mb-1.5 font-bold">
                  Recent Statements
                </div>
                {liveStatements.length === 0 ? (
                  <div className="text-buddy-charcoalLight italic text-[10px]">No statements captured yet.</div>
                ) : (
                  <div className="space-y-1">
                    {liveStatements.map((stmt, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 bg-white rounded border border-buddy-border text-[10px] text-buddy-charcoalMuted truncate"
                      >
                        {stmt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
