/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Activity, Smartphone, Info } from 'lucide-react';
import type { ComparableRecord, VerdictAnalysis, VerdictStatus } from './types';
import { STATUS_SENTENCES } from './data/hdbConstants';
import { VerdictCard } from './components/VerdictCard';
import { FlatContextForm } from './components/FlatContextForm';
import { ComparablesList } from './components/ComparablesList';
import { HealthStatusModal } from './components/HealthStatusModal';
import { DisqusComments } from './components/DisqusComments';

export default function App() {
  const [town, setTown] = useState('ANG MO KIO');
  const [flatType, setFlatType] = useState('4 ROOM');
  const [askingPrice, setAskingPrice] = useState(580000);
  const [streetName, setStreetName] = useState('');

  const [records, setRecords] = useState<ComparableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verdict, setVerdict] = useState<VerdictAnalysis>({
    status: 'loading',
    sentence: STATUS_SENTENCES.loading,
    askingPrice: 580000,
    medianPrice: 0,
    avgPrice: 0,
    minPrice: 0,
    maxPrice: 0,
    diff: 0,
    count: 0,
  });

  const [previewStatus, setPreviewStatus] = useState<VerdictStatus | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  const fetchComparables = useCallback(
    async (
      targetTown: string,
      targetFlatType: string,
      targetAskingPrice: number,
      targetStreetName: string
    ) => {
      setIsLoading(true);
      setVerdict((prev) => ({
        ...prev,
        status: 'loading',
        sentence: STATUS_SENTENCES.loading,
        askingPrice: targetAskingPrice,
      }));

      try {
        const queryParams = new URLSearchParams({
          town: targetTown,
          flatType: targetFlatType,
        });
        if (targetStreetName.trim()) {
          queryParams.set('streetName', targetStreetName.trim());
        }

        const res = await fetch(`/api/comparables?${queryParams.toString()}`);

        // Check if response is non-2xx
        if (!res.ok) {
          let errorReason = `HTTP ${res.status}`;
          try {
            const errData = await res.json();
            errorReason = errData.reason || errData.error || errorReason;
          } catch {
            // response was empty or non-JSON
          }

          setRecords([]);
          setVerdict({
            status: 'refused',
            sentence: STATUS_SENTENCES.refused,
            askingPrice: targetAskingPrice,
            medianPrice: 0,
            avgPrice: 0,
            minPrice: 0,
            maxPrice: 0,
            diff: 0,
            count: 0,
            upstreamStatus: res.status,
            errorReason,
          });
          return;
        }

        const data = await res.json();
        const items: ComparableRecord[] = Array.isArray(data.records) ? data.records : [];
        setRecords(items);

        if (items.length === 0) {
          setVerdict({
            status: 'empty',
            sentence: STATUS_SENTENCES.empty,
            askingPrice: targetAskingPrice,
            medianPrice: 0,
            avgPrice: 0,
            minPrice: 0,
            maxPrice: 0,
            diff: 0,
            count: 0,
          });
          return;
        }

        // Calculate statistics from matched comparable sales
        const prices = items.map((i) => i.resale_price).sort((a, b) => a - b);
        const minPrice = prices[0];
        const maxPrice = prices[prices.length - 1];
        const sum = prices.reduce((acc, p) => acc + p, 0);
        const avgPrice = Math.round(sum / prices.length);

        const mid = Math.floor(prices.length / 2);
        const medianPrice =
          prices.length % 2 !== 0
            ? prices[mid]
            : Math.round((prices[mid - 1] + prices[mid]) / 2);

        const diff = targetAskingPrice - medianPrice;
        const absDiff = Math.abs(diff);

        let sentence =
          diff > 0
            ? `This flat is priced $${absDiff.toLocaleString()} above recent comparable sales`
            : diff < 0
            ? `This flat is priced $${absDiff.toLocaleString()} below recent comparable sales`
            : `This flat is priced right on recent comparable sales benchmark`;

        setVerdict({
          status: 'success',
          sentence,
          askingPrice: targetAskingPrice,
          medianPrice,
          avgPrice,
          minPrice,
          maxPrice,
          diff,
          count: items.length,
        });
      } catch (err: any) {
        // Network failure, DNS issue, or connection drop
        setRecords([]);
        setVerdict({
          status: 'unreachable',
          sentence: STATUS_SENTENCES.unreachable,
          askingPrice: targetAskingPrice,
          medianPrice: 0,
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          diff: 0,
          count: 0,
          errorReason: err?.message || 'Network unreachable',
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchComparables(town, flatType, askingPrice, streetName);
  }, [town, flatType, streetName, fetchComparables]);

  const handleUpdate = (params: {
    town: string;
    flatType: string;
    askingPrice: number;
    streetName: string;
  }) => {
    setTown(params.town);
    setFlatType(params.flatType);
    setAskingPrice(params.askingPrice);
    setStreetName(params.streetName);

    // If only price changed and we already have records, recalculate immediately
    if (params.town === town && params.flatType === flatType && params.streetName === streetName && records.length > 0) {
      const prices = records.map((i) => i.resale_price).sort((a, b) => a - b);
      const minPrice = prices[0];
      const maxPrice = prices[prices.length - 1];
      const sum = prices.reduce((acc, p) => acc + p, 0);
      const avgPrice = Math.round(sum / prices.length);
      const mid = Math.floor(prices.length / 2);
      const medianPrice =
        prices.length % 2 !== 0
          ? prices[mid]
          : Math.round((prices[mid - 1] + prices[mid]) / 2);
      const diff = params.askingPrice - medianPrice;
      const absDiff = Math.abs(diff);

      const sentence =
        diff > 0
          ? `This flat is priced $${absDiff.toLocaleString()} above recent comparable sales`
          : diff < 0
          ? `This flat is priced $${absDiff.toLocaleString()} below recent comparable sales`
          : `This flat is priced right on recent comparable sales benchmark`;

      setVerdict((prev) => ({
        ...prev,
        askingPrice: params.askingPrice,
        diff,
        sentence,
      }));
    } else {
      fetchComparables(params.town, params.flatType, params.askingPrice, params.streetName);
    }
  };

  // Derive current display verdict if manual preview override is selected
  const activeVerdict: VerdictAnalysis = previewStatus
    ? {
        ...verdict,
        status: previewStatus,
        sentence: STATUS_SENTENCES[previewStatus as keyof typeof STATUS_SENTENCES] || verdict.sentence,
      }
    : verdict;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              HDB
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                Comparable Sales Evaluator
              </h1>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-emerald-400" /> On-site flat inspection
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="status-inspector-btn"
              onClick={() => setIsHealthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 rounded-xl transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Health & Edge Cases</span>
              <span className="sm:hidden">Status</span>
            </button>
          </div>
        </div>
      </header>

      {/* Edge case preview notification banner if active */}
      {previewStatus && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
          <Info className="w-3.5 h-3.5" />
          <span>
            Previewing <strong>{previewStatus.toUpperCase()}</strong> state sentence.
          </span>
          <button
            onClick={() => setPreviewStatus(null)}
            className="underline font-semibold ml-1 text-white hover:text-amber-200"
          >
            Switch back to Live API
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4">
        {/* The Live Verdict Card */}
        <VerdictCard
          verdict={activeVerdict}
          town={town}
          flatType={flatType}
          onRetry={() => fetchComparables(town, flatType, askingPrice, streetName)}
        />

        {/* Flat Context & Asking Price Controls */}
        <FlatContextForm
          town={town}
          flatType={flatType}
          askingPrice={askingPrice}
          streetName={streetName}
          isLoading={isLoading}
          onUpdate={handleUpdate}
        />

        {/* Comparable Sales List */}
        {!previewStatus && verdict.status === 'success' && (
          <ComparablesList records={records} askingPrice={askingPrice} />
        )}

        {/* Disqus Feedback & Discussion */}
        <DisqusComments />
      </main>

      {/* Footer with Mandatory Open Data Licence Credit */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-auto py-6 px-4">
        <div className="max-w-2xl mx-auto space-y-2 text-center">
          <p className="text-xs text-slate-400 leading-relaxed">
            Contains information from HDB Resale Flat Prices accessed from data.gov.sg, made available under the Singapore Open Data Licence version 1.0 (
            <a
              href="https://data.gov.sg/open-data-licence"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              https://data.gov.sg/open-data-licence
            </a>
            ).
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Official Government Open Data • Live Vercel Serverless Function</span>
          </div>
        </div>
      </footer>

      {/* Health & Preview Modal */}
      <HealthStatusModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        onSelectPreviewStatus={(status) => {
          setPreviewStatus(status);
          setIsHealthModalOpen(false);
        }}
        activePreviewStatus={previewStatus}
      />
    </div>
  );
}
