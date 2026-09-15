import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, WifiOff, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { VerdictAnalysis } from '../types';
import { STATUS_SENTENCES } from '../data/hdbConstants';

interface VerdictCardProps {
  verdict: VerdictAnalysis;
  town: string;
  flatType: string;
  onRetry: () => void;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  verdict,
  town,
  flatType,
  onRetry,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 1. Loading State
  if (verdict.status === 'loading') {
    return (
      <div
        id="verdict-loading-card"
        className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl text-slate-100"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl shrink-0 mt-0.5 animate-pulse">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Evaluating Comps
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <p className="text-lg sm:text-xl font-medium text-slate-100 leading-snug">
              {STATUS_SENTENCES.loading}
            </p>
            <p className="text-sm text-slate-400">
              Querying live records for {flatType} in {town}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty State (no comparable sales matched)
  if (verdict.status === 'empty') {
    return (
      <div
        id="verdict-empty-card"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl text-slate-100"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-800 text-slate-300 rounded-xl shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-3 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              No Direct Comparables
            </span>
            <p className="text-lg sm:text-xl font-medium text-slate-100 leading-snug">
              {STATUS_SENTENCES.empty}
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl text-xs text-slate-300 border border-slate-700">
              Tip: Check if the street name filter is too narrow, or compare against adjacent towns with the agent.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Upstream Refused State
  if (verdict.status === 'refused') {
    return (
      <div
        id="verdict-refused-card"
        className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-xl text-slate-100"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/15 text-rose-400 rounded-xl shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Registry Refusal
              </span>
              {verdict.upstreamStatus && (
                <span className="text-xs px-2 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded">
                  HTTP {verdict.upstreamStatus}
                </span>
              )}
            </div>
            <p className="text-lg sm:text-xl font-medium text-slate-100 leading-snug">
              {STATUS_SENTENCES.refused}
            </p>
            {verdict.errorReason && (
              <p className="text-xs text-rose-300/80 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
                {verdict.errorReason}
              </p>
            )}
            <button
              id="retry-after-refusal-btn"
              onClick={onRetry}
              className="text-xs text-rose-300 hover:text-rose-200 underline font-medium"
            >
              Try requesting again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Upstream Unreachable State
  if (verdict.status === 'unreachable') {
    return (
      <div
        id="verdict-unreachable-card"
        className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl text-slate-100"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl shrink-0 mt-0.5">
            <WifiOff className="w-6 h-6" />
          </div>
          <div className="space-y-3 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Connection Problem
            </span>
            <p className="text-lg sm:text-xl font-medium text-slate-100 leading-snug">
              {STATUS_SENTENCES.unreachable}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                id="retry-unreachable-btn"
                onClick={onRetry}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow"
              >
                Retry connection
              </button>
              <span className="text-xs text-slate-400">
                Or step near a window for better mobile data
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Live Success State - Prominent live verdict calculation
  const isAbove = verdict.diff > 0;
  const isBelow = verdict.diff < 0;
  const absDiff = Math.abs(verdict.diff);

  const verdictText = isAbove
    ? `This flat is priced ${formatCurrency(absDiff)} above recent comparable sales`
    : isBelow
    ? `This flat is priced ${formatCurrency(absDiff)} below recent comparable sales`
    : `This flat is priced right on recent comparable sales benchmark`;

  return (
    <div
      id="verdict-success-card"
      className={`rounded-2xl p-6 shadow-xl border ${
        isAbove
          ? 'bg-slate-900 border-amber-500/40 text-slate-100'
          : isBelow
          ? 'bg-slate-900 border-emerald-500/40 text-slate-100'
          : 'bg-slate-900 border-blue-500/40 text-slate-100'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-xl shrink-0 mt-0.5 ${
            isAbove
              ? 'bg-amber-500/15 text-amber-400'
              : isBelow
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-blue-500/15 text-blue-400'
          }`}
        >
          {isAbove ? (
            <TrendingUp className="w-6 h-6" />
          ) : isBelow ? (
            <TrendingDown className="w-6 h-6" />
          ) : (
            <Minus className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-4 flex-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isAbove
                    ? 'bg-amber-500/20 text-amber-300'
                    : isBelow
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                {isAbove ? 'Asking Premium' : isBelow ? 'Asking Discount' : 'At Benchmark'}
              </span>
              <span className="text-xs text-slate-400">
                Based on {verdict.count} matched sales
              </span>
            </div>

            <h2
              id="live-verdict-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug"
            >
              {verdictText}
            </h2>
          </div>

          {/* Key Metrics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-0.5">Asking Price</span>
              <span className="text-base font-semibold text-white">
                {formatCurrency(verdict.askingPrice)}
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-0.5">Median Comparable</span>
              <span className="text-base font-semibold text-white">
                {formatCurrency(verdict.medianPrice)}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-0.5">Recent Price Range</span>
              <span className="text-xs sm:text-sm font-medium text-slate-300">
                {formatCurrency(verdict.minPrice)} – {formatCurrency(verdict.maxPrice)}
              </span>
            </div>
          </div>

          {/* Practical negotiation tip for standing in the flat */}
          <div className="text-xs text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {isAbove
                ? `You can bring up the median sales price of ${formatCurrency(
                    verdict.medianPrice
                  )} when discussing the ${formatCurrency(absDiff)} gap with the agent.`
                : isBelow
                ? `This asking price is currently competitive against recent ${town} transactions.`
                : `This flat is sitting directly on the market baseline for recent comps.`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
