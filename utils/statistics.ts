import type { EventEntry, ExperimentKind, TimeEntry } from '../types/experiment';

export function extractValues(data: TimeEntry[] | EventEntry[], kind: ExperimentKind): number[] {
  if (kind === 'Times') return (data as TimeEntry[]).map((e) => e.duration);
  return (data as EventEntry[]).map((e) => e.count);
}

export function entryCount(data: TimeEntry[] | EventEntry[]): number {
  return data.length;
}

export function total(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export const sum = total;

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return total(values) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mode(values: number[]): number {
  if (values.length === 0) return 0;
  const freq = new Map<number, number>();
  for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
  let maxCount = 0;
  let modeValue = values[0];
  for (const [v, count] of freq) {
    if (count > maxCount) { maxCount = count; modeValue = v; }
  }
  return modeValue;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** 95% CI half-width: 1.96 * (stddev / sqrt(n)) */
export function confint(values: number[]): number {
  if (values.length < 2) return 0;
  return 1.96 * (stddev(values) / Math.sqrt(values.length));
}

/** 95% prediction interval half-width: 1.96 * stddev * sqrt(1 + 1/n) */
export function predint(values: number[]): number {
  if (values.length < 2) return 0;
  return 1.96 * stddev(values) * Math.sqrt(1 + 1 / values.length);
}

export function computeStat(
  statId: string,
  data: TimeEntry[] | EventEntry[],
  kind: ExperimentKind
): number {
  if (statId === 'entry_count') return entryCount(data);
  const values = extractValues(data, kind);
  switch (statId) {
    case 'total':   return total(values);
    case 'sum':     return sum(values);
    case 'mean':    return mean(values);
    case 'median':  return median(values);
    case 'mode':    return mode(values);
    case 'stddev':  return stddev(values);
    case 'confint': return confint(values);
    case 'predint': return predint(values);
    default:        return 0;
  }
}

/** Format a value for display: up to 2 decimal places, trailing zeros trimmed. */
export function formatStatValue(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return parseFloat(value.toFixed(2)).toString();
}

/**
 * Format a stat for display. Confint returns a range string "mean ± margin";
 * all other stats return a plain formatted number.
 */
export function formatStatDisplay(
  statId: string,
  data: TimeEntry[] | EventEntry[],
  kind: ExperimentKind
): string {
  if (statId === 'confint') {
    const values = extractValues(data, kind);
    const m = mean(values);
    const ci = confint(values);
    return `${formatStatValue(m - ci)} – ${formatStatValue(m + ci)}`;
  }
  if (statId === 'predint') {
    const values = extractValues(data, kind);
    const m = mean(values);
    const pi = predint(values);
    return `${formatStatValue(m - pi)} – ${formatStatValue(m + pi)}`;
  }
  return formatStatValue(computeStat(statId, data, kind));
}
