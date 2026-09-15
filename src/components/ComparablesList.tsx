import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Layers, Calendar, MapPin, Ruler, FileText } from 'lucide-react';
import type { ComparableRecord } from '../types';

interface ComparablesListProps {
  records: ComparableRecord[];
  askingPrice: number;
}

export const ComparablesList: React.FC<ComparablesListProps> = ({
  records,
  askingPrice,
}) => {
  const [sortBy, setSortBy] = useState<'month_desc' | 'price_asc' | 'price_desc'>('month_desc');
  const [searchFilter, setSearchFilter] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const sortedRecords = useMemo(() => {
    let list = [...records];
    if (searchFilter.trim()) {
      const q = searchFilter.trim().toUpperCase();
      list = list.filter(
        (r) =>
          r.street_name.toUpperCase().includes(q) ||
          r.block.toUpperCase().includes(q) ||
          r.storey_range.toUpperCase().includes(q)
      );
    }

    if (sortBy === 'month_desc') {
      list.sort((a, b) => b.month.localeCompare(a.month) || b.resale_price - a.resale_price);
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => a.resale_price - b.resale_price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.resale_price - a.resale_price);
    }
    return list;
  }, [records, sortBy, searchFilter]);

  if (records.length === 0) {
    return null;
  }

  return (
    <div id="comparables-list-section" className="space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Recent Comparable Transactions ({records.length})
          </h3>
          <p className="text-xs text-slate-400">
            Official records from data.gov.sg datastore
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-comparables-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="month_desc" className="bg-slate-900 text-slate-200">
                Most Recent
              </option>
              <option value="price_asc" className="bg-slate-900 text-slate-200">
                Price: Low to High
              </option>
              <option value="price_desc" className="bg-slate-900 text-slate-200">
                Price: High to Low
              </option>
            </select>
          </div>

          <input
            id="filter-comps-input"
            type="text"
            placeholder="Filter block/street..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 w-36 sm:w-44"
          />
        </div>
      </div>

      {/* List of items */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {sortedRecords.slice(0, 50).map((r, idx) => {
          const diffFromAsking = askingPrice - r.resale_price;
          const psf =
            r.floor_area_sqm > 0
              ? Math.round(r.resale_price / (r.floor_area_sqm * 10.7639))
              : null;

          return (
            <div
              key={`${r.block}-${r.street_name}-${r.month}-${idx}`}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Location & Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Blk {r.block} {r.street_name}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-500" />
                      Storey {r.storey_range}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-slate-500" />
                      {r.floor_area_sqm} sqm {psf ? `(~$${psf} psf)` : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {r.month}
                    </span>
                    {r.remaining_lease && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <FileText className="w-3 h-3 text-slate-500" />
                        {r.remaining_lease}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Comparison */}
                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-slate-100 block">
                    {formatCurrency(r.resale_price)}
                  </span>
                  <span
                    className={`text-[11px] font-medium block ${
                      diffFromAsking > 0
                        ? 'text-amber-400'
                        : diffFromAsking < 0
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {diffFromAsking > 0
                      ? `Asking is +${formatCurrency(diffFromAsking)}`
                      : diffFromAsking < 0
                      ? `Asking is -${formatCurrency(Math.abs(diffFromAsking))}`
                      : 'Same as asking'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {sortedRecords.length > 50 && (
          <p className="text-xs text-center text-slate-500 py-2">
            Showing top 50 of {sortedRecords.length} records matching criteria
          </p>
        )}
      </div>
    </div>
  );
};
