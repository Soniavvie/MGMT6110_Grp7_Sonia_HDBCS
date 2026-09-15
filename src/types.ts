export interface ComparableRecord {
  month: string;
  town: string;
  flat_type: string;
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: number;
  remaining_lease: string;
  resale_price: number;
}

export type VerdictStatus = 'loading' | 'empty' | 'refused' | 'unreachable' | 'success';

export interface VerdictAnalysis {
  status: VerdictStatus;
  sentence: string;
  askingPrice: number;
  medianPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  diff: number;
  count: number;
  errorReason?: string;
  upstreamStatus?: number | null;
}

export interface HealthResponse {
  keyConfigured: boolean;
  upstreamAnswered: boolean;
  upstreamStatus: number | null;
  ok?: boolean;
  message?: string;
}
