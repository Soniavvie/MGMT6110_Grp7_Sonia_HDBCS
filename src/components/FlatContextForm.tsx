import React, { useState } from 'react';
import { Building2, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { HDB_TOWNS, HDB_FLAT_TYPES } from '../data/hdbConstants';

interface FlatContextFormProps {
  town: string;
  flatType: string;
  askingPrice: number;
  streetName: string;
  isLoading: boolean;
  onUpdate: (params: {
    town: string;
    flatType: string;
    askingPrice: number;
    streetName: string;
  }) => void;
}

export const FlatContextForm: React.FC<FlatContextFormProps> = ({
  town,
  flatType,
  askingPrice,
  streetName,
  isLoading,
  onUpdate,
}) => {
  const [currentTown, setCurrentTown] = useState(town);
  const [currentFlatType, setCurrentFlatType] = useState(flatType);
  const [currentAskingPrice, setCurrentAskingPrice] = useState(askingPrice);
  const [currentStreetName, setCurrentStreetName] = useState(streetName);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      town: currentTown,
      flatType: currentFlatType,
      askingPrice: Number(currentAskingPrice) || 0,
      streetName: currentStreetName,
    });
  };

  const adjustPrice = (delta: number) => {
    const next = Math.max(100000, currentAskingPrice + delta);
    setCurrentAskingPrice(next);
    onUpdate({
      town: currentTown,
      flatType: currentFlatType,
      askingPrice: next,
      streetName: currentStreetName,
    });
  };

  return (
    <form
      id="flat-context-form"
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
    >
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Flat Being Evaluated</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Hide Street' : 'Filter Street'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Town Selector */}
        <div>
          <label htmlFor="select-town" className="block text-xs text-slate-400 mb-1 font-medium">
            Town / Estate
          </label>
          <select
            id="select-town"
            value={currentTown}
            onChange={(e) => {
              setCurrentTown(e.target.value);
              onUpdate({
                town: e.target.value,
                flatType: currentFlatType,
                askingPrice: currentAskingPrice,
                streetName: currentStreetName,
              });
            }}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {HDB_TOWNS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Flat Type Selector */}
        <div>
          <label htmlFor="select-flat-type" className="block text-xs text-slate-400 mb-1 font-medium">
            Flat Type
          </label>
          <select
            id="select-flat-type"
            value={currentFlatType}
            onChange={(e) => {
              setCurrentFlatType(e.target.value);
              onUpdate({
                town: currentTown,
                flatType: e.target.value,
                askingPrice: currentAskingPrice,
                streetName: currentStreetName,
              });
            }}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {HDB_FLAT_TYPES.map((ft) => (
              <option key={ft} value={ft}>
                {ft}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Asking Price Input & Quick Adjusters */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="input-asking-price" className="text-xs text-slate-400 font-medium">
            Asking Price (SGD)
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => adjustPrice(-10000)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 active:scale-95 transition-transform"
            >
              -$10k
            </button>
            <button
              type="button"
              onClick={() => adjustPrice(10000)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 active:scale-95 transition-transform"
            >
              +$10k
            </button>
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium text-sm">$</span>
          <input
            id="input-asking-price"
            type="number"
            step="1000"
            value={currentAskingPrice}
            onChange={(e) => setCurrentAskingPrice(Number(e.target.value))}
            onBlur={() =>
              onUpdate({
                town: currentTown,
                flatType: currentFlatType,
                askingPrice: currentAskingPrice,
                streetName: currentStreetName,
              })
            }
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-base font-semibold rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Optional Street Name filter */}
      {showAdvanced && (
        <div>
          <label htmlFor="input-street-name" className="block text-xs text-slate-400 mb-1 font-medium">
            Street Name (Optional, e.g. ANG MO KIO AVE 3)
          </label>
          <div className="relative">
            <input
              id="input-street-name"
              type="text"
              placeholder="e.g. BEDOK NORTH ST 2"
              value={currentStreetName}
              onChange={(e) => setCurrentStreetName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {currentStreetName && (
              <button
                type="button"
                onClick={() => {
                  setCurrentStreetName('');
                  onUpdate({
                    town: currentTown,
                    flatType: currentFlatType,
                    askingPrice: currentAskingPrice,
                    streetName: '',
                  });
                }}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex gap-2 pt-1">
        <button
          id="refresh-comps-button"
          type="submit"
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm py-2.5 px-4 rounded-xl transition-colors shadow"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Checking Registry...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Update Live Comparables</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
