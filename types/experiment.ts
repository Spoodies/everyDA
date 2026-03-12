export const EXPERIMENT_KINDS = [
  'Time',
  'Events'
] as const;

export type ExperimentKind = (typeof EXPERIMENT_KINDS)[number];

export type TimeEntry = {
  timestamp: string;
  duration: number;
};

export type EventEntry = {
  timestamp: string;
  label?: string;
};

export type Experiment = {
  id: string;
  title: string;
  notes: string;
  kind: ExperimentKind;
  data: TimeEntry[] | EventEntry[];
  createdAt: string;
  lastEdited: string;
};

export const STORAGE_KEY = 'experiments:v1';
