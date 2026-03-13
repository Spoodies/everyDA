import type { EventEntry, ExperimentKind, OccurrenceEntry, TimeEntry } from '../types/experiment';

export function extractValues(data: TimeEntry[] | EventEntry[] | OccurrenceEntry[], kind: ExperimentKind): number[] {
  if (kind === 'Times') return (data as TimeEntry[]).map((entry) => entry.duration);
  if (kind === 'Events') return (data as EventEntry[]).map((entry) => entry.count);
  return extractIntervals(data as OccurrenceEntry[]);
}

export function entryCount(data: TimeEntry[] | EventEntry[] | OccurrenceEntry[]): number {
  return data.length;
}

function getSortedTimestampsMs(data: OccurrenceEntry[]): number[] {
  return data
    .map((entry) => new Date(entry.timestamp).getTime())
    .filter((timestamp) => Number.isFinite(timestamp))
    .sort((a, b) => a - b);
}

export function extractIntervals(data: OccurrenceEntry[]): number[] {
  const timestamps = getSortedTimestampsMs(data);
  if (timestamps.length < 2) return [];

  const intervals: number[] = [];
  for (let index = 1; index < timestamps.length; index += 1) {
    intervals.push((timestamps[index] - timestamps[index - 1]) / 1000);
  }
  return intervals;
}

function intervalCount(data: OccurrenceEntry[]): number {
  return Math.max(0, getSortedTimestampsMs(data).length - 1);
}

function minValue(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

function maxValue(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

function regularityCv(values: number[]): number {
  const avg = mean(values);
  if (avg <= 0) return 0;
  return stddev(values) / avg;
}

function eventRatePerDay(data: OccurrenceEntry[]): number {
  const timestamps = getSortedTimestampsMs(data);
  if (timestamps.length < 2) return 0;

  const windowSeconds = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
  if (windowSeconds <= 0) return 0;

  return (timestamps.length / windowSeconds) * 86400;
}

function timeSinceLastEventSeconds(data: OccurrenceEntry[]): number {
  const timestamps = getSortedTimestampsMs(data);
  if (timestamps.length === 0) return 0;
  return Math.max(0, (Date.now() - timestamps[timestamps.length - 1]) / 1000);
}

export function total(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
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
  for (const value of values) freq.set(value, (freq.get(value) ?? 0) + 1);

  let maxCount = 0;
  let modeValue = values[0];
  for (const [value, count] of freq) {
    if (count > maxCount) {
      maxCount = count;
      modeValue = value;
    }
  }

  return modeValue;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / (values.length - 1);
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
  data: TimeEntry[] | EventEntry[] | OccurrenceEntry[],
  kind: ExperimentKind
): number {
  if (statId === 'entry_count') return entryCount(data);

  if (kind === 'Occurrences') {
    const occurrenceData = data as OccurrenceEntry[];
    const intervalValues = extractIntervals(occurrenceData);
    switch (statId) {
      case 'interval_count': return intervalCount(occurrenceData);
      case 'mean_interval': return mean(intervalValues);
      case 'median_interval': return median(intervalValues);
      case 'min_interval': return minValue(intervalValues);
      case 'max_interval': return maxValue(intervalValues);
      case 'interval_stddev': return stddev(intervalValues);
      case 'regularity_cv': return regularityCv(intervalValues);
      case 'event_rate_per_day': return eventRatePerDay(occurrenceData);
      case 'time_since_last_event': return timeSinceLastEventSeconds(occurrenceData);
      default: return 0;
    }
  }

  const values = extractValues(data, kind);
  switch (statId) {
    case 'total': return total(values);
    case 'sum': return sum(values);
    case 'mean': return mean(values);
    case 'median': return median(values);
    case 'mode': return mode(values);
    case 'stddev': return stddev(values);
    case 'confint': return confint(values);
    case 'predint': return predint(values);
    default: return 0;
  }
}

/** Format a value for display: up to 2 decimal places, trailing zeros trimmed. */
export function formatStatValue(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return parseFloat(value.toFixed(2)).toString();
}

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  if (seconds < 60) return `${formatStatValue(seconds)}s`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${formatStatValue(minutes)}m`;

  const hours = minutes / 60;
  if (hours < 24) return `${formatStatValue(hours)}h`;

  const days = hours / 24;
  return `${formatStatValue(days)}d`;
}

/**
 * Format a stat for display. Confint returns a range string "mean ± margin";
 * all other stats return a plain formatted number.
 */
export function formatStatDisplay(
  statId: string,
  data: TimeEntry[] | EventEntry[] | OccurrenceEntry[],
  kind: ExperimentKind
): string {
  if (kind === 'Occurrences') {
    const value = computeStat(statId, data, kind);
    if (statId === 'event_rate_per_day') return `${formatStatValue(value)}/day`;
    if (
      statId === 'mean_interval' ||
      statId === 'median_interval' ||
      statId === 'min_interval' ||
      statId === 'max_interval' ||
      statId === 'interval_stddev' ||
      statId === 'time_since_last_event'
    ) {
      return formatSeconds(value);
    }
    return formatStatValue(value);
  }

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
