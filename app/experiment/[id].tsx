import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, useWindowDimensions } from 'react-native';
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui';
import { AddEntryModal } from '../../components/AddEntryModal';
import { StatisticsPickerModal } from '../../components/StatisticsPickerModal';
import { EditEntryModal } from '../../components/entry/EditEntryModal';
import type { EventEntry, Experiment, ExperimentKind, OccurrenceEntry, TimeEntry } from '../../types/experiment';
import { STORAGE_KEY } from '../../types/experiment';
import { formatStatDisplay } from '../../utils/statistics';

const SCALAR_STAT_OPTIONS = [
  { id: 'sum', label: 'Sum', description: 'Sum adds all recorded values together.' },
  { id: 'mean', label: 'Mean', description: 'Mean is the average of all values: sum / count.' },
  { id: 'median', label: 'Median', description: 'Median is the middle value after sorting the data.' },
  { id: 'mode', label: 'Mode', description: 'Mode is the value that appears most often.' },
  { id: 'confint', label: 'Confint', description: '95% confidence interval of the mean: mean ± 1.96 × (stddev / √n).' },
  { id: 'predint', label: 'Predint', description: '95% prediction interval for a new value: mean ± 1.96 × stddev × √(1 + 1/n).' },
  { id: 'stddev', label: 'Stddev', description: 'Sample standard deviation measures spread around the mean.' },
  { id: 'entry_count', label: 'Entry Count', description: 'Entry Count is the number of recorded entries.' },
];

const OCCURRENCE_STAT_OPTIONS = [
  { id: 'entry_count', label: 'Entry Count', description: 'Entry Count is the number of recorded events.' },
  { id: 'interval_count', label: 'Interval Count', description: 'Interval Count is the number of gaps between events (entries - 1).' },
  { id: 'event_rate_per_day', label: 'Rate / Day', description: 'Average event rate per day across the observed time window.' },
  { id: 'mean_interval', label: 'Mean Interval', description: 'Average time gap between consecutive events.' },
  { id: 'median_interval', label: 'Median Interval', description: 'Middle time gap between events after sorting interval lengths.' },
  { id: 'min_interval', label: 'Min Interval', description: 'Shortest observed time gap between two consecutive events.' },
  { id: 'max_interval', label: 'Max Interval', description: 'Longest observed time gap between two consecutive events.' },
  { id: 'interval_stddev', label: 'Interval Stddev', description: 'Spread of interval lengths; larger means more irregular timing.' },
  { id: 'regularity_cv', label: 'Regularity CV', description: 'Coefficient of variation: stddev ÷ mean interval. Lower values mean more regular timing.' },
  { id: 'time_since_last_event', label: 'Since Last Event', description: 'Elapsed time from the most recent event until now.' },
];

const getStatOptions = (kind: ExperimentKind) => {
  if (kind === 'Occurrences') return OCCURRENCE_STAT_OPTIONS;
  return SCALAR_STAT_OPTIONS;
};

export default function ExperimentDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.8;

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [entryModalVisible, setEntryModalVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null);
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStartRef = useRef<number>(0);
  const timerAccumRef = useRef<number>(0);
  const timerActive = timerRunning || timerElapsed > 0;

  // Counter state
  const [counterActive, setCounterActive] = useState(false);
  const [counterCount, setCounterCount] = useState(0);

  useEffect(() => {
    if (timerRunning) {
      timerStartRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const wallElapsed = (Date.now() - timerStartRef.current) / 1000;
        setTimerElapsed(+(timerAccumRef.current + wallElapsed).toFixed(2));
      }, 50);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timerRunning]);

  const startTimer = () => {
    timerAccumRef.current = 0;
    setTimerElapsed(0);
    setTimerRunning(true);
    setEntryModalVisible(false);
  };

  const pauseTimer = () => {
    const wallElapsed = (Date.now() - timerStartRef.current) / 1000;
    timerAccumRef.current = timerAccumRef.current + wallElapsed;
    setTimerRunning(false);
  };

  const finishTimer = () => {
    const wallElapsed = timerRunning ? (Date.now() - timerStartRef.current) / 1000 : 0;
    const duration = +(timerAccumRef.current + wallElapsed).toFixed(2);
    setTimerRunning(false);
    setTimerElapsed(0);
    timerAccumRef.current = 0;
    addEntries([{ timestamp: new Date().toISOString(), duration }]);
  };

  const startCounter = () => {
    setCounterCount(0);
    setCounterActive(true);
    setEntryModalVisible(false);
  };

  const finishCounter = () => {
    if (counterCount > 0) {
      addEntries([{ timestamp: new Date().toISOString(), count: counterCount }]);
    }
    setCounterActive(false);
    setCounterCount(0);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Experiment[];
        const found = parsed.find((e) => e.id === id) ?? null;
        if (found) {
          found.data ??= [];
          found.selectedStats ??= [];
          found.lastEdited ??= found.createdAt;
        }
        setExperiment(found);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Text color="$color">Loading…</Text>
      </YStack>
    );
  }

  if (!experiment) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Text color="$color">Experiment not found.</Text>
        <Button marginTop={16} onPress={() => router.back()}>
          <Text color="$color">Go back</Text>
        </Button>
      </YStack>
    );
  }

  const addEntries = async (newEntries: TimeEntry[] | EventEntry[] | OccurrenceEntry[]) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Experiment[] = raw ? (JSON.parse(raw) as Experiment[]) : [];
      const now = new Date().toISOString();
      const updated = list.map((e) =>
        e.id !== id
          ? e
          : { ...e, data: [...(e.data ?? []), ...(newEntries as typeof e.data)], lastEdited: now }
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setExperiment((prev) =>
        prev
          ? { ...prev, data: [...prev.data, ...(newEntries as typeof prev.data)] as typeof prev.data, lastEdited: now }
          : prev
      );
    } catch {
      Alert.alert('Save failed', 'Could not save entry.');
    }
  };

  const deleteEntry = async (index: number) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Experiment[] = raw ? (JSON.parse(raw) as Experiment[]) : [];
      const now = new Date().toISOString();
      const updated = list.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              data: e.data.filter((_, i) => i !== index),
              lastEdited: now,
            }
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setExperiment((prev) =>
        prev
          ? { ...prev, data: prev.data.filter((_, i) => i !== index) as typeof prev.data, lastEdited: now }
          : prev
      );
      setEditModalVisible(false);
      setSelectedEntryIndex(null);
    } catch {
      Alert.alert('Delete failed', 'Could not delete entry.');
    }
  };

  const updateEntry = async (index: number, updatedEntry: TimeEntry | EventEntry | OccurrenceEntry) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Experiment[] = raw ? (JSON.parse(raw) as Experiment[]) : [];
      const now = new Date().toISOString();
      const updated = list.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              data: e.data.map((entry, i) => (i === index ? updatedEntry : entry)),
              lastEdited: now,
            }
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setExperiment((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((entry, i) => (i === index ? updatedEntry : entry)) as typeof prev.data,
              lastEdited: now,
            }
          : prev
      );
      setEditModalVisible(false);
      setSelectedEntryIndex(null);
    } catch {
      Alert.alert('Update failed', 'Could not update entry.');
    }
  };

  const updateSelectedStats = async (selectedStats: string[]) => {
    try {
      const allowed = new Set(getStatOptions(experiment.kind).map((option) => option.id));
      const normalized = selectedStats.filter((id) => allowed.has(id));

      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Experiment[] = raw ? (JSON.parse(raw) as Experiment[]) : [];
      const now = new Date().toISOString();
      const updated = list.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              selectedStats: normalized,
              lastEdited: now,
            }
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setExperiment((prev) =>
        prev
          ? {
              ...prev,
              selectedStats: normalized,
              lastEdited: now,
            }
          : prev
      );
    } catch {
      Alert.alert('Save failed', 'Could not save statistics.');
    }
  };

  const createdAt = new Date(experiment.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
  const lastEdited = new Date(experiment.lastEdited).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(1);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatTimerDisplay = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    const cs = Math.round((secs % 1) * 100).toString().padStart(2, '0');
    return m > 0 ? `${m}:${s}.${cs}` : `${s}.${cs}`;
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${diffWeeks}w ago`;
  };

  const entryCardWidth = (cardWidth - 10) / 2;
  const statOptions = getStatOptions(experiment.kind);
  const selectedStats = Array.from(
    new Set(
      (experiment.selectedStats ?? [])
        .map((id) => {
          if (id === 'average') return 'mean';
          if (id === 'total') return 'sum';
          return id;
        })
    )
  ).filter((id) => statOptions.some((option) => option.id === id));
  const selectedStatRows = Array.from(
    { length: Math.ceil(selectedStats.length / 2) },
    (_, index) => selectedStats.slice(index * 2, index * 2 + 2)
  );

  return (
    <YStack
      flex={1}
      paddingTop={56}
      paddingHorizontal={16}
      paddingBottom={24}
      backgroundColor="$background"
    >
      <AddEntryModal
        visible={entryModalVisible}
        kind={experiment.kind}
        onClose={() => setEntryModalVisible(false)}
        onSave={addEntries}
        onStartTimer={startTimer}
        onStartCounter={startCounter}
      />

      <StatisticsPickerModal
        visible={statisticsModalVisible}
        options={statOptions}
        selectedStatIds={selectedStats}
        data={experiment.data}
        kind={experiment.kind}
        onClose={() => setStatisticsModalVisible(false)}
        onSave={updateSelectedStats}
      />

      {/* Edit Entry Modal */}
      {selectedEntryIndex !== null && experiment.data[selectedEntryIndex] && (
        <Modal transparent animationType="fade" visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setEditModalVisible(false)}
          >
            <Pressable onPress={() => {}}>
              <EditEntryModal
                entry={experiment.data[selectedEntryIndex]}
                kind={experiment.kind}
                cardWidth={cardWidth}
                onSave={(updatedEntry) => updateEntry(selectedEntryIndex, updatedEntry)}
                onDelete={() => deleteEntry(selectedEntryIndex)}
                onClose={() => setEditModalVisible(false)}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Info Modal */}
      <Modal transparent animationType="fade" visible={infoVisible} onRequestClose={() => { setInfoVisible(false); setDeleteConfirm(false); }}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => { setInfoVisible(false); setDeleteConfirm(false); }}
        >
          <Pressable onPress={() => {}}>
            <YStack
              backgroundColor="$backgroundStrong"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={16}
              padding={20}
              gap={10}
              width={cardWidth}
            >
              <Text fontSize={13} color="$colorHover">Created: {createdAt}</Text>
              <Text fontSize={13} color="$colorHover">Last edited: {lastEdited}</Text>
              {experiment.notes ? (
                <YStack gap={4} marginTop={4}>
                  <Text fontSize={13} color="$colorHover">Notes</Text>
                  <Text fontSize={15} color="$color">{experiment.notes}</Text>
                </YStack>
              ) : null}
              <Pressable
                onPress={async () => {
                  if (!deleteConfirm) {
                    setDeleteConfirm(true);
                  } else {
                    try {
                      const raw = await AsyncStorage.getItem(STORAGE_KEY);
                      const list: Experiment[] = raw ? (JSON.parse(raw) as Experiment[]) : [];
                      const updated = list.filter((e) => e.id !== id);
                      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                    } catch {
                      Alert.alert('Delete failed', 'Could not delete experiment.');
                      return;
                    }
                    setInfoVisible(false);
                    setDeleteConfirm(false);
                    router.back();
                  }
                }}
                style={{ marginTop: 8 }}
              >
                <YStack
                  marginTop={0}
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$colorDestructive"
                  borderRadius={8}
                  paddingVertical={8}
                  paddingHorizontal={20}
                >
                  <Text fontSize={13} color={deleteConfirm ? '$colorDestructive' : '$colorHover'}>
                    {deleteConfirm ? 'Are you sure?' : 'Delete'}
                  </Text>
                </YStack>
              </Pressable>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>

      <YStack alignItems="center" gap={16}>

        {/* Title row */}
        <XStack width={cardWidth} alignItems="center" justifyContent="center">
          <YStack flex={1} />
          <Text fontSize={26} fontWeight="700" color="$color" textAlign="center" flex={0}>
            {experiment.title}
          </Text>
          <YStack flex={1} alignItems="flex-end">
            <Pressable
              onPress={() => setInfoVisible(true)}
              style={{
                width: 26, height: 26, borderRadius: 13,
                borderWidth: 1, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 13, color: 'gray' }}>i</Text>
            </Pressable>
          </YStack>
        </XStack>

        {/* Kind badge */}
        <YStack
          borderWidth={1}
          borderRadius={20}
          borderColor="$borderColor"
          backgroundColor="$backgroundStrong"
          paddingHorizontal={14}
          paddingVertical={4}
        >
          <Text fontSize={13} color="$color">{experiment.kind}</Text>
        </YStack>

        {/* Currently Running */}
        {experiment.kind === 'Times' && timerActive && (
          <YStack
            width={cardWidth}
            borderWidth={1}
            borderRadius={12}
            borderColor="$borderColor"
            padding={16}
            gap={12}
            alignItems="center"
          >
            <Text fontSize={13} color="$colorHover">Currently Running</Text>
            <Text fontSize={52} fontWeight="200" color="$color">
              {formatTimerDisplay(timerElapsed)}
            </Text>
            <XStack gap={12}>
              <Button
                onPress={timerRunning ? pauseTimer : () => setTimerRunning(true)}
                borderWidth={1}
                borderRadius={12}
                borderColor="$borderColor"
                backgroundColor="$background"
                paddingHorizontal={20}
              >
                <Text color="$color">{timerRunning ? 'Pause' : 'Resume'}</Text>
              </Button>
              <Button
                onPress={finishTimer}
                borderWidth={1}
                borderRadius={12}
                borderColor="$borderColor"
                backgroundColor="$backgroundStrong"
                paddingHorizontal={20}
              >
                <Text color="$color">Finish</Text>
              </Button>
            </XStack>
          </YStack>
        )}

        {/* Counter Running */}
        {experiment.kind === 'Events' && counterActive && (
          <YStack
            width={cardWidth}
            borderWidth={1}
            borderRadius={12}
            borderColor="$borderColor"
            padding={16}
            gap={12}
            alignItems="center"
          >
            <Text fontSize={13} color="$colorHover">Counter</Text>
            <Text fontSize={52} fontWeight="200" color="$color">
              {counterCount}
            </Text>
            <XStack alignItems="center" gap={28} justifyContent="center">
              <Button
                onPress={() => setCounterCount((c) => Math.max(0, c - 1))}
                borderWidth={1}
                borderRadius={999}
                width={44}
                height={44}
                borderColor="$borderColor"
                backgroundColor="$backgroundStrong"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="$color" fontSize={22}>−</Text>
              </Button>
              <Button
                onPress={() => setCounterCount((c) => c + 1)}
                borderWidth={1}
                borderRadius={999}
                width={44}
                height={44}
                borderColor="$borderColor"
                backgroundColor="$backgroundStrong"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="$color" fontSize={22}>+</Text>
              </Button>
            </XStack>
            <Button
              onPress={finishCounter}
              borderWidth={1}
              borderRadius={12}
              borderColor="$borderColor"
              backgroundColor="$backgroundStrong"
              paddingHorizontal={40}
            >
              <Text color="$color">Finish</Text>
            </Button>
          </YStack>
        )}
      </YStack>

      <XStack width={cardWidth} alignSelf="center" alignItems="center" justifyContent="space-between" paddingTop={12}>
        <Text fontSize={20} fontWeight="700" color="$color">Statistics</Text>
        <Button
          onPress={() => setStatisticsModalVisible(true)}
          borderWidth={1}
          width={34}
          height={34}
          borderRadius={17}
          borderColor="$borderColor"
          backgroundColor="$backgroundStrong"
          alignItems="center"
          justifyContent="center"
          paddingHorizontal={0}
        >
          <Text color="$color" fontSize={18}>+</Text>
        </Button>
      </XStack>

      <YStack width={cardWidth} alignSelf="center" gap={10} paddingTop={8}>
        {selectedStats.length === 0 ? (
          <YStack
            borderWidth={1}
            borderRadius={12}
            borderColor="$borderColor"
            borderStyle="dashed"
            padding={20}
            alignItems="center"
          >
            <Text fontSize={14} color="$colorHover">No statistics yet.</Text>
          </YStack>
        ) : (
          <YStack
            width={cardWidth}
            borderWidth={1}
            borderRadius={12}
            borderColor="$borderColor"
            backgroundColor="$backgroundStrong"
            paddingHorizontal={10}
          >
            {selectedStatRows.map((row, rowIndex) => {
              const isLastRow = rowIndex === selectedStatRows.length - 1;
              const leftStat = statOptions.find((option) => option.id === row[0]);
              const rightStat = row[1] ? statOptions.find((option) => option.id === row[1]) : null;
              return (
                <XStack
                  key={`stat-row-${rowIndex}`}
                  width="100%"
                  alignItems="center"
                  paddingVertical={9}
                  borderBottomWidth={isLastRow ? 0 : 1}
                  borderBottomColor="$borderColor"
                >
                  {rightStat ? (
                    <>
                      <XStack width="48%" alignItems="center" justifyContent="space-between" gap={8}>
                        <Text fontSize={13} color="$colorHover" numberOfLines={1}>{leftStat?.label}</Text>
                        <Text fontSize={13} color="$color">{formatStatDisplay(row[0], experiment.data, experiment.kind)}</Text>
                      </XStack>
                      <YStack width={1} alignSelf="stretch" backgroundColor="$borderColor" marginHorizontal={8} />
                      <XStack width="48%" alignItems="center" justifyContent="space-between" gap={8}>
                        <Text fontSize={13} color="$colorHover" numberOfLines={1}>{rightStat.label}</Text>
                        <Text fontSize={13} color="$color">{formatStatDisplay(row[1], experiment.data, experiment.kind)}</Text>
                      </XStack>
                    </>
                  ) : (
                    <XStack width="100%" alignItems="center" justifyContent="center">
                      <YStack width={1} alignSelf="stretch" backgroundColor="$borderColor" marginHorizontal={8} />
                      <XStack width="48%" alignItems="center" justifyContent="space-between" gap={8}>
                        <Text fontSize={13} color="$colorHover" numberOfLines={1}>{leftStat?.label}</Text>
                        <Text fontSize={13} color="$color">{formatStatDisplay(row[0], experiment.data, experiment.kind)}</Text>
                      </XStack>
                      <YStack width={1} alignSelf="stretch" backgroundColor="$borderColor" marginHorizontal={8} />
                    </XStack>
                  )}
                </XStack>
              );
            })}
          </YStack>
        )}
      </YStack>

      <Text fontSize={20} fontWeight="700" color="$color" textAlign="center" paddingTop={12}>Data</Text>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack alignItems="center" gap={16}>
          {/* Data */}
          <YStack width={cardWidth} gap={10}>
            {experiment.data.length === 0 ? (
              <YStack
                borderWidth={1}
                borderRadius={12}
                borderColor="$borderColor"
                borderStyle="dashed"
                padding={20}
                alignItems="center"
              >
                <Text fontSize={14} color="$colorHover">No entries yet.</Text>
              </YStack>
            ) : (
              <XStack width={cardWidth} flexWrap="wrap" gap={10}>
                {[...experiment.data].reverse().map((entry, i) => {
                  const originalIndex = experiment.data.length - 1 - i;
                  return (
                    <Button
                      key={i}
                      width={entryCardWidth}
                      backgroundColor="$backgroundStrong"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius={12}
                      padding={12}
                      onPress={() => {
                        setSelectedEntryIndex(originalIndex);
                        setEditModalVisible(true);
                      }}
                    >
                      <YStack gap={4}>
                        <Text fontSize={12} color="$colorHover">
                          {formatRelativeTime(entry.timestamp)}
                        </Text>
                        {'duration' in entry && (
                          <Text fontSize={14} color="$color">Duration: {formatDuration(entry.duration)}</Text>
                        )}
                        {'count' in entry && (
                          <Text fontSize={14} color="$color">Count: {entry.count}</Text>
                        )}
                        {!('duration' in entry) && !('count' in entry) && (
                          <Text fontSize={14} color="$color">Occurred</Text>
                        )}
                      </YStack>
                    </Button>
                  );
                })}
              </XStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      <YStack alignItems="center" paddingTop={12}>
        <Button
          onPress={() => setEntryModalVisible(true)}
          borderWidth={1}
          width={50}
          height={50}
          borderRadius={25}
          borderColor="$borderColor"
          backgroundColor="$backgroundStrong"
          alignItems="center"
          justifyContent="center"
        >
          <Text>+</Text>
        </Button>
      </YStack>
    </YStack>
  );
}
