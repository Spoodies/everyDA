export const EXPERIMENT_KINDS = [
  'Times',
  'Events'
] as const;

export type ExperimentKind = (typeof EXPERIMENT_KINDS)[number];

export type TimeEntry = {
  timestamp: string;
  duration: number;
};

export type EventEntry = {
  timestamp: string;
  count: number;
};

export type Experiment = {
  id: string;
  title: string;
  notes: string;
  kind: ExperimentKind;
  data: TimeEntry[] | EventEntry[];
  selectedStats?: string[];
  createdAt: string;
  lastEdited: string;
};

export const STORAGE_KEY = 'experiments:v1';

export interface EntryContentRef {
  submit: () => TimeEntry[] | EventEntry[] | null;
  reset: () => void;
}
