export interface Kpi {
  id: string;
  label: string;
  value: string;
  /** Signed delta label, e.g. "+12%". */
  delta?: string;
  deltaDirection?: 'up' | 'down';
  /** Sparkline series. */
  spark?: number[];
}
