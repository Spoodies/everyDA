import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui';
import { AddEntryModal } from '../../components/AddEntryModal';
import type { EventEntry, Experiment, TimeEntry } from '../../types/experiment';
import { STORAGE_KEY } from '../../types/experiment';

export default function ExperimentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.8;

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [entryModalVisible, setEntryModalVisible] = useState(false);

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStartRef = useRef<number>(0);
  const timerAccumRef = useRef<number>(0);
  const timerActive = timerRunning || timerElapsed > 0;

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

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Experiment[];
        const found = parsed.find((e) => e.id === id) ?? null;
        if (found) {
          found.data ??= [];
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

  const addEntries = async (newEntries: TimeEntry[] | EventEntry[]) => {
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
          ? { ...prev, data: [...prev.data, ...(newEntries as typeof prev.data)], lastEdited: now }
          : prev
      );
      setEntryModalVisible(false);
    } catch {
      Alert.alert('Save failed', 'Could not save entry.');
    }
  };

  const createdAt = new Date(experiment.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const lastEdited = new Date(experiment.lastEdited).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
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
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack alignItems="center" gap={16}>

          {/* Title */}
          <Text fontSize={26} fontWeight="700" color="$color" textAlign="center">
            {experiment.title}
          </Text>

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

          {/* Dates */}
          <YStack width={cardWidth} gap={4}>
            <Text fontSize={12} color="$colorHover">Created: {createdAt}</Text>
            <Text fontSize={12} color="$colorHover">Last edited: {lastEdited}</Text>
          </YStack>

          {/* Notes */}
          {experiment.notes ? (
            <YStack
              width={cardWidth}
              borderWidth={1}
              borderRadius={12}
              borderColor="$borderColor"
              padding={14}
              gap={6}
            >
              <Text fontSize={13} color="$colorHover">Notes</Text>
              <Text fontSize={15} color="$color">{experiment.notes}</Text>
            </YStack>
          ) : null}

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

          {/* Data */}
          <YStack width={cardWidth} gap={10}>
            <Text fontSize={13} color="$colorHover">Data</Text>
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
              experiment.data.map((entry, i) => (
                <YStack
                  key={i}
                  borderWidth={1}
                  borderRadius={12}
                  borderColor="$borderColor"
                  padding={12}
                >
                  <Text fontSize={12} color="$colorHover">
                    {new Date(entry.timestamp).toLocaleString()}
                  </Text>
                  {'duration' in entry && (
                    <Text fontSize={14} color="$color">Duration: {formatDuration(entry.duration)}</Text>
                  )}
                  {'label' in entry && entry.label ? (
                    <Text fontSize={14} color="$color">{entry.label}</Text>
                  ) : null}
                </YStack>
              ))
            )}
          </YStack>

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
      </ScrollView>
    </YStack>
  );
}
