import React, { useState } from 'react';
import { Activity, Check, X, ShieldAlert, Wifi, RefreshCw } from 'lucide-react';
import type { HealthResponse, VerdictStatus } from '../types';

interface HealthStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreviewStatus: (status: VerdictStatus | null) => void;
  activePreviewStatus: VerdictStatus | null;
}

export const HealthStatusModal: React.FC<HealthStatusModalProps> = ({
  isOpen,
  onClose,
  onSelectPreviewStatus,
  activePreviewStatus,
}) => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setHealthData({
        keyConfigured: false,
        upstreamAnswered: false,
        upstreamStatus: null,
        message: err?.message || 'Failed to call /api/health',
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              System Health & State Inspector
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Health Check Button & Status */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">
              Endpoint Status: <code className="text-emerald-400">/api/health</code>
            </span>
            <button
              onClick={checkHealth}
              disabled={isChecking}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Run Check'}</span>
            </button>
          </div>

          {healthData && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">HDB_RESOURCE_ID Configured:</span>
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    healthData.keyConfigured ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {healthData.keyConfigured ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Present
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5" /> Missing
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Upstream data.gov.sg Answered:</span>
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    healthData.upstreamAnswered ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {healthData.upstreamAnswered ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Yes (HTTP {healthData.upstreamStatus})
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3.5 h-3.5" /> Unreachable
                    </>
                  )}
                </span>
              </div>

              {healthData.message && (
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300">
                  {healthData.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sentence & State Tester */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">
            Preview Required Edge Cases (Inspect Specific Sentences)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onSelectPreviewStatus(null)}
              className={`p-2 rounded-lg border text-left transition-colors ${
                activePreviewStatus === null
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              ● Live API Mode
            </button>

            <button
              onClick={() => onSelectPreviewStatus('loading')}
              className={`p-2 rounded-lg border text-left transition-colors ${
                activePreviewStatus === 'loading'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              1. Loading State
            </button>

            <button
              onClick={() => onSelectPreviewStatus('empty')}
              className={`p-2 rounded-lg border text-left transition-colors ${
                activePreviewStatus === 'empty'
                  ? 'bg-slate-800 border-slate-500 text-white font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              2. Empty State
            </button>

            <button
              onClick={() => onSelectPreviewStatus('refused')}
              className={`p-2 rounded-lg border text-left transition-colors ${
                activePreviewStatus === 'refused'
                  ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              3. Upstream Refused
            </button>

            <button
              onClick={() => onSelectPreviewStatus('unreachable')}
              className={`p-2 rounded-lg border text-left col-span-2 transition-colors ${
                activePreviewStatus === 'unreachable'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              4. Upstream Unreachable
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
